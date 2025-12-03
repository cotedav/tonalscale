import { getLuminance, normalizeHexRgb } from './color-math';

export const getContrastRatio = (first: string, second: string): number => {
  const firstLuminance = getLuminance(first);
  const secondLuminance = getLuminance(second);
  const ratio =
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05);
  return Number(ratio.toFixed(4));
};

export const toRgbChannels = (hex: string) => normalizeHexRgb(hex);
