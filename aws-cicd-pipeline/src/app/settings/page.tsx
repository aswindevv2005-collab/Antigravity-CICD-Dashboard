"use client";

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Shield, Key, UserCheck, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAppContext();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          IAM Settings & Security
        </h1>
        <p className="text-slate-400 mt-1">Manage AWS Identity and Access Management (IAM) simulation settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Current Session Profile
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email / Username</label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300">
                  {user.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Assigned IAM Role</label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">{user.role}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Session Token</label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 font-mono text-xs text-slate-500 break-all">
                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIy...
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Permission Policies (Simulated)
            </h2>
            <div className="bg-[#0c1017] border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
              <pre className="text-emerald-400">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codepipeline:StartPipelineExecution",
        "codepipeline:GetPipelineExecution",
        "codepipeline:GetPipelineState"
      ],
      "Resource": "arn:aws:codepipeline:us-east-1:123456789012:MyDemoPipeline"
    },
    {
      "Effect": "${user.role === 'Admin' || user.role === 'DevOps Engineer' ? 'Allow' : 'Deny'}",
      "Action": [
        "iam:PassRole",
        "codedeploy:CreateDeployment"
      ],
      "Resource": "*"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">RBAC Overview</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${user.role === 'Developer' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-slate-700'}`}></div>
                <div>
                  <p className={`font-medium ${user.role === 'Developer' ? 'text-blue-400' : 'text-slate-400'}`}>Developer</p>
                  <p className="text-xs text-slate-500 mt-1">Can trigger pipelines and view logs.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${user.role === 'DevOps Engineer' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-slate-700'}`}></div>
                <div>
                  <p className={`font-medium ${user.role === 'DevOps Engineer' ? 'text-purple-400' : 'text-slate-400'}`}>DevOps Engineer</p>
                  <p className="text-xs text-slate-500 mt-1">Manage infrastructure, edit pipeline stages.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${user.role === 'Admin' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-slate-700'}`}></div>
                <div>
                  <p className={`font-medium ${user.role === 'Admin' ? 'text-red-400' : 'text-slate-400'}`}>Admin</p>
                  <p className="text-xs text-slate-500 mt-1">Full access including IAM management.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
