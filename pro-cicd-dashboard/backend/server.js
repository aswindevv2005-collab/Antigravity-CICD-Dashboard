require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { Octokit } = require('octokit');
const { Queue, Worker } = require('bullmq');
const Pipeline = require('./models/Pipeline');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cicd', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// GitHub Octokit Auth
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Redis connection details for BullMQ
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};

// Pipeline Queue
const pipelineQueue = new Queue('pipeline-queue', { connection });

// Controllers / Routes
app.post('/api/pipeline', async (req, res) => {
  const { repoUrl, workflowId, branch = 'main' } = req.body;
  if (!repoUrl) return res.status(400).json({ error: 'Repository URL is required' });

  // Extract owner and repo from URL (e.g., https://github.com/owner/repo)
  const parts = repoUrl.split('/');
  const repoName = parts.pop().replace('.git', '');
  const owner = parts.pop();

  try {
    const pipeline = new Pipeline({ repoUrl, owner, repo: repoName });
    await pipeline.save();

    await pipelineQueue.add('trigger-github-action', {
      pipelineId: pipeline._id,
      owner,
      repo: repoName,
      workflowId: workflowId || 'ci.yml', // Assumes ci.yml is the default workflow
      branch
    });

    res.status(201).json({ message: 'Pipeline triggered', pipelineId: pipeline._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to queue pipeline', details: err.message });
  }
});

app.get('/api/pipeline/:id', async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// BullMQ Worker to handle jobs
const worker = new Worker('pipeline-queue', async job => {
  const { pipelineId, owner, repo, workflowId, branch } = job.data;
  const pipeline = await Pipeline.findById(pipelineId);
  
  try {
    pipeline.status = 'running';
    pipeline.logs.push(`[SYSTEM] Dispatching workflow ${workflowId} to ${owner}/${repo} on branch ${branch}...`);
    await pipeline.save();
    io.emit(`pipeline_update_${pipelineId}`, pipeline);

    // 1. Trigger GitHub Workflow
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref: branch,
    });

    pipeline.logs.push(`[SYSTEM] Workflow dispatched successfully. Waiting for run ID...`);
    await pipeline.save();
    io.emit(`pipeline_update_${pipelineId}`, pipeline);

    // Wait a few seconds for GitHub to register the run
    await new Promise(r => setTimeout(r, 5000));

    // 2. Fetch the latest run for this workflow
    const runs = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowId,
      per_page: 1
    });

    if (runs.data.workflow_runs.length === 0) {
      throw new Error('No workflow runs found after dispatch');
    }

    const run = runs.data.workflow_runs[0];
    pipeline.githubRunId = run.id;
    pipeline.logs.push(`[SYSTEM] Found GitHub Run ID: ${run.id}. Tracking progress...`);
    await pipeline.save();
    io.emit(`pipeline_update_${pipelineId}`, pipeline);

    // 3. Poll for completion
    let status = run.status;
    let conclusion = run.conclusion;
    
    while (status !== 'completed') {
      await new Promise(r => setTimeout(r, 10000)); // Poll every 10s
      const currentRun = await octokit.rest.actions.getWorkflowRun({ owner, repo, run_id: run.id });
      status = currentRun.data.status;
      conclusion = currentRun.data.conclusion;
      
      // We could fetch job logs here incrementally if desired
      pipeline.logs.push(`[GITHUB] Status: ${status}...`);
      io.emit(`pipeline_update_${pipelineId}`, pipeline);
    }

    if (conclusion === 'success') {
      pipeline.status = 'success';
      pipeline.stages = { build: 'success', test: 'success', deploy: 'success' };
      pipeline.logs.push(`[SUCCESS] Workflow completed successfully!`);
    } else {
      pipeline.status = 'failed';
      pipeline.logs.push(`[ERROR] Workflow failed with conclusion: ${conclusion}`);
    }

    await pipeline.save();
    io.emit(`pipeline_update_${pipelineId}`, pipeline);

  } catch (err) {
    pipeline.status = 'failed';
    pipeline.logs.push(`[SYSTEM ERROR] ${err.message}`);
    await pipeline.save();
    io.emit(`pipeline_update_${pipelineId}`, pipeline);
    throw err;
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
