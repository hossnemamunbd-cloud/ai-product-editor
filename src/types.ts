export type ShadowType = 'soft' | 'natural' | 'strong';

export interface ProductShadowSettings {
  enabled: boolean;
  type: ShadowType;
  opacity: number; // 0 to 100 (%)
  blur: number; // 0 to 60 (px)
  size: number; // 50 to 150 (%)
  position: number; // 0 to 60 (px)
  angle: number; // 0 to 360 (deg)
}

export const DEFAULT_SHADOW_PRESETS: Record<ShadowType, Omit<ProductShadowSettings, 'enabled' | 'type'>> = {
  soft: {
    opacity: 35,
    blur: 28,
    size: 104,
    position: 14,
    angle: 90,
  },
  natural: {
    opacity: 52,
    blur: 18,
    size: 100,
    position: 16,
    angle: 90,
  },
  strong: {
    opacity: 78,
    blur: 10,
    size: 98,
    position: 22,
    angle: 90,
  },
};

export const INITIAL_SHADOW_SETTINGS: ProductShadowSettings = {
  enabled: false,
  type: 'natural',
  ...DEFAULT_SHADOW_PRESETS.natural,
};

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial';

export interface GradientSettings {
  colorCount: 2 | 3;
  color1: string;
  color2: string;
  color3: string;
  direction: GradientDirection;
}

export const INITIAL_GRADIENT_SETTINGS: GradientSettings = {
  colorCount: 2,
  color1: '#4F46E5',
  color2: '#06B6D4',
  color3: '#EC4899',
  direction: 'diagonal',
};

export function getGradientCss(settings: GradientSettings): string {
  const colors =
    settings.colorCount === 2
      ? `${settings.color1}, ${settings.color2}`
      : `${settings.color1}, ${settings.color2}, ${settings.color3}`;

  switch (settings.direction) {
    case 'horizontal':
      return `linear-gradient(to right, ${colors})`;
    case 'vertical':
      return `linear-gradient(to bottom, ${colors})`;
    case 'diagonal':
      return `linear-gradient(135deg, ${colors})`;
    case 'radial':
      return `radial-gradient(circle at center, ${colors})`;
    default:
      return `linear-gradient(135deg, ${colors})`;
  }
}

