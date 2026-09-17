import React from 'react';
import { ArrowRight, ArrowDown, ArrowDownRight, Disc, Palette, Sparkles, ArrowLeftRight } from 'lucide-react';
import { GradientSettings, GradientDirection, getGradientCss } from '../types';

interface GradientBackgroundControlsProps {
  settings: GradientSettings;
  onChange: (settings: GradientSettings) => void;
}

interface GradientPreset {
  name: string;
  colorCount: 2 | 3;
  color1: string;
  color2: string;
  color3: string;
  direction: GradientDirection;
}

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Cyber Indigo',
    colorCount: 2,
    color1: '#4F46E5',
    color2: '#06B6D4',
    color3: '#EC4899',
    direction: 'diagonal',
  },
  {
    name: 'Sunset Glow',
    colorCount: 3,
    color1: '#F43F5E',
    color2: '#FB923C',
    color3: '#FBBF24',
    direction: 'diagonal',
  },
  {
    name: 'Clean Studio',
    colorCount: 2,
    color1: '#FFFFFF',
    color2: '#CBD5E1',
    color3: '#94A3B8',
    direction: 'vertical',
  },
  {
    name: 'Emerald Mint',
    colorCount: 2,
    color1: '#065F46',
    color2: '#34D399',
    color3: '#6EE7B7',
    direction: 'diagonal',
  },
  {
    name: 'Cosmic Violet',
    colorCount: 3,
    color1: '#3B82F6',
    color2: '#8B5CF6',
    color3: '#EC4899',
    direction: 'horizontal',
  },
  {
    name: 'Peach Pastel',
    colorCount: 3,
    color1: '#FEE2E2',
    color2: '#FED7AA',
    color3: '#FEF08A',
    direction: 'radial',
  },
  {
    name: 'Midnight Lux',
    colorCount: 2,
    color1: '#0F172A',
    color2: '#334155',
    color3: '#1E293B',
    direction: 'radial',
  },
  {
    name: 'Pure Radial Light',
    colorCount: 2,
    color1: '#FFFFFF',
    color2: '#94A3B8',
    color3: '#64748B',
    direction: 'radial',
  },
];

export const GradientBackgroundControls: React.FC<GradientBackgroundControlsProps> = ({
  settings,
  onChange,
}) => {
  const directions: { id: GradientDirection; label: string; icon: React.ReactNode }[] = [
    { id: 'horizontal', label: 'Horizontal', icon: <ArrowRight className="w-3.5 h-3.5" /> },
    { id: 'vertical', label: 'Vertical', icon: <ArrowDown className="w-3.5 h-3.5" /> },
    { id: 'diagonal', label: 'Diagonal', icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
    { id: 'radial', label: 'Radial', icon: <Disc className="w-3.5 h-3.5" /> },
  ];

  const handleSwapColors = () => {
    if (settings.colorCount === 2) {
      onChange({
        ...settings,
        color1: settings.color2,
        color2: settings.color1,
      });
    } else {
      onChange({
        ...settings,
        color1: settings.color3,
        color3: settings.color1,
      });
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/90 rounded-xl p-4 space-y-4 text-xs animate-in fade-in duration-200">
      {/* Top Header & Mode Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">Gradient Background</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {settings.colorCount}-Color &bull; {settings.direction}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Customize colors, stops, and lighting directions to create dynamic studio backdrops
            </p>
          </div>
        </div>

        {/* 2-Color vs 3-Color Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-medium">Color Count:</span>
          <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-700">
            <button
              id="gradient-2-color-btn"
              type="button"
              onClick={() => onChange({ ...settings, colorCount: 2 })}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                settings.colorCount === 2
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2 Colors
            </button>
            <button
              id="gradient-3-color-btn"
              type="button"
              onClick={() => onChange({ ...settings, colorCount: 3 })}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                settings.colorCount === 3
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3 Colors
            </button>
          </div>
        </div>
      </div>

      {/* Direction and Color Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Direction Controls */}
        <div className="md:col-span-5 space-y-2">
          <label className="text-slate-300 font-semibold block text-[11px]">
            Gradient Direction:
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-700/80">
            {directions.map((dir) => (
              <button
                key={dir.id}
                id={`gradient-dir-${dir.id}-btn`}
                type="button"
                onClick={() => onChange({ ...settings, direction: dir.id })}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  settings.direction === dir.id
                    ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500 font-semibold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {dir.icon}
                <span>{dir.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-semibold text-[11px]">
              Custom Colors:
            </label>
            <button
              id="gradient-swap-colors-btn"
              type="button"
              onClick={handleSwapColors}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Reverse / Swap colors"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Invert</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Color 1 */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-700">
              <input
                id="gradient-color-1-input"
                type="color"
                value={settings.color1}
                onChange={(e) => onChange({ ...settings, color1: e.target.value })}
                className="w-7 h-7 rounded border border-slate-600 bg-transparent cursor-pointer shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] text-slate-400 font-medium leading-none mb-1">Color 1</span>
                <span className="font-mono text-[11px] text-slate-200 uppercase font-semibold leading-none">
                  {settings.color1}
                </span>
              </div>
            </div>

            {/* Color 2 (Middle if 3-color, End if 2-color) */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-700">
              <input
                id="gradient-color-2-input"
                type="color"
                value={settings.color2}
                onChange={(e) => onChange({ ...settings, color2: e.target.value })}
                className="w-7 h-7 rounded border border-slate-600 bg-transparent cursor-pointer shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] text-slate-400 font-medium leading-none mb-1">
                  {settings.colorCount === 3 ? 'Color 2 (Mid)' : 'Color 2'}
                </span>
                <span className="font-mono text-[11px] text-slate-200 uppercase font-semibold leading-none">
                  {settings.color2}
                </span>
              </div>
            </div>

            {/* Color 3 (Only when colorCount === 3) */}
            {settings.colorCount === 3 && (
              <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-700 animate-in fade-in duration-150">
                <input
                  id="gradient-color-3-input"
                  type="color"
                  value={settings.color3}
                  onChange={(e) => onChange({ ...settings, color3: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-600 bg-transparent cursor-pointer shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-slate-400 font-medium leading-none mb-1">Color 3 (End)</span>
                  <span className="font-mono text-[11px] text-slate-200 uppercase font-semibold leading-none">
                    {settings.color3}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preset Gradient Swatches */}
      <div className="pt-2 border-t border-slate-700/70 space-y-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">Curated Studio Presets:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {GRADIENT_PRESETS.map((preset) => {
            const previewCss = getGradientCss({
              colorCount: preset.colorCount,
              color1: preset.color1,
              color2: preset.color2,
              color3: preset.color3,
              direction: preset.direction,
            });
            const isSelected =
              settings.colorCount === preset.colorCount &&
              settings.color1.toLowerCase() === preset.color1.toLowerCase() &&
              settings.color2.toLowerCase() === preset.color2.toLowerCase() &&
              (settings.colorCount === 2 || settings.color3.toLowerCase() === preset.color3.toLowerCase());

            return (
              <button
                key={preset.name}
                id={`gradient-preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}-btn`}
                type="button"
                onClick={() =>
                  onChange({
                    colorCount: preset.colorCount,
                    color1: preset.color1,
                    color2: preset.color2,
                    color3: preset.color3,
                    direction: preset.direction,
                  })
                }
                className={`group flex flex-col items-center gap-1.5 p-1.5 rounded-lg border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-700/90 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500 hover:bg-slate-900'
                }`}
                title={`${preset.name} (${preset.colorCount}-color, ${preset.direction})`}
              >
                <div
                  className="w-full h-7 rounded-md border border-white/20 shadow-inner"
                  style={{ background: previewCss }}
                />
                <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center group-hover:text-white">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
