import { ref } from 'vue';
import { describe, expect, it } from 'vitest';

import {
  tonalBuilderStripConstants,
  useTonalBuilderStrips,
} from '@/composables/useTonalBuilderStrips';

const { FULL_INDICES, EXTENDED_INDICES, KEY_INDICES } = tonalBuilderStripConstants;

describe('useTonalBuilderStrips', () => {
  it('builds full, extended, and key strips anchored to the base luminance', () => {
    const baseHex = ref('#7c3aed');
    const blendHex = ref('#22d3ee');

    const { baseLuminance, fullStrip, extendedStrip, keyStrip } = useTonalBuilderStrips(
      baseHex,
      blendHex,
    );

    expect(baseLuminance.value).toBeGreaterThan(0);
    expect(baseLuminance.value).toBeLessThan(100);

    expect(fullStrip.value).toHaveLength(FULL_INDICES.length);
    expect(extendedStrip.value.length).toBeGreaterThanOrEqual(EXTENDED_INDICES.length);
    expect(keyStrip.value.length).toBeGreaterThanOrEqual(KEY_INDICES.length);

    expect(
      fullStrip.value.some((swatch) => swatch.isBase && swatch.index === baseLuminance.value),
    ).toBe(true);
    expect(extendedStrip.value.some((swatch) => swatch.isBase)).toBe(true);
    expect(keyStrip.value.some((swatch) => swatch.isBase)).toBe(true);
  });
});
