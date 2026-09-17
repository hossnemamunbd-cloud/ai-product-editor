import React from 'react';
import { Loader2, Sparkles, Cpu } from 'lucide-react';

interface ProcessingOverlayProps {
  stepText: string;
  percent: number;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ stepText, percent }) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
          <Cpu className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          Isolating Product Subject...
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          {stepText || 'Processing image...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs space-y-1.5">
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(10, percent)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>Removing background</span>
          <span>{percent}%</span>
        </div>
      </div>
    </div>
  );
};
