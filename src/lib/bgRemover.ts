import { removeBackground } from '@imgly/background-removal';

export async function processBackgroundRemoval(
  imageSource: File | Blob | string,
  onProgress?: (step: string, percent: number) => void
): Promise<Blob> {
  onProgress?.('Preparing image...', 10);

  // We attempt @imgly (open-source U2-Net/ISNet via ONNX WebAssembly)
  try {
    const config = {
      progress: (key: string, current: number, total: number) => {
        const percent = total > 0 ? Math.round((current / total) * 100) : 50;
        let stepLabel = 'Processing image...';
        if (key.includes('fetch') || key.includes('download')) {
          stepLabel = 'Loading open-source U²-Net model...';
        } else if (key.includes('compute') || key.includes('inference')) {
          stepLabel = 'Isolating product subject & computing alpha matte...';
        }
        onProgress?.(stepLabel, Math.min(95, Math.max(20, percent)));
      },
      output: {
        format: 'image/png' as const,
        quality: 1.0,
      }
    };

    onProgress?.('Initializing open-source AI neural net...', 25);
    
    // Set a race with timeout in case WASM CDN is unreachable in certain browser sandbox
    const removalPromise = removeBackground(imageSource, config);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Model download timeout')), 30000)
    );

    const blob = await Promise.race([removalPromise, timeoutPromise]);
    onProgress?.('Generating transparent PNG...', 100);
    return blob;
  } catch (err) {
    console.warn('U2-Net WASM engine encountered an issue, running local smart edge segmentation:', err);
    onProgress?.('Running local color-matte segmentation fallback...', 65);
    return await fallbackColorMatteRemoval(imageSource, onProgress);
  }
}

/**
 * Intelligent canvas-based fallback that analyzes corner and perimeter backdrop colors,
 * builds a color tolerance mask with soft feathering, and outputs a transparent PNG.
 */
async function fallbackColorMatteRemoval(
  imageSource: File | Blob | string,
  onProgress?: (step: string, percent: number) => void
): Promise<Blob> {
  let imgUrl = '';
  if (typeof imageSource === 'string') {
    imgUrl = imageSource;
  } else {
    imgUrl = URL.createObjectURL(imageSource);
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    image.src = imgUrl;
  });

  onProgress?.('Analyzing edge pixels & color clusters...', 80);

  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context not supported');

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample perimeter colors (top-left, top-right, bottom-left, bottom-right, and border samples)
  const samplePoints = [
    { x: 2, y: 2 },
    { x: w - 3, y: 2 },
    { x: 2, y: h - 3 },
    { x: w - 3, y: h - 3 },
    { x: Math.floor(w / 2), y: 2 },
    { x: Math.floor(w / 2), y: h - 3 },
    { x: 2, y: Math.floor(h / 2) },
    { x: w - 3, y: Math.floor(h / 2) }
  ];

  const bgColors: { r: number; g: number; b: number }[] = [];
  for (const pt of samplePoints) {
    const idx = (pt.y * w + pt.x) * 4;
    bgColors.push({
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2]
    });
  }

  const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const threshold = 38;
  const feather = 20;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Minimum distance to any sampled background color
      let minBgDist = 999;
      for (const bg of bgColors) {
        const d = colorDistance(r, g, b, bg.r, bg.g, bg.b);
        if (d < minBgDist) minBgDist = d;
      }

      // Proximity to center/product bounding area boosts subject retention
      const distFromCenterRatio = Math.sqrt(
        Math.pow((x - w / 2) / (w / 2), 2) + Math.pow((y - h / 2) / (h / 2), 2)
      );

      const effectiveThreshold = distFromCenterRatio < 0.6 ? threshold * 0.75 : threshold;

      if (minBgDist < effectiveThreshold) {
        data[i + 3] = 0; // completely transparent
      } else if (minBgDist < effectiveThreshold + feather) {
        // smooth feathering
        const alphaFraction = (minBgDist - effectiveThreshold) / feather;
        data[i + 3] = Math.round(alphaFraction * 255);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (typeof imageSource !== 'string') {
    URL.revokeObjectURL(imgUrl);
  }

  onProgress?.('Finalizing transparent PNG...', 100);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PNG blob'));
    }, 'image/png');
  });
}
