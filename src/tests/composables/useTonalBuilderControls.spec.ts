import { describe, expect, it } from 'vitest';
import { useTonalBuilderControls } from '@/composables/useTonalBuilderControls';

describe('useTonalBuilderControls', () => {
  it('initializes defaults and updates blend mode', () => {
    const { blendMode, controls, setBlendMode } = useTonalBuilderControls();

    expect(blendMode.value).toBe('multiply');
    expect(controls.strength).toBe(0);

    setBlendMode('overlay');
    expect(blendMode.value).toBe('overlay');
  });

  it('clamps control updates to defined bounds and resets', () => {
    const { controls, updateControl, resetControls, controlDefinitions } =
      useTonalBuilderControls();

    const middleDefinition = controlDefinitions.find((control) => control.id === 'middle');
    expect(middleDefinition).toBeDefined();

    updateControl('middle', 200);
    expect(controls.middle).toBe(middleDefinition?.number.max);

    updateControl('middle', -999);
    expect(controls.middle).toBe(middleDefinition?.number.min);

    resetControls();
    expect(controls.middle).toBe(0);
  });
});
