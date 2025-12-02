import { describe, expect, it } from 'vitest';
import { useTonalBuilderControls } from '@/composables/useTonalBuilderControls';

describe('useTonalBuilderControls', () => {
  it('initializes defaults and updates blend mode', () => {
    const { blendMode, controls, setBlendMode } = useTonalBuilderControls();

    expect(blendMode.value).toBe('colordodge');
    expect(controls.strength).toBe(0);
    expect(controls.middle).toBe(0);
    expect(controls.spread).toBe(50);
    expect(controls.satDarker).toBe(0);
    expect(controls.satLighter).toBe(0);

    setBlendMode('overlay');
    expect(blendMode.value).toBe('overlay');
  });

  it('guards against invalid updates and resets to defaults', () => {
    const { controls, controlErrors, updateControl, resetControls, controlDefinitions } =
      useTonalBuilderControls();

    const middleDefinition = controlDefinitions.find((control) => control.id === 'middle');
    expect(middleDefinition).toBeDefined();

    const didUpdate = updateControl('middle', 200);
    expect(didUpdate).toBe(false);
    expect(controlErrors.middle?.key).toBe('tonal_builder.controls.errors.out_of_range');

    const wasValid = updateControl('middle', middleDefinition?.number.min ?? 0);
    expect(wasValid).toBe(true);
    expect(controls.middle).toBe(middleDefinition?.number.min);
    expect(controlErrors.middle).toBeNull();

    updateControl('spread', 'not-a-number');
    expect(controlErrors.spread?.key).toBe('tonal_builder.controls.errors.invalid_number');

    resetControls();
    expect(controls.middle).toBe(0);
    expect(controlErrors.middle).toBeNull();
  });
});
