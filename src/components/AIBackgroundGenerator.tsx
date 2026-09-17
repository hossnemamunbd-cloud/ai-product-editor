import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, AlertCircle, ArrowRight, Wand2, Image as ImageIcon } from 'lucide-react';

export const EXAMPLE_PROMPTS = [
  'Luxury studio background',
  'White marble table',
  'Modern kitchen',
  'Professional office',
  'Soft beige studio',
  'Natural outdoor background'
];

interface AIBackgroundGeneratorProps {
  appliedBackgroundUrl: string | null;
  onApplyBackground: (url: string, prompt: string) => void;
}

export const AIBackgroundGenerator: React.FC<AIBackgroundGeneratorProps> = ({
  appliedBackgroundUrl,
  onApplyBackground,
}) => {
  const [promptText, setPromptText] = useState('Luxury studio background');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(
    appliedBackgroundUrl || '/backgrounds/luxury_studio.jpg'
  );
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string>('Luxury studio background');
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));

  const handleGenerate = async (customPrompt?: string, isRegenerate = false) => {
    const targetPrompt = (customPrompt ?? promptText).trim();
    if (!targetPrompt) {
      setErrorMsg('Please enter a description for the background');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratingStep('Synthesizing studio environment...');

    const newSeed = isRegenerate ? Math.floor(Math.random() * 1000000) : seed;
    setSeed(newSeed);

    try {
      // Step feedback
      const timer = setTimeout(() => {
        setGeneratingStep('Calibrating studio lighting & depth of field...');
      }, 1200);

      const res = await fetch('/api/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetPrompt,
          seed: newSeed,
          usePresetIfAvailable: !isRegenerate
        })
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error('Failed to generate background. Please try again.');
      }

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedPreviewUrl(data.imageUrl);
        setLastGeneratedPrompt(targetPrompt);
        // Automatically apply the generated background onto the canvas composite
        onApplyBackground(data.imageUrl, targetPrompt);
      } else {
        throw new Error('No image returned from background service');
      }
    } catch (err: any) {
      console.error('AI background error:', err);
      setErrorMsg(err.message || 'Error creating AI background. Please try another prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isCurrentlyApplied =
    Boolean(generatedPreviewUrl && appliedBackgroundUrl === generatedPreviewUrl);

  return (
    <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">AI Background Generator</h4>
            <p className="text-[11px] text-slate-400">
              Create a custom photographic backdrop. The product cutout is preserved exactly on top.
            </p>
          </div>
        </div>

        {appliedBackgroundUrl && (
          <span className="self-start sm:self-auto px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            AI Backdrop Active
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Prompt Input & Action Controls */}
      <div className="space-y-2">
        <label htmlFor="ai-bg-prompt-input" className="block text-xs font-medium text-slate-300">
          Describe the background:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id="ai-bg-prompt-input"
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  handleGenerate(promptText, false);
                }
              }}
              placeholder="e.g. Luxury studio background, White marble table..."
              disabled={isGenerating}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder-slate-500 text-xs sm:text-sm transition outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleGenerate(promptText, false)}
              disabled={isGenerating || !promptText.trim()}
              title="Generate Background"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate(promptText, false)}
            disabled={isGenerating || !promptText.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Background</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Example Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-slate-400">Example prompts:</span>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setPromptText(ex);
                handleGenerate(ex, false);
              }}
              disabled={isGenerating}
              className={`px-2.5 py-1 rounded-lg text-xs transition border cursor-pointer ${
                promptText === ex
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Progress / Loading State */}
      {isGenerating && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200">{generatingStep}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
              <div className="bg-blue-500 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Generated Background Preview & Actions */}
      {generatedPreviewUrl && !isGenerating && (
        <div className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
              <img
                src={generatedPreviewUrl}
                alt="Generated backdrop preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {lastGeneratedPrompt || 'Custom Background'}
                </p>
                {isCurrentlyApplied && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Applied
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Ready for staging &bull; Original product details preserved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleGenerate(promptText, true)}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyBackground(generatedPreviewUrl, lastGeneratedPrompt)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer ${
                isCurrentlyApplied
                  ? 'bg-emerald-600 text-white border border-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCurrentlyApplied ? 'Applied' : 'Apply Background'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
