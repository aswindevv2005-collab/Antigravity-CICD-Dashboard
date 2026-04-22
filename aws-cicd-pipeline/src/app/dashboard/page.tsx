"use client";

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Activity, CheckCircle2, XCircle, Clock, Server, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { executions } = useAppContext();

  const total = executions.length;
  const successful = executions.filter(e => e.status === 'Success').length;
  const failed = executions.filter(e => e.status === 'Failed').length;
  const processing = executions.filter(e => e.status === 'Processing').length;

  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your AWS Native Services CI/CD environment.</p>
        </div>
        <Link 
          href="/pipeline" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Activity className="w-4 h-4" />
          Trigger New Pipeline
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Total Deployments</h3>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{total}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Success Rate</h3>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-white">{successRate}%</div>
            <span className="text-emerald-400 text-sm mb-1 font-medium">{successful} successful</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Failed Pipelines</h3>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{failed}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">In Progress</h3>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{processing}</div>
        </div>
      </div>

      {/* Recent Executions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent Pipeline Executions</h2>
          <Link href="/logs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View All Logs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-sm">
                <th className="p-4 font-medium border-b border-slate-800">Execution ID</th>
                <th className="p-4 font-medium border-b border-slate-800">Date & Time</th>
                <th className="p-4 font-medium border-b border-slate-800">Status</th>
                <th className="p-4 font-medium border-b border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No pipeline executions found. Trigger a pipeline to see results here.
                  </td>
                </tr>
              ) : (
                executions.slice(0, 5).map((exec) => (
                  <tr key={exec.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono text-sm text-slate-300">#{exec.id}</td>
                    <td className="p-4 text-sm text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {new Date(exec.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        exec.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        exec.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        exec.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {exec.status === 'Processing' && <Activity className="w-3 h-3 animate-pulse" />}
                        {exec.status === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                        {exec.status === 'Failed' && <XCircle className="w-3 h-3" />}
                        {exec.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href="/logs" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
