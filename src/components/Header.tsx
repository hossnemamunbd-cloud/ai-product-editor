import React from 'react';
import { Layers, Terminal, Download, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenWindows7Guide: () => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWindows7Guide, onDownloadZip }) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 py-4 px-6 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">AI Background Remover</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Free MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Open-source U²-Net pretrained model &bull; Zero paid APIs &bull; Windows 7 ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="win7-guide-btn"
            onClick={onOpenWindows7Guide}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Windows 7 Python Setup</span>
          </button>
          <button
            id="download-zip-btn"
            onClick={onDownloadZip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get Local Project (.zip)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
