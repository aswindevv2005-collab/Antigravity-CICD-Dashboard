import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Box, TestTube, Cloud, Check, X, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const STAGES = [
  { id: 'build', name: 'Build', icon: Box },
  { id: 'test', name: 'Test', icon: TestTube },
  { id: 'deploy', name: 'Deploy', icon: Cloud }
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [status, setStatus] = useState('idle'); // idle, running, success, failed
  const [stages, setStages] = useState(STAGES.map(s => ({ ...s, state: 'idle' })));
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pipelineId) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on(`pipeline_update_${pipelineId}`, (data: any) => {
      setLogs(data.logs);
      setStatus(data.status);
      setStages(prev => prev.map(s => ({
        ...s,
        state: data.stages[s.id] || 'idle'
      })));
    });

    return () => { newSocket.close(); };
  }, [pipelineId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleLaunch = async () => {
    if (!repoUrl || status === 'running') return;
    setStatus('running');
    setLogs(['[SYSTEM] Initializing GitHub Actions connection...']);
    setStages(STAGES.map(s => ({ ...s, state: 'idle' })));

    try {
      const res = await axios.post('http://localhost:5000/api/pipeline', { repoUrl });
      setPipelineId(res.data.pipelineId);
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] ${err.response?.data?.error || err.message}`]);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="z-10 w-full max-w-4xl flex flex-col gap-8">
        <motion.div className="bg-[#111116] border border-[#222233] rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
              GitHub Actions Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Trigger Real CI/CD Workflows via API</p>
          </div>
          <div className="w-full max-w-xl flex gap-4 mt-4">
            <input 
              type="text" 
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              className="flex-1 bg-[#0a0a0f] border border-[#333344] focus:border-purple-500 rounded-xl px-5 py-4 outline-none text-white transition-all"
              placeholder="https://github.com/owner/repo"
            />
            <button 
              onClick={handleLaunch}
              disabled={status === 'running' || !repoUrl}
              className={`px-8 rounded-xl font-bold flex items-center gap-2 transition-all ${
                status === 'running' ? 'bg-purple-600/50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              {status === 'running' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
              {status === 'running' ? 'Dispatching...' : 'Trigger Workflow'}
            </button>
          </div>
        </motion.div>

        <div className="flex items-center justify-between relative px-8 py-4">
          <div className="absolute top-1/2 left-16 right-16 h-1 bg-[#222233] -translate-y-1/2 z-0 rounded-full" />
          {stages.map((stage) => {
            const Icon = stage.icon;
            let bgColor = 'bg-[#111116] border-[#333344] text-gray-500';
            if (stage.state === 'running') bgColor = 'bg-blue-900/40 border-blue-500 text-blue-400 animate-pulse';
            if (stage.state === 'success') bgColor = 'bg-green-900/40 border-green-500 text-green-400';
            if (stage.state === 'error') bgColor = 'bg-red-900/40 border-red-500 text-red-400';

            return (
              <div key={stage.id} className={`z-10 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 ${bgColor}`}>
                {stage.state === 'success' ? <Check className="w-8 h-8" /> : stage.state === 'error' ? <X className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                <span className="text-xs font-bold uppercase">{stage.name}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-[#0c0c10] border border-[#222233] rounded-2xl overflow-hidden flex flex-col h-80">
          <div className="bg-[#111116] px-6 py-3 border-b border-[#222233] flex items-center">
            <span className="text-sm font-mono text-purple-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              REAL-TIME GITHUB ACTIONS LOGS
            </span>
          </div>
          <div className="p-6 font-mono text-sm overflow-y-auto flex-1 space-y-2 text-gray-300">
            {logs.length === 0 ? <span className="opacity-50">Waiting to trigger workflow...</span> : logs.map((log, i) => (
              <div key={i} className={`${log.includes('ERROR') ? 'text-red-400' : ''} ${log.includes('SUCCESS') ? 'text-green-400' : ''}`}>
                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
