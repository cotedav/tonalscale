import { computed, reactive } from 'vue';
import {
  hexToHsv,
  hexToRgb,
  isValidHex,
  normalizeHex,
  type HsvColor,
  type RgbColor,
} from '@/utils/color';

export type SliderMode = 'hsv' | 'rgb';

export type PickerState = {
  hex: string;
  rgb: RgbColor;
  hsv: HsvColor;
};

export type TonalBuilderColorState = {
  base: PickerState;
  blend: PickerState;
  sliderMode: SliderMode;
};

const DEFAULT_BASE = '#7c3aed';
const DEFAULT_BLEND = '#22d3ee';

const buildPickerState = (hex: string): PickerState => {
  const normalized = normalizeHex(hex);
  return {
    hex: normalized,
    rgb: hexToRgb(normalized),
    hsv: hexToHsv(normalized),
  };
};

export const useTonalBuilderColors = (initial?: Partial<TonalBuilderColorState>) => {
  const state = reactive<TonalBuilderColorState>({
    base: buildPickerState(initial?.base?.hex ?? DEFAULT_BASE),
    blend: buildPickerState(initial?.blend?.hex ?? DEFAULT_BLEND),
    sliderMode: initial?.sliderMode ?? 'hsv',
  });

  const baseHex = computed(() => state.base.hex);
  const blendHex = computed(() => state.blend.hex);
  const sliderMode = computed(() => state.sliderMode);

  const updateBase = (hex: string) => {
    const normalized = normalizeHex(hex);
    if (!isValidHex(normalized)) return false;

    state.base = buildPickerState(normalized);
    return true;
  };

  const updateBlend = (hex: string) => {
    const normalized = normalizeHex(hex);
    if (!isValidHex(normalized)) return false;

    state.blend = buildPickerState(normalized);
    return true;
  };

  const setSliderMode = (mode: SliderMode) => {
    state.sliderMode = mode;
  };

  return {
    state,
    baseHex,
    blendHex,
    sliderMode,
    updateBase,
    updateBlend,
    setSliderMode,
  } as const;
};
