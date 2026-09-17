import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 py-4 px-6 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">AI Product Image Editor</h1>
            </div>
            <p className="text-xs text-slate-400">
              Remove background, edit colors, and export studio-quality product photos
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Automatic Background Removal
          </span>
        </div>
      </div>
    </header>
  );
};
