import { nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import { useTonalBuilderColors } from '@/composables/useTonalBuilderColors';
import { useTonalBuilderControls } from '@/composables/useTonalBuilderControls';
import { useTonalBuilderEngine } from '@/composables/useTonalBuilderEngine';

describe('useTonalBuilderEngine', () => {
  it('emits payloads when the inputs are valid', async () => {
    const colors = useTonalBuilderColors();
    const controls = useTonalBuilderControls();
    const onUpdate = vi.fn();

    const { payload, lastPayload } = useTonalBuilderEngine(
      {
        colors: { baseHex: colors.baseHex, blendHex: colors.blendHex },
        controls: {
          blendMode: controls.blendMode,
          controls: controls.controls,
          hasErrors: controls.hasErrors,
        },
      },
      { onUpdate },
    );

    await nextTick();

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseHex: '#7c3aed',
        blendHex: '#22d3ee',
        blendMode: 'colordodge',
        spread: 50,
        satDarker: 0,
        satLighter: 0,
      }),
    );
    expect(payload.value.middle).toBe(0);

    controls.updateControl('spread', 40);
    await nextTick();

    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ spread: 40 }));
    expect(lastPayload.value?.spread).toBe(40);

    controls.updateControl('spread', 999);
    await nextTick();

    expect(onUpdate).toHaveBeenCalledTimes(2);
  });
});
