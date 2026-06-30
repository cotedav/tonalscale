import { getLuminance, normalizeHexRgb } from './color-math';
import type { TonalStep } from './scale';

export type ContrastDirection = 'lighter' | 'darker';

export type ContrastMatch = {
  tone: TonalStep;
  ratio: number;
};

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

/*
 * Returns the closest tone to the base position that satisfies the contrast ratio.
 * "Closest" means the first match found when searching outwards from the base.
 */
export const findClosestContrastTone = (
  tones: TonalStep[],
  basePosition: number,
  direction: ContrastDirection,
  ratio: number,
): ContrastMatch | null => {
  if (basePosition < 0 || basePosition >= tones.length) return null;

  const increment = direction === 'lighter' ? 1 : -1;
  const baseTone = tones[basePosition];

  for (
    let cursor = basePosition + increment;
    cursor >= 0 && cursor < tones.length;
    cursor += increment
  ) {
    const candidate = tones[cursor];
    const ratioValue = getContrastRatio(baseTone.hex, candidate.hex);

    if (ratioValue >= ratio) {
      return { tone: candidate, ratio: ratioValue };
    }
  }

  return null;
};
