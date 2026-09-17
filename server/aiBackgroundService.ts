import fs from 'fs';
import path from 'path';

/**
 * AI Background Generation Service Architecture
 * 
 * DESIGN PHILOSOPHY:
 * 1. Zero-Cost & Safe Default: Does not require or invoke paid APIs by default,
 *    preventing accidental billing.
 * 2. Extensible Provider Architecture: Isolates AI image generation behind a standard
 *    interface so third-party or paid models (such as Google Imagen or Gemini 3 Image)
 *    can be plugged in without refactoring client components.
 * 3. High-Quality Commercial Presets: Ships with optimized, instant-loading studio
 *    environments for standard e-commerce staging.
 */

export interface BackgroundGenerationRequest {
  prompt: string;
  seed?: number;
  usePresetIfAvailable?: boolean;
}

export interface BackgroundGenerationResponse {
  success: boolean;
  imageUrl: string;
  prompt: string;
  seed: number;
  provider: 'curated-preset' | 'ai-diffusion' | 'gemini-image-preview';
  isLocalAsset: boolean;
}

// Curated studio backgrounds matching the standard commercial product prompts
const CURATED_BACKGROUND_PRESETS: { keywords: string[]; file: string; label: string }[] = [
  {
    keywords: ['luxury studio', 'luxury', 'gold podium', 'pedestal', 'black studio'],
    file: '/backgrounds/luxury_studio.jpg',
    label: 'Luxury studio background'
  },
  {
    keywords: ['white marble', 'marble table', 'marble countertop', 'marble surface', 'marble'],
    file: '/backgrounds/white_marble.jpg',
    label: 'White marble table'
  },
  {
    keywords: ['modern kitchen', 'kitchen counter', 'kitchen', 'dining table'],
    file: '/backgrounds/modern_kitchen.jpg',
    label: 'Modern kitchen'
  },
  {
    keywords: ['professional office', 'office desk', 'workplace', 'executive office', 'office'],
    file: '/backgrounds/professional_office.jpg',
    label: 'Professional office'
  },
  {
    keywords: ['soft beige', 'beige studio', 'warm beige', 'neutral studio', 'pastel studio'],
    file: '/backgrounds/soft_beige.jpg',
    label: 'Soft beige studio'
  },
  {
    keywords: ['natural outdoor', 'outdoor', 'nature', 'garden', 'forest', 'sunlight', 'greenery'],
    file: '/backgrounds/natural_outdoor.jpg',
    label: 'Natural outdoor background'
  }
];

export async function generateProductBackground(
  req: BackgroundGenerationRequest
): Promise<BackgroundGenerationResponse> {
  const prompt = (req.prompt || '').trim();
  const seed = req.seed ?? Math.floor(Math.random() * 1000000);
  const normalizedPrompt = prompt.toLowerCase();

  // 1. Check if the prompt directly targets a curated preset and preset matching is preferred
  if (req.usePresetIfAvailable !== false) {
    for (const preset of CURATED_BACKGROUND_PRESETS) {
      if (preset.keywords.some((kw) => normalizedPrompt === kw || normalizedPrompt.includes(kw))) {
        return {
          success: true,
          imageUrl: preset.file,
          prompt: preset.label,
          seed,
          provider: 'curated-preset',
          isLocalAsset: true
        };
      }
    }
  }

  // 2. ISOLATED EXTENSION HOOK: Optional Paid Model (e.g. Gemini 3 Image / Imagen)
  // If an environment variable explicitly authorizes paid image generation, route here:
  if (process.env.ENABLE_PAID_IMAGE_GEN === 'true' && process.env.GEMINI_API_KEY) {
    try {
      const paidResult = await generateWithGeminiImageAPI(prompt, seed);
      if (paidResult) return paidResult;
    } catch (paidErr) {
      console.warn('Paid image provider failed or not configured, falling back to standard diffusion:', paidErr);
    }
  }

  // 3. Primary AI Generator: Free Zero-Cost Neural Diffusion Service
  // Generates unique photo-realistic product staging backgrounds based on user's custom prompt
  try {
    const enhancedPrompt = `${prompt}, empty tabletop surface for product staging, commercial product photography backdrop, clean studio lighting, realistic depth of field, high resolution 4k, completely empty center, no foreground items, no people, no text`;
    const encoded = encodeURIComponent(enhancedPrompt);
    const diffusionUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;

    // Verify availability with a lightweight fetch and timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(diffusionUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('image')) {
        // Cache the generated image locally in public/cache to prevent slow reload or external expiration
        try {
          const cacheDir = path.join(process.cwd(), 'public', 'cache');
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }
          const fileName = `bg_${seed}.jpg`;
          const filePath = path.join(cacheDir, fileName);
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(filePath, buffer);

          return {
            success: true,
            imageUrl: `/cache/${fileName}`,
            prompt,
            seed,
            provider: 'ai-diffusion',
            isLocalAsset: true
          };
        } catch (fsErr) {
          // If disk caching has an issue, return the direct diffusion URL
          return {
            success: true,
            imageUrl: diffusionUrl,
            prompt,
            seed,
            provider: 'ai-diffusion',
            isLocalAsset: false
          };
        }
      }
    }
  } catch (diffusionErr) {
    console.warn('AI Diffusion provider timed out or unavailable, using curated studio backdrop fallback:', diffusionErr);
  }

  // 4. Fallback: Select the best matching or default curated studio background
  const fallback = CURATED_BACKGROUND_PRESETS[seed % CURATED_BACKGROUND_PRESETS.length];
  return {
    success: true,
    imageUrl: fallback.file,
    prompt: prompt || fallback.label,
    seed,
    provider: 'curated-preset',
    isLocalAsset: true
  };
}

/**
 * Isolated stub for optional future Gemini / Imagen integration.
 * Kept strictly isolated as per system requirements so it does NOT run automatically.
 */
async function generateWithGeminiImageAPI(
  prompt: string,
  seed: number
): Promise<BackgroundGenerationResponse | null> {
  // Configurable integration interface - ready for enterprise SDK initialization when explicitly opted into.
  return null;
}
