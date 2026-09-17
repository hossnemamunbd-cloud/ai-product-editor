import { removeBackground } from '@imgly/background-removal';

/**
 * High-precision background removal pipeline.
 *
 * 1. Primary Engine: Server-side AI Segmentation via `/api/remove-background`
 *    (uses deep learning U²-Net/IS-Net to cleanly segment subjects, products, clothes, and hair
 *    without erasing light-colored clothing or highlights).
 * 2. Secondary Engine: In-browser WebAssembly ONNX inference via `@imgly/background-removal`.
 * 3. Emergency Edge-Connected Flood-Fill: Strictly perimeter-constrained flood fill
 *    that never punctures the internal subject area.
 */
export async function processBackgroundRemoval(
  imageSource: File | Blob | string,
  onProgress?: (step: string, percent: number) => void
): Promise<Blob> {
  onProgress?.('Preparing image...', 15);

  // Convert imageSource into a Blob if necessary
  let sourceBlob: Blob;
  if (imageSource instanceof Blob) {
    sourceBlob = imageSource;
  } else if (typeof imageSource === 'string') {
    const res = await fetch(imageSource);
    sourceBlob = await res.blob();
  } else {
    throw new Error('Unsupported image source type');
  }

  // --- 1. Primary: Server-Side AI Neural Segmentation ---
  try {
    onProgress?.('Analyzing subject with AI segmentation...', 35);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const progressTimer = setInterval(() => {
      onProgress?.('Computing high-precision alpha matte...', 65);
    }, 1500);

    const response = await fetch('/api/remove-background', {
      method: 'POST',
      headers: {
        'Content-Type': sourceBlob.type || 'image/png'
      },
      body: sourceBlob,
      signal: controller.signal
    });

    clearInterval(progressTimer);
    clearTimeout(timeoutId);

    if (response.ok) {
      onProgress?.('Finalizing transparent cutout...', 95);
      const outputBlob = await response.blob();
      onProgress?.('Complete!', 100);
      return outputBlob;
    } else {
      console.warn('Server removal responded with non-200, attempting client model...');
    }
  } catch (serverErr) {
    console.warn('Server background removal unavailable, switching to client pipeline:', serverErr);
  }

  // --- 2. Secondary: Client-Side WebAssembly ONNX Model ---
  try {
    onProgress?.('Running local AI model...', 45);

    const config = {
      model: 'isnet_quint8' as const, // isnet_quint8: lightweight, fast, accurate
      device: 'cpu' as const,
      progress: (key: string, current: number, total: number) => {
        const percent = total > 0 ? Math.round((current / total) * 100) : 50;
        let stepLabel = 'Processing image...';
        if (key.includes('fetch') || key.includes('download')) {
          stepLabel = 'Loading AI model...';
        } else if (key.includes('compute') || key.includes('inference')) {
          stepLabel = 'Segmenting foreground subject...';
        }
        onProgress?.(stepLabel, Math.min(95, Math.max(30, percent)));
      },
      output: {
        format: 'image/png' as const,
        quality: 1.0,
      }
    };

    const clientRemovalPromise = removeBackground(sourceBlob, config);
    const clientTimeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Client inference timed out')), 45000)
    );

    const blob = await Promise.race([clientRemovalPromise, clientTimeoutPromise]);
    onProgress?.('Complete!', 100);
    return blob;
  } catch (clientErr) {
    console.warn('Client WASM engine failed, running perimeter-constrained matting:', clientErr);
    onProgress?.('Refining edges with smart perimeter matting...', 75);
    return await perimeterBoundaryMatteRemoval(sourceBlob, onProgress);
  }
}

/**
 * Emergency Fallback: Edge-Connected Perimeter Flood Fill.
 * Unlike naive global thresholding, this algorithm seeds ONLY at the outer boundaries
 * of the canvas and expands inwards into contiguous background pixels.
 * It NEVER punctures enclosed subject regions (such as white suits, shirts, or face highlights).
 */
async function perimeterBoundaryMatteRemoval(
  imageSource: Blob,
  onProgress?: (step: string, percent: number) => void
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(imageSource);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const w = img.naturalWidth || img.width || 800;
    const h = img.naturalHeight || img.height || 600;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context not supported');

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Collect perimeter background colors from outermost border pixels
    const borderSamples: [number, number, number][] = [];
    const stepX = Math.max(1, Math.floor(w / 30));
    const stepY = Math.max(1, Math.floor(h / 30));

    // Top and Bottom borders
    for (let x = 0; x < w; x += stepX) {
      const topIdx = (0 * w + x) * 4;
      borderSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
      const botIdx = ((h - 1) * w + x) * 4;
      borderSamples.push([data[botIdx], data[botIdx + 1], data[botIdx + 2]]);
    }

    // Left and Right borders
    for (let y = 0; y < h; y += stepY) {
      const leftIdx = (y * w + 0) * 4;
      borderSamples.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);
      const rightIdx = (y * w + (w - 1)) * 4;
      borderSamples.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
    }

    // Average background color
    let avgR = 0;
    let avgG = 0;
    let avgB = 0;
    for (const [r, g, b] of borderSamples) {
      avgR += r;
      avgG += g;
      avgB += b;
    }
    avgR = Math.round(avgR / borderSamples.length);
    avgG = Math.round(avgG / borderSamples.length);
    avgB = Math.round(avgB / borderSamples.length);

    const colorDist = (r: number, g: number, b: number, tr: number, tg: number, tb: number) => {
      const dr = r - tr;
      const dg = g - tg;
      const db = b - tb;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    // Connected component flood fill from edges
    const visited = new Uint8Array(w * h);
    const isBackground = new Uint8Array(w * h);
    const queue: Int32Array = new Int32Array(w * h);
    let queueStart = 0;
    let queueEnd = 0;

    const tolerance = 42;

    const pushQueue = (x: number, y: number) => {
      const idx = y * w + x;
      if (visited[idx]) return;
      visited[idx] = 1;

      const pIdx = idx * 4;
      const dist = colorDist(data[pIdx], data[pIdx + 1], data[pIdx + 2], avgR, avgG, avgB);

      if (dist < tolerance) {
        isBackground[idx] = 1;
        queue[queueEnd++] = idx;
      }
    };

    // Seed from all 4 perimeter borders
    for (let x = 0; x < w; x++) {
      pushQueue(x, 0);
      pushQueue(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      pushQueue(0, y);
      pushQueue(w - 1, y);
    }

    // BFS flood fill outwards into contiguous background
    while (queueStart < queueEnd) {
      const curr = queue[queueStart++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);

      // 4-neighborhood
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          pushQueue(nx, ny);
        }
      }
    }

    // Apply transparency ONLY to confirmed connected background pixels
    for (let i = 0; i < w * h; i++) {
      if (isBackground[i]) {
        data[i * 4 + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    onProgress?.('Complete!', 100);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate PNG blob'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
