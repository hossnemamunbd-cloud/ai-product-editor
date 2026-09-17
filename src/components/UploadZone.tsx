import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import { SAMPLE_PRODUCTS, SampleProduct } from '../data/sampleImages';

interface UploadZoneProps {
  selectedFile: File | null;
  imagePreviewUrl: string | null;
  onFileSelect: (file: File) => void;
  onSelectSample: (sample: SampleProduct) => void;
  onRemoveBackground: () => void;
  isProcessing: boolean;
  onReset: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  selectedFile,
  imagePreviewUrl,
  onFileSelect,
  onSelectSample,
  onRemoveBackground,
  isProcessing,
  onReset,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    setUploadError(null);
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const hasValidExt = /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!validExtensions.includes(file.type) && !hasValidExt) {
      setUploadError('Unsupported format. Please upload a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds 25MB limit. Please choose a smaller image.');
      return;
    }

    onFileSelect(file);
  };

  const handleSelectSample = (sample: SampleProduct) => {
    setUploadError(null);
    onSelectSample(sample);
  };

  return (
    <div className="w-full">
      {!imagePreviewUrl ? (
        <div className="space-y-4">
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div
            id="drag-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full relative border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-1">
                  Upload a Product Image
                </h3>
                <p className="text-sm text-slate-400">
                  Drag & drop an image here, or select a file to remove its background
                </p>
              </div>

              {/* Primary action button visible immediately */}
              <div className="pt-1">
                <button
                  id="select-image-to-remove-bg-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-900 active:bg-neutral-950 text-white font-semibold text-sm border border-neutral-700/80 hover:border-neutral-500 shadow-xl shadow-black/40 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Choose Image to Remove Background</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">JPG</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">JPEG</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">PNG</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">WebP</span>
                <span className="text-slate-500">&bull; Up to 25MB</span>
              </div>
            </div>
          </div>

          {/* Sample Product Images */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Or try with an e-commerce sample product:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PRODUCTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  disabled={isProcessing}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-500 shadow-sm hover:shadow transition-all text-left group cursor-pointer active:scale-[0.98]"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-600/50 bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 truncate transition-colors">
                      {sample.name}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{sample.category}</span>
                      <span className="text-[10px] text-blue-400/80 group-hover:text-blue-300 font-medium">Try now</span>
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Card & Actions */
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-700/70">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                <img
                  src={imagePreviewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-slate-100 truncate max-w-xs">
                    {selectedFile?.name || 'Selected Image'}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Sample'} &bull; Ready for background removal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onReset}
              disabled={isProcessing}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
            >
              Choose different image
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Ready to remove background
            </div>

            <button
              id="remove-background-btn"
              type="button"
              onClick={onRemoveBackground}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black hover:bg-neutral-900 active:bg-neutral-950 text-white font-semibold text-sm border border-neutral-700 hover:border-neutral-500 shadow-xl shadow-black/50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isProcessing ? 'Processing...' : 'Remove Background'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
