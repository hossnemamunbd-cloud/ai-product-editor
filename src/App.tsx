/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ComparisonView } from './components/ComparisonView';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { Windows7Modal } from './components/Windows7Modal';
import { processBackgroundRemoval } from './lib/bgRemover';
import { downloadProjectZip } from './lib/exportZip';
import { Sparkles, CheckCircle2, Shield, Laptop, Zap } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [processedBlobUrl, setProcessedBlobUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Initializing AI model...');
  const [progressPercent, setProgressPercent] = useState(0);
  const [showWin7Modal, setShowWin7Modal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clean up object URLs on unmount or file reset
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      if (processedBlobUrl && processedBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedBlobUrl);
      }
    };
  }, []);

  const handleFileSelect = (file: File) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    if (processedBlobUrl && processedBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(processedBlobUrl);
      setProcessedBlobUrl(null);
    }
    setErrorMsg(null);
    setSelectedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleReset = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    if (processedBlobUrl && processedBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(processedBlobUrl);
    }
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setProcessedBlobUrl(null);
    setIsProcessing(false);
    setErrorMsg(null);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile && !imagePreviewUrl) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setProgressPercent(10);
    setProcessingStep('Preparing product image...');

    try {
      const source = selectedFile || imagePreviewUrl!;
      const blob = await processBackgroundRemoval(source, (step, pct) => {
        setProcessingStep(step);
        setProgressPercent(pct);
      });

      const url = URL.createObjectURL(blob);
      setProcessedBlobUrl(url);
    } catch (err: any) {
      console.error('Background removal error:', err);
      setErrorMsg(err.message || 'Failed to remove background. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBlobUrl) return;
    const a = document.createElement('a');
    a.href = processedBlobUrl;
    const rawName = selectedFile ? selectedFile.name : 'product';
    const baseName = rawName.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_transparent.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* SaaS App Header */}
      <Header
        onOpenWindows7Guide={() => setShowWin7Modal(true)}
        onDownloadZip={downloadProjectZip}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Intro / Value Proposition */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 MVP &bull; Free Open-Source Pretrained AI</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Remove Product Backgrounds Instantly
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Keep the product subject crisp and make the background transparent. Zero subscriptions, zero paid API keys, and fully compatible with local Windows 7 setups.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-300 font-medium">100% Free Model</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
            <Laptop className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-slate-300 font-medium">Win7 Python 3.8</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-slate-300 font-medium">Fast U²-Net AI</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-slate-300 font-medium">Transparent PNG</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Interactive Workspace */}
        <div className="space-y-6">
          {isProcessing ? (
            <ProcessingOverlay
              stepText={processingStep}
              percent={progressPercent}
            />
          ) : processedBlobUrl && imagePreviewUrl ? (
            /* Results View */
            <ComparisonView
              originalUrl={imagePreviewUrl}
              processedUrl={processedBlobUrl}
              fileName={selectedFile?.name || 'product.png'}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          ) : (
            /* Upload Zone */
            <UploadZone
              selectedFile={selectedFile}
              imagePreviewUrl={imagePreviewUrl}
              onFileSelect={handleFileSelect}
              onRemoveBackground={handleRemoveBackground}
              isProcessing={isProcessing}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Windows 7 Quick Banner */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-semibold text-slate-200">Developing locally on Windows 7?</h4>
            <p className="text-slate-400">
              Check the step-by-step compatibility explanation (Python 3.8.10, Pillow, ONNX Runtime, and U²-Net) with one-click package download.
            </p>
          </div>
          <button
            onClick={() => setShowWin7Modal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold border border-slate-700 transition flex-shrink-0 cursor-pointer"
          >
            View Windows 7 Setup Guide
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Product Image Background Remover &bull; Phase 1 MVP</span>
          <span>Open-Source U²-Net AI &bull; No Paid APIs &bull; Local Execution</span>
        </div>
      </footer>

      {/* Windows 7 Documentation & Source Code Modal */}
      <Windows7Modal
        isOpen={showWin7Modal}
        onClose={() => setShowWin7Modal(false)}
      />
    </div>
  );
}
