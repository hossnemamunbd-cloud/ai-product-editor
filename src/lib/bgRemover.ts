import { removeBackground } from '@imgly/background-removal';

let processingPromise: Promise<Blob> | null = null;

/**
 * Removes the background using the AI segmentation model only.
 * No color-based fallback is used because it can accidentally remove
 * similarly-colored parts of the main subject.
 */
export async function processBackgroundRemoval(
  imageSource: File | Blob | string,
  onProgress?: (step: string, percent: number) => void
): Promise<Blob> {
  onProgress?.('Preparing image...', 5);

  const config = {
    progress: (key: string, current: number, total: number) => {
      const percent = total > 0 ? Math.round((current / total) * 100) : 50;
      let stepLabel = 'Processing image...';

      if (key.includes('fetch') || key.includes('download')) {
        stepLabel = 'Loading AI model...';
      } else if (key.includes('compute') || key.includes('inference')) {
        stepLabel = 'Precisely separating the subject...';
      }

      onProgress?.(stepLabel, Math.min(98, Math.max(10, percent)));
    },
    output: {
      format: 'image/png' as const,
      quality: 1.0,
    },
  };

  onProgress?.('Initializing AI model...', 10);

  // Do not use a short timeout: the first model download can take time.
  // The library also caches model assets in the browser for later runs.
  const run = removeBackground(imageSource, config);
  processingPromise = run;

  try {
    const blob = await run;
    onProgress?.('Generating transparent PNG...', 100);
    return blob;
  } finally {
    if (processingPromise === run) processingPromise = null;
  }
}
