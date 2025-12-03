import { computed, nextTick, reactive, ref, watch } from 'vue';
import { defineStore } from 'pinia';

import type { BlendControlId } from '@/composables/useTonalBuilderControls';
import { clamp } from '@/utils/collection';
import { hexToRgb, isValidHex, normalizeHex } from '@/utils/color';
import { BLEND_MODES, type BlendMode } from '@/utils/tonal/color-math';
import { getContrastRatio } from '@/utils/tonal/contrast';
import { getIntensity, getIntensityCurve } from '@/utils/tonal/easing';
import {
  generateTonalScale,
  type TonalScale,
  type TonalScaleParams,
  type TonalStep,
} from '@/utils/tonal/scale';

export const EXTENDED_SCALE_INDICES = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
] as const;

export const KEY_SCALE_INDICES = [
  0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
] as const;

export type ContrastCandidate = { index: number; hex: string; ratio: number };

export type ToneMetadata = {
  tone: TonalStep;
  darker3: ContrastCandidate | null;
  darker45: ContrastCandidate | null;
  lighter3: ContrastCandidate | null;
  lighter45: ContrastCandidate | null;
};

export type BlendDistribution = {
  curve: { x: number[]; y: number[] };
  widthPercent: number;
  lineColor: string;
};

export type TonalScaleSnapshot = {
  params: TonalScaleParams;
  baseHex: string;
  blendHex: string;
  scale: TonalScale;
  fullStrip: TonalStep[];
  extendedStrip: TonalStep[];
  keyStrip: TonalStep[];
  metadata: ToneMetadata[];
  serializedParams: string;
  blendDistribution: BlendDistribution | null;
};

const DEFAULT_BASE_HEX = '#8000ff';
const DEFAULT_BLEND_HEX = '#000032';

const DEFAULT_PARAMS: TonalScaleParams = {
  colorHex: DEFAULT_BASE_HEX,
  blendMode: 'colordodge',
  blendStrength: 0,
  blendR: 0,
  blendG: 0,
  blendB: 50,
  middle: 0,
  spread: 50,
  satDarker: 0,
  satLighter: 0,
};

const serializeParams = (params: TonalScaleParams): string => JSON.stringify(params);

const clampControl = (id: BlendControlId, value: number): number => {
  switch (id) {
    case 'strength':
      return clamp(value, 0, 100);
    case 'middle':
      return clamp(value, -50, 50);
    case 'spread':
      return clamp(value, 0, 100);
    case 'satDarker':
      return clamp(value, 0, 100);
    case 'satLighter':
      return clamp(value, 0, 100);
    default:
      return value;
  }
};

const findClosestCandidate = (
  index: number,
  scale: TonalStep[],
  ratio: number,
  direction: 'lighter' | 'darker',
): ContrastCandidate | null => {
  const step = scale[index];
  if (!step) return null;

  const increment = direction === 'lighter' ? 1 : -1;

  for (let cursor = index + increment; cursor >= 0 && cursor < scale.length; cursor += increment) {
    const candidate = scale[cursor];
    const candidateRatio = getContrastRatio(step.hex, candidate.hex);
    if (candidateRatio >= ratio) {
      return { index: candidate.index, hex: candidate.hex, ratio: candidateRatio };
    }
  }

  return null;
};

const buildMetadata = (scale: TonalStep[]): ToneMetadata[] =>
  scale.map((tone, index) => ({
    tone,
    darker3: findClosestCandidate(index, scale, 3, 'darker'),
    darker45: findClosestCandidate(index, scale, 4.5, 'darker'),
    lighter3: findClosestCandidate(index, scale, 3, 'lighter'),
    lighter45: findClosestCandidate(index, scale, 4.5, 'lighter'),
  }));

const pickIndices = (indices: readonly number[], scale: TonalStep[]): TonalStep[] =>
  indices
    .map((index) => scale.find((tone) => tone.index === index))
    .filter((tone): tone is TonalStep => Boolean(tone));

const includeBaseIndex = (
  indices: readonly number[],
  scale: TonalStep[],
  baseIndex: number,
): TonalStep[] => {
  const combined = Array.from(new Set([...indices, baseIndex])).sort((a, b) => a - b);
  return pickIndices(combined, scale);
};

const pickLineColor = (scale: TonalScale): string => {
  const probeIndex = Math.max(
    0,
    Math.min(scale.colorScale.length - 1, Math.round(scale.luminance / 2)),
  );
  const probe = scale.colorScale[probeIndex]?.hex ?? '#e2e8f0';
  const lightOption = '#e2e8f0';
  const darkOption = '#0f172a';

  const lightContrast = getContrastRatio(probe, lightOption);
  const darkContrast = getContrastRatio(probe, darkOption);

  return lightContrast >= darkContrast ? lightOption : darkOption;
};

const buildBlendDistribution = (
  params: TonalScaleParams,
  nextScale: TonalScale,
): BlendDistribution | null => {
  const curve = getIntensityCurve((params.middle + 50) / 100, params.spread / 100);

  const x: number[] = [];
  const y: number[] = [];
  const luminanceRange = Math.max(1, nextScale.luminance - 1);

  for (let i = 0; i < nextScale.luminance; i += 1) {
    x.push(i);
    y.push(getIntensity(curve, i, luminanceRange));
  }

  return {
    curve: { x, y },
    widthPercent: Math.max(0, nextScale.luminance - 1),
    lineColor: pickLineColor(nextScale),
  };
};

export const useTonalScaleStore = defineStore('tonalScale', () => {
  const baseHex = ref<string>(normalizeHex(DEFAULT_BASE_HEX));
  const blendHex = ref<string>(normalizeHex(DEFAULT_BLEND_HEX));
  const blendMode = ref<BlendMode>(DEFAULT_PARAMS.blendMode);
  const controls = reactive({
    strength: DEFAULT_PARAMS.blendStrength,
    middle: DEFAULT_PARAMS.middle,
    spread: DEFAULT_PARAMS.spread,
    satDarker: DEFAULT_PARAMS.satDarker,
    satLighter: DEFAULT_PARAMS.satLighter,
  });

  const scale = ref<TonalScale>(generateTonalScale(DEFAULT_PARAMS));
  const metadata = ref<ToneMetadata[]>(buildMetadata(scale.value.colorScale));
  let suppressWatchRefresh = false;
  let pendingRefresh: ReturnType<typeof setTimeout> | null = null;

  const scaleParams = computed<TonalScaleParams>(() => {
    const blendRgb = hexToRgb(blendHex.value);

    return {
      colorHex: baseHex.value,
      blendMode: blendMode.value,
      blendStrength: controls.strength,
      blendR: blendRgb.r,
      blendG: blendRgb.g,
      blendB: blendRgb.b,
      middle: controls.middle,
      spread: controls.spread,
      satDarker: controls.satDarker,
      satLighter: controls.satLighter,
    };
  });

  const baseIndex = computed(() => scale.value.luminance);
  const fullStrip = computed(() => scale.value.colorScale);
  const extendedStrip = computed(() =>
    includeBaseIndex(EXTENDED_SCALE_INDICES, scale.value.colorScale, baseIndex.value),
  );
  const keyStrip = computed(() =>
    includeBaseIndex(KEY_SCALE_INDICES, scale.value.colorScale, baseIndex.value),
  );
  const serializedParams = computed(() => serializeParams(scaleParams.value));
  const blendDistribution = computed(() => buildBlendDistribution(scaleParams.value, scale.value));

  const listeners = new Set<(snapshot: TonalScaleSnapshot) => void>();

  const broadcast = () => {
    const snapshot: TonalScaleSnapshot = {
      params: scaleParams.value,
      baseHex: baseHex.value,
      blendHex: blendHex.value,
      scale: scale.value,
      fullStrip: fullStrip.value,
      extendedStrip: extendedStrip.value,
      keyStrip: keyStrip.value,
      metadata: metadata.value,
      serializedParams: serializedParams.value,
      blendDistribution: blendDistribution.value,
    };
    listeners.forEach((listener) => listener(snapshot));
  };

  const refreshScale = (params: TonalScaleParams) => {
    scale.value = generateTonalScale(params);
    metadata.value = buildMetadata(scale.value.colorScale);
    broadcast();
  };

  const cancelPendingRefresh = () => {
    if (pendingRefresh) {
      clearTimeout(pendingRefresh);
      pendingRefresh = null;
    }
  };

  const scheduleRefresh = (params: TonalScaleParams) => {
    cancelPendingRefresh();
    pendingRefresh = setTimeout(() => {
      refreshScale(params);
      pendingRefresh = null;
    }, 50);
  };

  const withSuppressedRefresh = (params: TonalScaleParams, operation: () => void) => {
    suppressWatchRefresh = true;
    try {
      operation();
      cancelPendingRefresh();
      refreshScale(params);
    } finally {
      nextTick(() => {
        suppressWatchRefresh = false;
      });
    }
  };

  const updateControl = (id: BlendControlId, value: number) => {
    controls[id] = clampControl(id, value);
  };

  const setBaseHex = (hex: string) => {
    if (!isValidHex(hex)) return false;
    baseHex.value = normalizeHex(hex);
    return true;
  };

  const setBlendHex = (hex: string) => {
    if (!isValidHex(hex)) return false;
    blendHex.value = normalizeHex(hex);
    return true;
  };

  const setBlendMode = (mode: BlendMode) => {
    if (!BLEND_MODES.has(mode)) return false;
    blendMode.value = mode;
    return true;
  };

  const loadDefaults = () => {
    withSuppressedRefresh(DEFAULT_PARAMS, () => {
      baseHex.value = normalizeHex(DEFAULT_BASE_HEX);
      blendHex.value = normalizeHex(DEFAULT_BLEND_HEX);
      blendMode.value = DEFAULT_PARAMS.blendMode;
      updateControl('strength', DEFAULT_PARAMS.blendStrength);
      updateControl('middle', DEFAULT_PARAMS.middle);
      updateControl('spread', DEFAULT_PARAMS.spread);
      updateControl('satDarker', DEFAULT_PARAMS.satDarker);
      updateControl('satLighter', DEFAULT_PARAMS.satLighter);
    });
  };

  const importState = (payload: string | Partial<TonalScaleParams>) => {
    const parsed = (() => {
      if (typeof payload !== 'string') return payload;
      try {
        return JSON.parse(payload);
      } catch {
        return null;
      }
    })();
    if (!parsed) return false;

    const nextParams: TonalScaleParams = {
      colorHex: isValidHex(parsed.colorHex ?? '')
        ? normalizeHex(parsed.colorHex as string)
        : baseHex.value,
      blendMode: BLEND_MODES.has(parsed.blendMode as BlendMode)
        ? (parsed.blendMode as BlendMode)
        : blendMode.value,
      blendStrength: clampControl('strength', Number(parsed.blendStrength ?? controls.strength)),
      blendR: clamp(Number(parsed.blendR ?? hexToRgb(blendHex.value).r), 0, 255),
      blendG: clamp(Number(parsed.blendG ?? hexToRgb(blendHex.value).g), 0, 255),
      blendB: clamp(Number(parsed.blendB ?? hexToRgb(blendHex.value).b), 0, 255),
      middle: clampControl('middle', Number(parsed.middle ?? controls.middle)),
      spread: clampControl('spread', Number(parsed.spread ?? controls.spread)),
      satDarker: clampControl('satDarker', Number(parsed.satDarker ?? controls.satDarker)),
      satLighter: clampControl('satLighter', Number(parsed.satLighter ?? controls.satLighter)),
    };

    withSuppressedRefresh(nextParams, () => {
      baseHex.value = nextParams.colorHex;
      blendHex.value = normalizeHex(
        `#${[nextParams.blendR, nextParams.blendG, nextParams.blendB]
          .map((channel) => channel.toString(16).padStart(2, '0'))
          .join('')}`,
      );
      blendMode.value = nextParams.blendMode;
      controls.strength = nextParams.blendStrength;
      controls.middle = nextParams.middle;
      controls.spread = nextParams.spread;
      controls.satDarker = nextParams.satDarker;
      controls.satLighter = nextParams.satLighter;
    });
    return true;
  };

  const exportState = () => serializedParams.value;

  const onSnapshot = (listener: (snapshot: TonalScaleSnapshot) => void) => {
    listeners.add(listener);
    listener({
      params: scaleParams.value,
      baseHex: baseHex.value,
      blendHex: blendHex.value,
      scale: scale.value,
      fullStrip: fullStrip.value,
      extendedStrip: extendedStrip.value,
      keyStrip: keyStrip.value,
      metadata: metadata.value,
      serializedParams: serializedParams.value,
      blendDistribution: blendDistribution.value,
    });

    return () => listeners.delete(listener);
  };

  watch(
    scaleParams,
    (nextParams) => {
      if (suppressWatchRefresh) return;
      scheduleRefresh(nextParams);
    },
    { deep: true },
  );

  return {
    baseHex,
    blendHex,
    blendMode,
    controls,
    scale,
    metadata,
    fullStrip,
    extendedStrip,
    keyStrip,
    serializedParams,
    blendDistribution,
    exportState,
    importState,
    setBaseHex,
    setBlendHex,
    setBlendMode,
    updateControl,
    loadDefaults,
    onSnapshot,
  };
});
