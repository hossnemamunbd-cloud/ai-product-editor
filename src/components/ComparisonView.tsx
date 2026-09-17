import React, { useState, useRef, useEffect } from 'react';
import { Download, SlidersHorizontal, Columns, RotateCcw, Check, ShoppingBag, Eye, Palette, Sparkles, Sun, Blend } from 'lucide-react';
import { SAMPLE_PRODUCTS, SampleProduct } from '../data/sampleImages';
import { AIBackgroundGenerator } from './AIBackgroundGenerator';
import { ProductShadowControls } from './ProductShadowControls';
import { GradientBackgroundControls } from './GradientBackgroundControls';
import {
  ProductShadowSettings,
  INITIAL_SHADOW_SETTINGS,
  GradientSettings,
  INITIAL_GRADIENT_SETTINGS,
  getGradientCss,
} from '../types';

interface ComparisonViewProps {
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  onDownload: (
    format: 'png' | 'jpg',
    backgroundColor: string | null,
    backgroundImage?: string | null,
    shadowSettings?: ProductShadowSettings,
    gradientSettings?: GradientSettings | null
  ) => void;
  onReset: () => void;
  onSelectSample?: (sample: SampleProduct) => void;
}

type BackdropType = 'checkerboard' | 'solid' | 'gradient' | 'ai' | 'card';
type ViewMode = 'slider' | 'side-by-side';

const PRESET_SOLID_COLORS = [
  { name: 'Pure White', value: '#FFFFFF', border: 'border-slate-300' },
  { name: 'Studio Off-White', value: '#F8FAFC', border: 'border-slate-300' },
  { name: 'Warm Cream', value: '#FAF5EF', border: 'border-amber-200' },
  { name: 'Soft Gray', value: '#E2E8F0', border: 'border-slate-300' },
  { name: 'Deep Slate', value: '#1E293B', border: 'border-slate-600' },
  { name: 'True Black', value: '#000000', border: 'border-slate-700' },
  { name: 'Soft Blue', value: '#EFF6FF', border: 'border-blue-200' },
  { name: 'Rose Blush', value: '#FFF1F2', border: 'border-rose-200' },
  { name: 'Mint Green', value: '#ECFDF5', border: 'border-emerald-200' },
  { name: 'Bold Yellow', value: '#FEF08A', border: 'border-amber-300' },
];

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalUrl,
  processedUrl,
  fileName,
  onDownload,
  onReset,
  onSelectSample,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [backdrop, setBackdrop] = useState<BackdropType>('checkerboard');
  const [solidColor, setSolidColor] = useState<string>('#FFFFFF');
  const [aiBackgroundUrl, setAiBackgroundUrl] = useState<string | null>('/backgrounds/luxury_studio.jpg');
  const [aiPromptName, setAiPromptName] = useState<string>('Luxury studio background');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');
  const [shadowSettings, setShadowSettings] = useState<ProductShadowSettings>(INITIAL_SHADOW_SETTINGS);
  const [showShadowPanel, setShowShadowPanel] = useState<boolean>(false);
  const [gradientSettings, setGradientSettings] = useState<GradientSettings>(INITIAL_GRADIENT_SETTINGS);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate shadow directional offset based on angle and position
  const shadowRad = (shadowSettings.angle * Math.PI) / 180;
  const shadowOffsetX = Math.round(Math.cos(shadowRad) * shadowSettings.position);
  const shadowOffsetY = Math.round(Math.sin(shadowRad) * shadowSettings.position);

  const handlePointerMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerMove(e.clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const getBackdropStyle = (): React.CSSProperties => {
    if (backdrop === 'solid') {
      return { backgroundColor: solidColor };
    }
    if (backdrop === 'gradient') {
      return { backgroundImage: getGradientCss(gradientSettings) };
    }
    if (backdrop === 'ai' && aiBackgroundUrl) {
      return {
        backgroundImage: `url(${aiBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return {};
  };

  const getBackdropClassName = () => {
    if (backdrop === 'checkerboard') {
      return 'checkerboard-pattern';
    }
    return '';
  };

  const handleTriggerDownload = () => {
    const bg = backdrop === 'solid' ? solidColor : null;
    const bgImg = backdrop === 'ai' ? aiBackgroundUrl : null;
    const grad = backdrop === 'gradient' ? gradientSettings : null;
    onDownload(downloadFormat, bg, bgImg, shadowSettings, grad);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">Product Image Preview</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Background Removed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject extracted cleanly &bull; Export with transparent background or solid studio backdrop
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>

          {/* Download Format Selector */}
          <div className="flex items-center p-0.5 bg-slate-800 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setDownloadFormat('png')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                downloadFormat === 'png' ? 'bg-black text-white shadow-sm border border-neutral-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PNG
            </button>
            <button
              type="button"
              onClick={() => setDownloadFormat('jpg')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                downloadFormat === 'jpg' ? 'bg-black text-white shadow-sm border border-neutral-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JPG
            </button>
          </div>

          <button
            id="download-btn"
            type="button"
            onClick={handleTriggerDownload}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {downloadFormat.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Mode and Backdrop selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'slider' ? 'bg-black text-white font-medium border border-neutral-700 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Comparison Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'side-by-side' ? 'bg-black text-white font-medium border border-neutral-700 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>
        </div>

        {/* Backdrop Selection & Shadow Option */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium hidden sm:inline">Background:</span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-slate-700">
            <button
              title="Transparent Background"
              onClick={() => setBackdrop('checkerboard')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                backdrop === 'checkerboard' ? 'bg-black text-white border border-neutral-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Transparent
            </button>
            <button
              id="backdrop-solid-btn"
              title="Solid Color Background"
              onClick={() => setBackdrop('solid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                backdrop === 'solid' ? 'bg-black text-white border border-neutral-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3 h-3 text-amber-400" />
              <span>Solid Color</span>
            </button>
            <button
              id="backdrop-gradient-btn"
              title="Gradient Background"
              onClick={() => setBackdrop('gradient')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                backdrop === 'gradient'
                  ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Blend className="w-3 h-3 text-indigo-300" />
              <span>Gradient</span>
            </button>
            <button
              id="backdrop-ai-btn"
              title="AI Background Generator"
              onClick={() => setBackdrop('ai')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                backdrop === 'ai' ? 'bg-blue-600 text-white shadow-sm border border-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="font-semibold">AI Background</span>
            </button>
            <button
              title="Store Catalog Preview"
              onClick={() => setBackdrop('card')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                backdrop === 'card' ? 'bg-black text-white border border-neutral-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3 h-3 text-blue-400" />
              <span>Product Card</span>
            </button>
          </div>

          {/* Product Shadow Toggle Button */}
          <button
            id="product-shadow-panel-toggle-btn"
            type="button"
            onClick={() => {
              if (!showShadowPanel && !shadowSettings.enabled) {
                setShadowSettings((prev) => ({ ...prev, enabled: true }));
              }
              setShowShadowPanel(!showShadowPanel);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
              shadowSettings.enabled
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm'
                : showShadowPanel
                ? 'bg-slate-800 text-slate-200 border-slate-600'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Configure AI Product Shadow"
          >
            <Sun className={`w-3.5 h-3.5 ${shadowSettings.enabled ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Product Shadow</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                shadowSettings.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {shadowSettings.enabled ? shadowSettings.type : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Product Shadow Controls Panel */}
      {showShadowPanel && (
        <ProductShadowControls
          settings={shadowSettings}
          onChange={(newSettings) => setShadowSettings(newSettings)}
        />
      )}

      {/* AI Background Generator Panel (Visible when AI Background is selected) */}
      {backdrop === 'ai' && (
        <AIBackgroundGenerator
          appliedBackgroundUrl={aiBackgroundUrl}
          onApplyBackground={(url, prompt) => {
            setAiBackgroundUrl(url);
            setAiPromptName(prompt);
          }}
        />
      )}

      {/* Solid Color Palette Picker (Visible when Solid Color is selected) */}
      {backdrop === 'solid' && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">Solid Color Backdrop:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_SOLID_COLORS.map((col) => (
              <button
                key={col.value}
                type="button"
                title={col.name}
                onClick={() => setSolidColor(col.value)}
                style={{ backgroundColor: col.value }}
                className={`w-6 h-6 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                  solidColor.toLowerCase() === col.value.toLowerCase()
                    ? 'ring-2 ring-blue-500 scale-110 border-white'
                    : `${col.border} hover:scale-105`
                }`}
              >
                {solidColor.toLowerCase() === col.value.toLowerCase() && (
                  <Check className={`w-3 h-3 ${col.value === '#FFFFFF' || col.value === '#FAF5EF' || col.value === '#FEF08A' ? 'text-slate-900' : 'text-white'}`} />
                )}
              </button>
            ))}

            {/* Custom Color Input */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
              <label htmlFor="custom-color-picker" className="text-slate-400 text-[11px] cursor-pointer">Custom:</label>
              <input
                id="custom-color-picker"
                type="color"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-600 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-[11px] text-slate-300 uppercase">{solidColor}</span>
            </div>
          </div>
        </div>
      )}

      {/* Gradient Background Controls (Visible when Gradient is selected) */}
      {backdrop === 'gradient' && (
        <GradientBackgroundControls
          settings={gradientSettings}
          onChange={setGradientSettings}
        />
      )}

      {/* Main Visualizer Area */}
      {backdrop === 'card' ? (
        /* E-Commerce Product Card Mockup */
        <div className="py-6 flex flex-col items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Store Catalog Preview
          </p>
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl text-slate-900 border border-slate-200">
            <div className="relative w-full h-52 flex items-center justify-center bg-slate-50 rounded-xl p-4 mb-4 overflow-hidden">
              {shadowSettings.enabled && (
                <img
                  src={processedUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-75"
                  style={{
                    transform: `translate(${Math.round(shadowOffsetX * 0.7)}px, ${Math.round(shadowOffsetY * 0.7)}px) scale(${shadowSettings.size / 100})`,
                    filter: `brightness(0) blur(${Math.max(1, Math.round(shadowSettings.blur * 0.7))}px)`,
                    opacity: shadowSettings.opacity / 100,
                    zIndex: 1,
                  }}
                  draggable={false}
                />
              )}
              <img
                src={processedUrl}
                alt="Cutout Product"
                className="relative max-w-full max-h-full object-contain filter drop-shadow-sm"
                style={{ zIndex: 2 }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Featured Item</span>
                <span className="text-emerald-600 font-semibold">Available</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 line-clamp-1">
                {fileName.replace(/\.[^/.]+$/, '') || 'Product Photo'}
              </h4>
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                {'★'.repeat(5)} <span className="text-slate-500 text-[11px] ml-1">(5.0)</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-slate-900">$99.00</span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === 'slider' ? (
        /* Interactive Split Comparison Slider */
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[360px] sm:h-[480px] rounded-xl overflow-hidden cursor-ew-resize select-none border border-slate-800 shadow-inner"
        >
          {/* Bottom Layer: Processed with selected background and optional shadow */}
          <div
            className={`absolute inset-0 w-full h-full flex items-center justify-center transition-colors duration-150 ${getBackdropClassName()}`}
            style={getBackdropStyle()}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {shadowSettings.enabled && (
                <img
                  src={processedUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-75"
                  style={{
                    transform: `translate(${shadowOffsetX}px, ${shadowOffsetY}px) scale(${shadowSettings.size / 100})`,
                    filter: `brightness(0) blur(${shadowSettings.blur}px)`,
                    opacity: shadowSettings.opacity / 100,
                    zIndex: 1,
                  }}
                  draggable={false}
                />
              )}
              <img
                src={processedUrl}
                alt="Processed background removed"
                className="relative max-w-full max-h-full object-contain select-none"
                style={{ zIndex: 2 }}
                draggable={false}
              />
            </div>
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-sm pointer-events-none border border-slate-700">
              {backdrop === 'ai'
                ? `AI Background: ${aiPromptName}`
                : backdrop === 'solid'
                ? 'Solid Color Background'
                : backdrop === 'gradient'
                ? `Gradient: ${gradientSettings.colorCount}-color (${gradientSettings.direction})`
                : 'Removed Background'}
              {shadowSettings.enabled && ` • ${shadowSettings.type} shadow`}
            </span>
          </div>

          {/* Top Layer: Original (Clipped according to slider percentage) */}
          <div
            className="absolute inset-0 h-full overflow-hidden bg-slate-950 flex items-center justify-center pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ width: containerRef.current?.offsetWidth || '100%' }}
            >
              <img
                src={originalUrl}
                alt="Original uploaded"
                className="max-w-full max-h-full object-contain p-4"
                draggable={false}
              />
            </div>
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-sm pointer-events-none border border-slate-700">
              Original Photo
            </span>
          </div>

          {/* Divider Line & Draggable Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-800 border-2 border-blue-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      ) : (
        /* Side-by-Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
            <span className="text-xs uppercase font-semibold text-slate-400 mb-2">Original</span>
            <div className="w-full h-80 flex items-center justify-center overflow-hidden">
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          <div
            className={`border border-slate-800 rounded-xl p-4 flex flex-col items-center transition-colors duration-150 ${getBackdropClassName()}`}
            style={getBackdropStyle()}
          >
            <span className="text-xs uppercase font-semibold text-slate-400 mb-2">
              {backdrop === 'ai'
                ? 'AI Background'
                : backdrop === 'solid'
                ? 'Solid Color'
                : backdrop === 'gradient'
                ? 'Gradient'
                : 'Transparent'}{' '}
              Cutout
              {shadowSettings.enabled && ' + Shadow'}
            </span>
            <div className="relative w-full h-80 flex items-center justify-center overflow-hidden">
              {shadowSettings.enabled && (
                <img
                  src={processedUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-75"
                  style={{
                    transform: `translate(${shadowOffsetX}px, ${shadowOffsetY}px) scale(${shadowSettings.size / 100})`,
                    filter: `brightness(0) blur(${shadowSettings.blur}px)`,
                    opacity: shadowSettings.opacity / 100,
                    zIndex: 1,
                  }}
                  draggable={false}
                />
              )}
              <img
                src={processedUrl}
                alt="Processed"
                className="relative max-w-full max-h-full object-contain"
                style={{ zIndex: 2 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Sample Switcher */}
      {onSelectSample && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Switch to another sample product:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {SAMPLE_PRODUCTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-5 h-5 rounded object-cover border border-slate-700"
                />
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
