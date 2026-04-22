"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ScrollText, Search, Filter, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function LogsPage() {
  const { executions } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-blue-500" />
          CloudWatch Logs
        </h1>
        <p className="text-slate-400 mt-1">Detailed execution logs across all pipeline stages.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search execution ID or log output..."
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filter Logs
        </button>
      </div>

      <div className="space-y-4">
        {executions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
            No logs available. Run a pipeline to generate logs.
          </div>
        ) : (
          executions.map((exec) => (
            <div key={exec.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200">
              <button 
                onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    exec.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' :
                    exec.status === 'Failed' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {exec.status === 'Success' ? <CheckCircle2 className="w-5 h-5" /> : 
                     exec.status === 'Failed' ? <AlertCircle className="w-5 h-5" /> : 
                     <ScrollText className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-slate-200">Execution #{exec.id}</h3>
                    <p className="text-xs text-slate-500">{new Date(exec.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                    exec.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' :
                    exec.status === 'Failed' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>{exec.status}</span>
                  {expandedId === exec.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </div>
              </button>
              
              {expandedId === exec.id && (
                <div className="p-4 bg-[#0c1017] border-t border-slate-800 font-mono text-sm max-h-[400px] overflow-y-auto space-y-4">
                  {exec.stages.map((stage) => (
                    <div key={stage.id} className="space-y-1">
                      <div className="text-slate-400 border-b border-slate-800/50 pb-1 mb-2 font-semibold">
                        &gt; {stage.name} Stage
                      </div>
                      {stage.logs ? (
                        <pre className="whitespace-pre-wrap break-words text-slate-300 font-mono text-xs mt-2">
                          {stage.logs}
                        </pre>
                      ) : (
                        <div className="text-slate-600 italic">No logs available for this stage.</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
