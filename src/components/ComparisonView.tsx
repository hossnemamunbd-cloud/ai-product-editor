import React, { useState, useRef, useEffect } from 'react';
import { Download, SlidersHorizontal, Columns, RotateCcw, Check, ShoppingBag, Eye } from 'lucide-react';

interface ComparisonViewProps {
  originalUrl: string;
  processedUrl: string;
  fileName: string;
  onDownload: () => void;
  onReset: () => void;
}

type BackdropType = 'checkerboard' | 'white' | 'dark' | 'soft' | 'card';
type ViewMode = 'slider' | 'side-by-side';

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalUrl,
  processedUrl,
  fileName,
  onDownload,
  onReset,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [backdrop, setBackdrop] = useState<BackdropType>('checkerboard');
  const containerRef = useRef<HTMLDivElement>(null);

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

  const getBackdropClass = () => {
    switch (backdrop) {
      case 'white':
        return 'bg-white';
      case 'dark':
        return 'bg-slate-950';
      case 'soft':
        return 'bg-slate-100';
      case 'checkerboard':
      default:
        return 'checkerboard-pattern';
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white">Before & After Preview</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              High Precision Alpha Cutout
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject extracted with open-source pretrained model &bull; Ready for commercial export
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Process Another</span>
          </button>

          <button
            id="download-png-btn"
            type="button"
            onClick={onDownload}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition ${
              viewMode === 'slider' ? 'bg-black text-white font-medium border border-neutral-700 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition ${
              viewMode === 'side-by-side' ? 'bg-black text-white font-medium border border-neutral-700 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>
        </div>

        {/* Backdrop Preview Swatches */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium hidden sm:inline">Preview Backdrop:</span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-slate-700">
            <button
              title="Checkerboard Transparent Pattern"
              onClick={() => setBackdrop('checkerboard')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                backdrop === 'checkerboard' ? 'bg-slate-700 text-white ring-1 ring-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Checkerboard
            </button>
            <button
              title="Clean White E-Commerce Studio"
              onClick={() => setBackdrop('white')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                backdrop === 'white' ? 'bg-slate-700 text-white ring-1 ring-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              White
            </button>
            <button
              title="Dark Studio Luxury"
              onClick={() => setBackdrop('dark')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                backdrop === 'dark' ? 'bg-slate-700 text-white ring-1 ring-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark
            </button>
            <button
              title="Product Card Preview"
              onClick={() => setBackdrop('card')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition ${
                backdrop === 'card' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Shop Mockup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizer Area */}
      {backdrop === 'card' ? (
        /* E-Commerce Product Card Mockup */
        <div className="py-6 flex flex-col items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Live Store Catalog Preview (Shows how the cutout looks on an e-commerce platform)
          </p>
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl text-slate-900 border border-slate-200">
            <div className="w-full h-52 flex items-center justify-center bg-slate-50 rounded-xl p-4 mb-4 overflow-hidden">
              <img
                src={processedUrl}
                alt="Cutout Product"
                className="max-w-full max-h-full object-contain filter drop-shadow-md"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Featured Product</span>
                <span className="text-emerald-600 font-semibold">In Stock</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 line-clamp-1">
                {fileName.replace(/\.[^/.]+$/, '') || 'Premium Product'}
              </h4>
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                {'★'.repeat(5)} <span className="text-slate-500 text-[11px] ml-1">(4.9/5.0)</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-slate-900">$129.00</span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  Buy Now
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
          {/* Bottom Layer: Processed with selected background */}
          <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${getBackdropClass()}`}>
            <img
              src={processedUrl}
              alt="Processed background removed"
              className="max-w-full max-h-full object-contain p-4"
              draggable={false}
            />
            <span className="absolute bottom-3 right-3 px-2 py-1 rounded bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-sm pointer-events-none border border-slate-700">
              Removed Background (Transparent)
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
            <span className="absolute bottom-3 left-3 px-2 py-1 rounded bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-sm pointer-events-none border border-slate-700">
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

          <div className={`border border-slate-800 rounded-xl p-4 flex flex-col items-center ${getBackdropClass()}`}>
            <span className="text-xs uppercase font-semibold text-slate-700 mb-2">Transparent Cutout</span>
            <div className="w-full h-80 flex items-center justify-center overflow-hidden">
              <img
                src={processedUrl}
                alt="Processed"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
