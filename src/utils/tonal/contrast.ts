import { getLuminance, normalizeHexRgb } from './color-math';

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

export const getContrastRatio = (first: string, second: string): number => {
  const firstLuminance = getLuminance(first);
  const secondLuminance = getLuminance(second);
  const ratio =
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05);
  return roundToOneDecimal(ratio);
};

export const formatContrastRatio = (ratio: number) => {
  const rounded = roundToOneDecimal(ratio);
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}:1`;
};

export const toRgbChannels = (hex: string) => normalizeHexRgb(hex);
