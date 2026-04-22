"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Play, Code2, Box, TestTube, Rocket, Check, Loader2, X, GitBranch } from 'lucide-react';

export default function PipelinePage() {
  const { executions, triggerPipeline } = useAppContext();
  
  const [repoUrl, setRepoUrl] = useState('https://github.com/octocat/Hello-World.git');
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const activeExecution = executions.find(e => e.id === activeExecutionId) || executions[0];

  const handleTrigger = async () => {
    if (isRunning || !repoUrl) return;
    setIsRunning(true);
    
    // We can define custom steps here for the backend to run!
    const steps = [
      { name: 'Build', command: 'npm install --no-fund --no-audit || echo "No dependencies to install"' },
      { name: 'Test', command: 'npm test || echo "No tests configured"' },
      { name: 'Deploy', command: 'echo "Deploying to Mock Production Environment... Done."' }
    ];

    const newId = await triggerPipeline(repoUrl, steps);
    setActiveExecutionId(newId);
    
    // We unlock the button after a while, or let the polling handle it.
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  const getStageIcon = (name: string) => {
    switch(name.toLowerCase()) {
      case 'source': return Code2;
      case 'build': return Box;
      case 'test': return TestTube;
      case 'deploy': return Rocket;
      default: return Box;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Git Repository URL</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GitBranch className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username/repo.git"
              required
            />
          </div>
        </div>
        <button 
          onClick={handleTrigger}
          disabled={isRunning || !repoUrl}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg whitespace-nowrap h-[46px] ${
            isRunning || !repoUrl
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25'
          }`}
        >
          {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
          Run Pipeline
        </button>
      </div>

      {activeExecution && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              {activeExecution.stages.map((stage, idx) => {
                const Icon = getStageIcon(stage.name);
                const isProcessing = stage.status === 'Processing';
                const isSuccess = stage.status === 'Success';
                const isFailed = stage.status === 'Failed';
                
                return (
                  <React.Fragment key={stage.id}>
                    <div className="flex flex-col items-center flex-1 w-full relative">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 z-10 ${
                        isSuccess ? 'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                        isFailed ? 'bg-red-500/10 border-2 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                        isProcessing ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                        'bg-slate-800 border-2 border-slate-700 text-slate-500'
                      }`}>
                        {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : 
                        isSuccess ? <Check className="w-8 h-8" /> :
                        isFailed ? <X className="w-8 h-8" /> :
                        <Icon className="w-8 h-8" />}
                      </div>
                      <h3 className={`font-semibold text-center ${
                        isSuccess ? 'text-emerald-400' :
                        isFailed ? 'text-red-400' :
                        isProcessing ? 'text-blue-400' :
                        'text-slate-400'
                      }`}>{stage.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stage.status}</p>
                    </div>

                    {idx < activeExecution.stages.length - 1 && (
                      <div className="hidden md:block w-full h-1 bg-slate-800 flex-1 relative rounded-full mx-2 overflow-hidden">
                        {(isSuccess) && (
                          <div className="absolute inset-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        )}
                        {isProcessing && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-transparent w-1/2 animate-[slide_2s_linear_infinite]"></div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0c1017] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                </span>
                <span className="ml-2 text-sm font-mono text-slate-400">Live Terminal - Exec #{activeExecution.id}</span>
              </div>
            </div>
            <div className="p-4 h-[400px] overflow-y-auto font-mono text-sm space-y-4">
              {activeExecution.stages.map((stage) => (
                <div key={stage.id} className="space-y-1">
                  <div className="text-blue-400 font-bold">--- {stage.name.toUpperCase()} STAGE ---</div>
                  <pre className="whitespace-pre-wrap break-words text-slate-300 font-mono text-xs">
                    {stage.logs}
                  </pre>
                </div>
              ))}
              {activeExecution.status === 'Processing' && (
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="animate-pulse">_</span> waiting for output...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
