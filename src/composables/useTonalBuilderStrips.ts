import { computed, type Ref } from 'vue';

import { clamp } from '@/utils/collection';
import { hexToHsv, hexToRgb, rgbToHex } from '@/utils/color';

export type TonalSwatch = {
  index: number;
  hex: string;
  isBase: boolean;
};

const FULL_INDICES = Array.from({ length: 101 }, (_, index) => index);
const EXTENDED_INDICES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
const KEY_INDICES = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];

const mixChannel = (start: number, end: number, amount: number) =>
  Math.round(start + (end - start) * amount);

const mixHex = (startHex: string, endHex: string, amount: number) => {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);

  return rgbToHex({
    r: mixChannel(start.r, end.r, amount),
    g: mixChannel(start.g, end.g, amount),
    b: mixChannel(start.b, end.b, amount),
  });
};

const normalizeIndices = (indices: number[], baseIndex: number) =>
  Array.from(new Set([...indices, baseIndex])).sort((a, b) => a - b);

const buildStrip = (
  indices: number[],
  baseHex: string,
  blendHex: string,
  baseIndex: number,
): TonalSwatch[] =>
  indices.map((index) => {
    const towardBase = baseIndex === 0 ? 0 : index / baseIndex;
    const towardBlend = baseIndex === 100 ? 1 : (index - baseIndex) / (100 - baseIndex);

    const hex =
      index <= baseIndex
        ? mixHex('#000000', baseHex, clamp(towardBase, 0, 1))
        : mixHex(baseHex, blendHex, clamp(towardBlend, 0, 1));

    return { index, hex, isBase: index === baseIndex };
  });

export const useTonalBuilderStrips = (baseHex: Ref<string>, blendHex: Ref<string>) => {
  const baseLuminance = computed(() => clamp(Math.round(hexToHsv(baseHex.value).v), 1, 99));

  const fullStrip = computed(() =>
    buildStrip(FULL_INDICES, baseHex.value, blendHex.value, baseLuminance.value),
  );
  const extendedStrip = computed(() =>
    buildStrip(
      normalizeIndices(EXTENDED_INDICES, baseLuminance.value),
      baseHex.value,
      blendHex.value,
      baseLuminance.value,
    ),
  );
  const keyStrip = computed(() =>
    buildStrip(
      normalizeIndices(KEY_INDICES, baseLuminance.value),
      baseHex.value,
      blendHex.value,
      baseLuminance.value,
    ),
  );

  return {
    baseLuminance,
    fullStrip,
    extendedStrip,
    keyStrip,
  } as const;
};

export const tonalBuilderStripConstants = {
  FULL_INDICES,
  EXTENDED_INDICES,
  KEY_INDICES,
};
