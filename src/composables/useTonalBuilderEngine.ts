import { computed, ref, watch } from 'vue';

import type { BlendControlId, BlendMode } from './useTonalBuilderControls';

type ColorSources = {
  baseHex: { value: string };
  blendHex: { value: string };
};

type ControlSources = {
  blendMode: { value: BlendMode };
  controls: Record<BlendControlId, number>;
  hasErrors: { value: boolean };
};

export type TonalEnginePayload = {
  baseHex: string;
  blendHex: string;
  blendMode: BlendMode;
  strength: number;
  middle: number;
  spread: number;
  satDarker: number;
  satLighter: number;
};

type TonalBuilderEngineOptions = {
  onUpdate?: (payload: TonalEnginePayload) => void;
};

export const useTonalBuilderEngine = (
  sources: {
    colors: ColorSources;
    controls: ControlSources;
  },
  options?: TonalBuilderEngineOptions,
) => {
  const lastPayload = ref<TonalEnginePayload | null>(null);

  const payload = computed<TonalEnginePayload>(() => ({
    baseHex: sources.colors.baseHex.value,
    blendHex: sources.colors.blendHex.value,
    blendMode: sources.controls.blendMode.value,
    strength: sources.controls.controls.strength,
    middle: sources.controls.controls.middle,
    spread: sources.controls.controls.spread,
    satDarker: sources.controls.controls.satDarker,
    satLighter: sources.controls.controls.satLighter,
  }));

  const dispatch = (nextPayload: TonalEnginePayload) => {
    lastPayload.value = nextPayload;
    options?.onUpdate?.(nextPayload);
  };

  watch(
    () => ({ payload: payload.value, invalid: sources.controls.hasErrors.value }),
    ({ payload: nextPayload, invalid }) => {
      if (invalid) return;
      dispatch(nextPayload);
    },
    { deep: true, immediate: true },
  );

  return {
    payload,
    lastPayload,
  } as const;
};
