"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Developer' | 'DevOps Engineer' | 'Admin';

export interface User {
  email: string;
  role: Role;
}

export type PipelineStatus = 'Pending' | 'Processing' | 'Success' | 'Failed';

export interface PipelineStage {
  id: number;
  pipeline_id: string;
  name: string;
  status: PipelineStatus;
  logs: string;
}

export interface PipelineExecution {
  id: string;
  repo_url: string;
  created_at: string;
  status: PipelineStatus;
  stages: PipelineStage[];
}

interface AppContextType {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
  executions: PipelineExecution[];
  fetchExecutions: () => Promise<void>;
  triggerPipeline: (repoUrl: string, steps: {name: string, command: string}[]) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [executions, setExecutions] = useState<PipelineExecution[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cicd_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    fetchExecutions();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchExecutions, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchExecutions = async () => {
    try {
      const res = await fetch('/api/pipeline');
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
      }
    } catch (e) {
      console.error('Failed to fetch executions', e);
    }
  };

  const login = (email: string, role: Role) => {
    const newUser = { email, role };
    setUser(newUser);
    localStorage.setItem('cicd_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cicd_user');
  };

  const triggerPipeline = async (repoUrl: string, steps: {name: string, command: string}[]) => {
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, steps })
    });
    const data = await res.json();
    await fetchExecutions();
    return data.pipelineId;
  };

  return (
    <AppContext.Provider value={{ user, login, logout, executions, fetchExecutions, triggerPipeline }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
