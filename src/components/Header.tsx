import React from 'react';
import { Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 py-4 px-6 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">AI Product Image Editor</h1>
            <p className="text-xs text-slate-400">Professional AI background removal</p>
          </div>
        </div>
      </div>
    </header>
  );
};
