import React from 'react';
import { Sun, Sparkles, Sliders, RotateCcw, Power } from 'lucide-react';
import { ProductShadowSettings, ShadowType, DEFAULT_SHADOW_PRESETS } from '../types';

interface ProductShadowControlsProps {
  settings: ProductShadowSettings;
  onChange: (settings: ProductShadowSettings) => void;
}

export const ProductShadowControls: React.FC<ProductShadowControlsProps> = ({
  settings,
  onChange,
}) => {
  const handleToggleEnabled = (enabled: boolean) => {
    onChange({
      ...settings,
      enabled,
    });
  };

  const handleSelectType = (type: ShadowType) => {
    const preset = DEFAULT_SHADOW_PRESETS[type];
    onChange({
      ...settings,
      type,
      ...preset,
    });
  };

  const handleResetCurrentType = () => {
    const preset = DEFAULT_SHADOW_PRESETS[settings.type];
    onChange({
      ...settings,
      ...preset,
    });
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/90 rounded-xl p-4 space-y-4 text-xs animate-in fade-in duration-200">
      {/* Header with Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">Product Shadow</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  settings.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-700/60 text-slate-400 border border-slate-600'
                }`}
              >
                {settings.enabled ? 'Active' : 'Off'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Add realistic studio depth underneath or behind your product
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            id="shadow-toggle-button"
            type="button"
            onClick={() => handleToggleEnabled(!settings.enabled)}
            aria-pressed={settings.enabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              settings.enabled ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-slate-300 font-medium text-xs">
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {settings.enabled ? (
        <div className="space-y-4 pt-1">
          {/* Shadow Type Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Shadow Type:</span>
            </label>

            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
              {(['soft', 'natural', 'strong'] as ShadowType[]).map((type) => (
                <button
                  key={type}
                  id={`shadow-type-${type}-btn`}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className={`px-3 py-1 rounded text-xs font-medium capitalize transition cursor-pointer ${
                    settings.type === type
                      ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {/* Opacity */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-opacity-slider" className="text-slate-300 font-medium cursor-pointer">
                  Shadow Opacity
                </label>
                <span className="font-mono text-slate-400 font-semibold">{settings.opacity}%</span>
              </div>
              <input
                id="shadow-opacity-slider"
                type="range"
                min="5"
                max="100"
                step="1"
                value={settings.opacity}
                onChange={(e) => onChange({ ...settings, opacity: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Blur */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-blur-slider" className="text-slate-300 font-medium cursor-pointer">
                  Shadow Blur
                </label>
                <span className="font-mono text-slate-400 font-semibold">{settings.blur}px</span>
              </div>
              <input
                id="shadow-blur-slider"
                type="range"
                min="0"
                max="60"
                step="1"
                value={settings.blur}
                onChange={(e) => onChange({ ...settings, blur: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Size */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-size-slider" className="text-slate-300 font-medium cursor-pointer">
                  Shadow Size
                </label>
                <span className="font-mono text-slate-400 font-semibold">{settings.size}%</span>
              </div>
              <input
                id="shadow-size-slider"
                type="range"
                min="60"
                max="140"
                step="1"
                value={settings.size}
                onChange={(e) => onChange({ ...settings, size: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Position / Distance */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label htmlFor="shadow-position-slider" className="text-slate-300 font-medium cursor-pointer">
                  Shadow Position
                </label>
                <span className="font-mono text-slate-400 font-semibold">{settings.position}px</span>
              </div>
              <input
                id="shadow-position-slider"
                type="range"
                min="0"
                max="60"
                step="1"
                value={settings.position}
                onChange={(e) => onChange({ ...settings, position: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Angle */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <label htmlFor="shadow-angle-slider" className="text-slate-300 font-medium cursor-pointer">
                    Shadow Angle
                  </label>
                  <div className="flex items-center gap-1">
                    {[
                      { label: 'Down', angle: 90 },
                      { label: 'Down-Right', angle: 45 },
                      { label: 'Down-Left', angle: 135 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        id={`shadow-angle-${item.angle}-btn`}
                        type="button"
                        onClick={() => onChange({ ...settings, angle: item.angle })}
                        className={`px-1.5 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                          settings.angle === item.angle
                            ? 'bg-blue-600/40 text-blue-200 border-blue-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="font-mono text-slate-400 font-semibold">{settings.angle}°</span>
              </div>
              <input
                id="shadow-angle-slider"
                type="range"
                min="0"
                max="360"
                step="5"
                value={settings.angle}
                onChange={(e) => onChange({ ...settings, angle: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Reset Action */}
          <div className="flex items-center justify-end pt-1">
            <button
              id="shadow-reset-preset-btn"
              type="button"
              onClick={handleResetCurrentType}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-[11px] transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset {settings.type} preset</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 text-slate-400 text-xs">
          <span>Enable shadow to ground the product with realistic lighting and depth.</span>
          <button
            id="shadow-turn-on-btn"
            type="button"
            onClick={() => handleToggleEnabled(true)}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition cursor-pointer"
          >
            Turn On
          </button>
        </div>
      )}
    </div>
  );
};
