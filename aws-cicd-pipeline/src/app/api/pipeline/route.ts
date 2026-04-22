import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// Background execution handler
async function runPipelineStage(
  pipelineId: string, 
  stageName: string, 
  command: string, 
  cwd: string
): Promise<boolean> {
  const db = await getDb();
  
  // Insert stage if not exists
  let stage = await db.get('SELECT * FROM stages WHERE pipeline_id = ? AND name = ?', [pipelineId, stageName]);
  if (!stage) {
    const result = await db.run('INSERT INTO stages (pipeline_id, name, status, logs) VALUES (?, ?, ?, ?)', [pipelineId, stageName, 'Processing', `Starting ${stageName}...\n`]);
    stage = { id: result.lastID, pipeline_id: pipelineId, name: stageName, status: 'Processing', logs: `Starting ${stageName}...\n` };
  } else {
    await db.run('UPDATE stages SET status = ?, logs = logs || ? WHERE id = ?', ['Processing', `\nStarting ${stageName}...\n`, stage.id]);
  }

  const appendLog = async (text: string) => {
    await db.run('UPDATE stages SET logs = logs || ? WHERE id = ?', [text, stage.id]);
  };

  return new Promise((resolve) => {
    appendLog(`$ ${command}\n`);
    const child = exec(command, { cwd });

    child.stdout?.on('data', async (data) => {
      await appendLog(data.toString());
    });

    child.stderr?.on('data', async (data) => {
      await appendLog(data.toString());
    });

    child.on('close', async (code) => {
      if (code === 0) {
        await appendLog(`\n[SUCCESS] ${stageName} completed.\n`);
        await db.run('UPDATE stages SET status = ? WHERE id = ?', ['Success', stage.id]);
        resolve(true);
      } else {
        await appendLog(`\n[ERROR] ${stageName} failed with exit code ${code}.\n`);
        await db.run('UPDATE stages SET status = ? WHERE id = ?', ['Failed', stage.id]);
        resolve(false);
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { repoUrl, steps } = await req.json();
    if (!repoUrl) return NextResponse.json({ error: 'repoUrl is required' }, { status: 400 });

    const db = await getDb();
    const pipelineId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Insert pipeline record
    await db.run('INSERT INTO pipelines (id, repo_url, status) VALUES (?, ?, ?)', [pipelineId, repoUrl, 'Processing']);

    // Setup workspace
    const workspaceDir = path.join(process.cwd(), 'workspace', pipelineId);
    await fs.mkdir(workspaceDir, { recursive: true });

    // Kick off pipeline asynchronously (don't await)
    (async () => {
      try {
        // Stage 1: Clone
        const cloneSuccess = await runPipelineStage(pipelineId, 'Source', `git clone ${repoUrl} .`, workspaceDir);
        if (!cloneSuccess) throw new Error('Source stage failed');

        // Execute dynamic steps if provided
        const pipelineSteps = steps || [
          { name: 'Build', command: 'npm install || echo "No package.json found"' },
          { name: 'Test', command: 'npm test || echo "No tests defined"' },
          { name: 'Deploy', command: 'echo "Deploying to production..."' }
        ];

        for (const step of pipelineSteps) {
          const success = await runPipelineStage(pipelineId, step.name, step.command, workspaceDir);
          if (!success) throw new Error(`${step.name} stage failed`);
        }

        await db.run('UPDATE pipelines SET status = ? WHERE id = ?', ['Success', pipelineId]);
      } catch (err: any) {
        await db.run('UPDATE pipelines SET status = ? WHERE id = ?', ['Failed', pipelineId]);
      }
    })();

    return NextResponse.json({ pipelineId, status: 'Started' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const db = await getDb();
  const pipelines = await db.all('SELECT * FROM pipelines ORDER BY created_at DESC LIMIT 50');
  
  for (const p of pipelines) {
    p.stages = await db.all('SELECT * FROM stages WHERE pipeline_id = ? ORDER BY id ASC', [p.id]);
  }

  return NextResponse.json(pipelines);
}
