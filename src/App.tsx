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
import { SampleProduct } from './data/sampleImages';
import { ProductShadowSettings, GradientSettings } from './types';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [processedBlobUrl, setProcessedBlobUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Initializing...');
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

  const handleSelectSample = async (sample: SampleProduct) => {
    handleReset();
    setIsProcessing(true);
    setProgressPercent(20);
    setProcessingStep(`Loading ${sample.name}...`);

    try {
      // 1. Fetch sample original file
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setImagePreviewUrl(sample.url);

      setProgressPercent(50);
      setProcessingStep('Isolating foreground product...');

      // 2. Load the high-precision transparent cutout
      if (sample.transparentUrl) {
        const transRes = await fetch(sample.transparentUrl);
        const transBlob = await transRes.blob();
        await new Promise((r) => setTimeout(r, 350));
        setProgressPercent(85);
        setProcessingStep('Rendering transparent studio canvas...');
        await new Promise((r) => setTimeout(r, 250));
        setProgressPercent(100);
        setProcessedBlobUrl(URL.createObjectURL(transBlob));
      } else {
        const processedBlob = await processBackgroundRemoval(file, (step, pct) => {
          setProcessingStep(step);
          setProgressPercent(pct);
        });
        setProcessedBlobUrl(URL.createObjectURL(processedBlob));
      }
    } catch (err: any) {
      console.error('Failed to load sample:', err);
      setErrorMsg('Failed to process sample product. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

  const handleDownload = async (
    format: 'png' | 'jpg' = 'png',
    backgroundColor: string | null = null,
    backgroundImageUrl?: string | null,
    shadowSettings?: ProductShadowSettings,
    gradientSettings?: GradientSettings | null
  ) => {
    if (!processedBlobUrl) return;

    const rawName = selectedFile ? selectedFile.name : 'product';
    const baseName = rawName.replace(/\.[^/.]+$/, '');

    // If transparent PNG with no solid background, gradient, or AI background and no shadow, download cutout directly
    if (
      format === 'png' &&
      !backgroundColor &&
      !backgroundImageUrl &&
      !gradientSettings &&
      (!shadowSettings || !shadowSettings.enabled)
    ) {
      const a = document.createElement('a');
      a.href = processedBlobUrl;
      a.download = `${baseName}_transparent.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Otherwise render onto a canvas with background color/gradient or AI image and shadow layer
    try {
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        productImg.onload = () => resolve();
        productImg.onerror = (e) => reject(e);
        productImg.src = processedBlobUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = productImg.naturalWidth || productImg.width;
      canvas.height = productImg.naturalHeight || productImg.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // 1. Draw Background Layer
      if (backgroundImageUrl) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            bgImg.onload = () => resolve();
            bgImg.onerror = (e) => reject(e);
            bgImg.src = backgroundImageUrl;
          });

          // Draw background image scaled to cover the canvas
          const hRatio = canvas.width / bgImg.width;
          const vRatio = canvas.height / bgImg.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShiftX = (canvas.width - bgImg.width * ratio) / 2;
          const centerShiftY = (canvas.height - bgImg.height * ratio) / 2;
          ctx.drawImage(
            bgImg,
            0,
            0,
            bgImg.width,
            bgImg.height,
            centerShiftX,
            centerShiftY,
            bgImg.width * ratio,
            bgImg.height * ratio
          );
        } catch (bgLoadErr) {
          console.warn('Failed to load background image for canvas compositing:', bgLoadErr);
          ctx.fillStyle = '#F8FAFC';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (gradientSettings) {
        let grad: CanvasGradient;
        if (gradientSettings.direction === 'horizontal') {
          grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        } else if (gradientSettings.direction === 'vertical') {
          grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        } else if (gradientSettings.direction === 'diagonal') {
          grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        } else {
          // radial
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const radius = Math.max(canvas.width, canvas.height) / 1.4;
          grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        }

        if (gradientSettings.colorCount === 2) {
          grad.addColorStop(0, gradientSettings.color1);
          grad.addColorStop(1, gradientSettings.color2);
        } else {
          grad.addColorStop(0, gradientSettings.color1);
          grad.addColorStop(0.5, gradientSettings.color2);
          grad.addColorStop(1, gradientSettings.color3);
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (format === 'jpg') {
        // JPG doesn't support transparency, default to clean white if no color specified
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Draw Realistic Shadow Layer behind product (if enabled)
      if (shadowSettings && shadowSettings.enabled) {
        try {
          // Scale blur and distance proportionally with export resolution (nominal preview baseline: ~480px)
          const previewNominalHeight = 480;
          const resolutionScale = Math.max(1, Math.max(canvas.width, canvas.height) / previewNominalHeight);
          const scaledBlur = Math.max(1, Math.round(shadowSettings.blur * resolutionScale));
          const scaledDist = shadowSettings.position * resolutionScale;
          const rad = (shadowSettings.angle * Math.PI) / 180;
          const offX = Math.round(Math.cos(rad) * scaledDist);
          const offY = Math.round(Math.sin(rad) * scaledDist);

          // Offscreen shadow canvas to extract exact subject silhouette
          const shadowCanvas = document.createElement('canvas');
          shadowCanvas.width = canvas.width;
          shadowCanvas.height = canvas.height;
          const sCtx = shadowCanvas.getContext('2d');
          if (sCtx) {
            sCtx.save();
            // Position and scale shadow layer
            sCtx.translate(canvas.width / 2 + offX, canvas.height / 2 + offY);
            sCtx.scale(shadowSettings.size / 100, shadowSettings.size / 100);
            sCtx.drawImage(productImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

            // Convert cutout silhouette into solid black
            sCtx.globalCompositeOperation = 'source-in';
            sCtx.fillStyle = '#000000';
            sCtx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
            sCtx.restore();

            // Composite blurred shadow onto canvas with opacity
            ctx.save();
            ctx.globalAlpha = shadowSettings.opacity / 100;

            let appliedFilter = false;
            try {
              if ('filter' in ctx) {
                ctx.filter = `blur(${scaledBlur}px)`;
                ctx.drawImage(shadowCanvas, 0, 0);
                ctx.filter = 'none';
                appliedFilter = true;
              }
            } catch {
              appliedFilter = false;
            }

            if (!appliedFilter) {
              ctx.shadowColor = `rgba(0, 0, 0, ${shadowSettings.opacity / 100})`;
              ctx.shadowBlur = scaledBlur;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.drawImage(shadowCanvas, 0, 0);
              ctx.shadowBlur = 0;
            }
            ctx.restore();
          }
        } catch (shadowErr) {
          console.warn('Failed to render shadow layer onto canvas:', shadowErr);
        }
      }

      // 3. Draw the unaltered transparent product on top
      ctx.drawImage(productImg, 0, 0);

      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpg' ? 0.95 : 1.0;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const shadowSuffix = shadowSettings?.enabled ? '_shadow' : '';
        const baseSuffix = backgroundImageUrl
          ? '_ai_staged'
          : backgroundColor
          ? '_studio'
          : gradientSettings
          ? `_gradient_${gradientSettings.colorCount}color`
          : format === 'png'
          ? '_transparent'
          : '';
        a.download = `${baseName}${baseSuffix}${shadowSuffix}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, mimeType, quality);
    } catch (err) {
      console.error('Download export error:', err);
      // Fallback: direct download
      const a = document.createElement('a');
      a.href = processedBlobUrl;
      a.download = `${baseName}_cutout.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* SaaS App Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Intro Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Remove Product Backgrounds Instantly
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Automatically isolate your product, generate custom AI backgrounds, or style with studio solid colors.
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
              onSelectSample={handleSelectSample}
            />
          ) : (
            /* Upload Zone */
            <UploadZone
              selectedFile={selectedFile}
              imagePreviewUrl={imagePreviewUrl}
              onFileSelect={handleFileSelect}
              onSelectSample={handleSelectSample}
              onRemoveBackground={handleRemoveBackground}
              isProcessing={isProcessing}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Product Image Editor</span>
          <span>Automatic background isolation &bull; Studio color customization &bull; PNG &amp; JPG export</span>
        </div>
      </footer>
    </div>
  );
}
