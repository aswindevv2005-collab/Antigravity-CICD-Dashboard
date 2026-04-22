import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Box, TestTube, Cloud, Check, X, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const STAGES = [
  { id: 'build', name: 'Build', icon: Box },
  { id: 'test', name: 'Test', icon: TestTube },
  { id: 'deploy', name: 'Deploy', icon: Cloud }
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/example/repo.git');
  const [status, setStatus] = useState('idle'); // idle, running, success, error
  const [stages, setStages] = useState(STAGES.map(s => ({ ...s, state: 'idle' })));
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('log', (data: string) => {
      setLogs(prev => [...prev, data]);
    });

    newSocket.on('stage_update', ({ id, state }: { id: string, state: string }) => {
      setStages(prev => prev.map(s => s.id === id ? { ...s, state } : s));
    });

    newSocket.on('pipeline_complete', ({ success }: { success: boolean }) => {
      setStatus(success ? 'success' : 'error');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleLaunch = async () => {
    if (!repoUrl || status === 'running') return;
    
    setStatus('running');
    setLogs(['[SYSTEM] Anti-gravity engine engaged...', '[SYSTEM] Connecting to repository...']);
    setStages(STAGES.map(s => ({ ...s, state: 'idle' })));

    try {
      const res = await fetch(`${BACKEND_URL}/api/pipeline/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });
      if (!res.ok) throw new Error('Failed to start pipeline');
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background stars / dust */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" 
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 5}s linear infinite`
            }} 
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col gap-10">
        
        {/* Header & Input section */}
        <motion.div 
          className="anti-gravity-card p-8 flex flex-col items-center gap-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
              Anti-Gravity CI/CD
            </h1>
            <p className="text-[#888899] mt-2">Zero friction. Effortless deployments.</p>
          </div>

          <div className="w-full max-w-xl flex gap-4 mt-4 relative">
            <input 
              type="text" 
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              className="flex-1 bg-[#0a0a15] border border-[#333344] focus:border-purple-500 rounded-xl px-5 py-4 outline-none text-white transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              placeholder="Enter GitHub Repository URL"
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLaunch}
              disabled={status === 'running'}
              className={`px-8 rounded-xl font-bold flex items-center gap-2 transition-all neon-border ${
                status === 'running' 
                  ? 'bg-purple-600/50 cursor-not-allowed opacity-80' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]'
              }`}
            >
              {status === 'running' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
              {status === 'running' ? 'Lifting Off...' : 'Launch Pipeline'}
            </motion.button>
          </div>
        </motion.div>

        {/* Pipeline Nodes Visualization */}
        <div className="flex items-center justify-between relative px-8 py-4">
          {/* Connecting Lines */}
          <div className="absolute top-1/2 left-16 right-16 h-1 bg-[#222233] -translate-y-1/2 z-0 rounded-full overflow-hidden">
            <AnimatePresence>
              {status === 'running' && (
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
                />
              )}
            </AnimatePresence>
          </div>

          {stages.map((stage, i) => {
            const Icon = stage.icon;
            let bgColor = 'bg-[#111122] border-[#333344] text-slate-400';
            let shadow = '';
            let animation = {};

            if (stage.state === 'running') {
              bgColor = 'bg-blue-500/20 border-blue-500 text-blue-400';
              shadow = 'shadow-[0_0_30px_rgba(59,130,246,0.5)]';
              animation = { y: [-5, 5, -5], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } };
            } else if (stage.state === 'success') {
              bgColor = 'bg-green-500/20 border-green-500 text-green-400';
              shadow = 'shadow-[0_0_30px_rgba(16,185,129,0.4)]';
              if (status === 'success') animation = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } };
            } else if (stage.state === 'error') {
              bgColor = 'bg-red-500/20 border-red-500 text-red-400';
              shadow = 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
              animation = { x: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } };
            }

            return (
              <motion.div 
                key={stage.id}
                animate={animation}
                className={`z-10 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 backdrop-blur-md transition-colors duration-500 ${bgColor} ${shadow}`}
              >
                {stage.state === 'success' ? <Check className="w-8 h-8" /> : 
                 stage.state === 'error' ? <X className="w-8 h-8" /> :
                 <Icon className="w-8 h-8" />}
                <span className="text-xs font-bold uppercase tracking-wider">{stage.name}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Live Logs Panel */}
        <motion.div 
          className="anti-gravity-card overflow-hidden flex flex-col h-80"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-[#0c0c16] px-6 py-3 border-b border-[#333344] flex items-center justify-between">
            <span className="text-sm font-mono text-purple-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              LIVE TELEMETRY FEED
            </span>
          </div>
          <div className="p-6 font-mono text-sm overflow-y-auto flex-1 space-y-2 text-[#aab]">
            {logs.length === 0 ? (
              <span className="opacity-50">Waiting for launch sequence...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`
                  ${log.includes('ERROR') || log.includes('FAILED') ? 'text-red-400' : ''}
                  ${log.includes('SUCCESS') ? 'text-green-400' : ''}
                  ${log.includes('SYSTEM') ? 'text-blue-400' : ''}
                `}>
                  <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
