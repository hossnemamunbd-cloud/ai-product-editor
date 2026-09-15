/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ComparisonView } from './components/ComparisonView';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { processBackgroundRemoval } from './lib/bgRemover';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [processedBlobUrl, setProcessedBlobUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Preparing image...');
  const [progressPercent, setProgressPercent] = useState(0);
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
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Remove Backgrounds Instantly
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Upload a product image and get a clean transparent PNG. Your image is processed directly in your browser.
          </p>
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

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <span>AI Product Image Editor</span>
      </footer>
    </div>
  );
}
