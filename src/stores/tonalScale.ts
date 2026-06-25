import { computed, reactive, ref, watch } from 'vue';
import { defineStore } from 'pinia';

import type { BlendControlId } from '@/composables/useTonalBuilderControls';
import { clamp } from '@/utils/collection';
import { hexToRgb, isValidHex, normalizeHex, rgbToHex } from '@/utils/color';
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

export type TonalColorRole = 'surface' | 'primary';
export type SurfaceContrast = 'low' | 'medium' | 'high';

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

export type RoleTonalState = {
  baseHex: string;
  blendHex: string;
  blendMode: BlendMode;
  controls: {
    strength: number;
    middle: number;
    spread: number;
    satDarker: number;
    satLighter: number;
  };
};

export type TonalPersistenceState = {
  version: 2;
  activeRole: TonalColorRole;
  roles: Record<TonalColorRole, RoleTonalState>;
  preview: {
    darkMode: boolean;
    surfaceContrast: SurfaceContrast;
    lightSurfaceTone: number;
    darkSurfaceTone: number;
  };
};

export type TonalScaleSnapshot = {
  role: TonalColorRole;
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

type RoleRuntime = {
  state: RoleTonalState;
  scale: TonalScale;
  metadata: ToneMetadata[];
};

const DEFAULT_ROLE_STATES: Record<TonalColorRole, RoleTonalState> = {
  surface: {
    baseHex: '#8000ff',
    blendHex: '#000032',
    blendMode: 'colordodge',
    controls: {
      strength: 0,
      middle: 0,
      spread: 50,
      satDarker: 0,
      satLighter: 0,
    },
  },
  primary: {
    baseHex: '#6750a4',
    blendHex: '#000032',
    blendMode: 'colordodge',
    controls: {
      strength: 0,
      middle: 0,
      spread: 50,
      satDarker: 0,
      satLighter: 0,
    },
  },
};

const DEFAULT_PREVIEW_STATE: TonalPersistenceState['preview'] = {
  darkMode: false,
  surfaceContrast: 'low',
  lightSurfaceTone: 100,
  darkSurfaceTone: 0,
};

const cloneRoleState = (state: RoleTonalState): RoleTonalState => ({
  ...state,
  controls: { ...state.controls },
});

const roleStateToParams = (state: RoleTonalState): TonalScaleParams => {
  const blend = hexToRgb(state.blendHex);
  return {
    colorHex: state.baseHex,
    blendMode: state.blendMode,
    blendStrength: state.controls.strength,
    blendR: blend.r,
    blendG: blend.g,
    blendB: blend.b,
    middle: state.controls.middle,
    spread: state.controls.spread,
    satDarker: state.controls.satDarker,
    satLighter: state.controls.satLighter,
  };
};

const clampControl = (id: BlendControlId, value: number): number => {
  switch (id) {
    case 'strength':
      return clamp(value, 0, 100);
    case 'middle':
      return clamp(value, -50, 50);
    case 'spread':
    case 'satDarker':
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
): TonalStep[] =>
  pickIndices(
    Array.from(new Set([...indices, baseIndex])).sort((a, b) => a - b),
    scale,
  );

const pickLineColor = (scale: TonalScale): string => {
  const probeIndex = Math.max(
    0,
    Math.min(scale.colorScale.length - 1, Math.round(scale.luminance / 2)),
  );
  const probe = scale.colorScale[probeIndex]?.hex ?? '#e2e8f0';
  const { r, g, b } = hexToRgb(probe);
  return rgbToHex({ r: 255 - r, g: 255 - g, b: 255 - b });
};

const buildBlendDistribution = (
  params: TonalScaleParams,
  scale: TonalScale,
): BlendDistribution | null => {
  const curve = getIntensityCurve((params.middle + 50) / 100, params.spread / 100);
  const x: number[] = [];
  const y: number[] = [];
  const luminanceRange = Math.max(1, scale.luminance - 1);

  for (let index = 0; index < scale.luminance; index += 1) {
    x.push(index);
    y.push(getIntensity(curve, index, luminanceRange));
  }

  return {
    curve: { x, y },
    widthPercent: Math.max(0, scale.luminance - 1),
    lineColor: pickLineColor(scale),
  };
};

const normalizeRoleState = (
  input: Partial<RoleTonalState> | Partial<TonalScaleParams> | undefined,
  fallback: RoleTonalState,
): RoleTonalState => {
  const source = input ?? {};
  const legacySource = source as Partial<TonalScaleParams>;
  const { blendStrength: legacyBlendStrength } = legacySource;
  const controls: Partial<RoleTonalState['controls']> =
    'controls' in source && source.controls ? source.controls : {};
  const { baseHex: fallbackBaseHex, controls: fallbackControls } = fallback;
  const { strength: fallbackStrength } = fallbackControls;
  const { strength: controlStrength } = controls;
  const blendRgb = hexToRgb(fallback.blendHex);
  const blendHex =
    'blendHex' in source && isValidHex(String(source.blendHex))
      ? normalizeHex(String(source.blendHex))
      : normalizeHex(
          `#${[
            clamp(Number('blendR' in source ? source.blendR : blendRgb.r), 0, 255),
            clamp(Number('blendG' in source ? source.blendG : blendRgb.g), 0, 255),
            clamp(Number('blendB' in source ? source.blendB : blendRgb.b), 0, 255),
          ]
            .map((channel) => channel.toString(16).padStart(2, '0'))
            .join('')}`,
        );
  let baseHex = fallbackBaseHex;
  if ('baseHex' in source && isValidHex(String(source.baseHex))) {
    baseHex = normalizeHex(String(source.baseHex));
  } else if ('colorHex' in source && isValidHex(String(source.colorHex))) {
    baseHex = normalizeHex(String(source.colorHex));
  }
  let strength = fallbackStrength;
  if (controlStrength !== undefined) {
    strength = Number(controlStrength);
  } else if (legacyBlendStrength !== undefined) {
    strength = Number(legacyBlendStrength);
  }

  return {
    baseHex,
    blendHex,
    blendMode:
      'blendMode' in source && BLEND_MODES.has(source.blendMode as BlendMode)
        ? (source.blendMode as BlendMode)
        : fallback.blendMode,
    controls: {
      strength: clampControl('strength', strength),
      middle: clampControl(
        'middle',
        Number(
          'middle' in controls
            ? controls.middle
            : (legacySource.middle ?? fallback.controls.middle),
        ),
      ),
      spread: clampControl(
        'spread',
        Number(
          'spread' in controls
            ? controls.spread
            : (legacySource.spread ?? fallback.controls.spread),
        ),
      ),
      satDarker: clampControl(
        'satDarker',
        Number(
          'satDarker' in controls
            ? controls.satDarker
            : (legacySource.satDarker ?? fallback.controls.satDarker),
        ),
      ),
      satLighter: clampControl(
        'satLighter',
        Number(
          'satLighter' in controls
            ? controls.satLighter
            : (legacySource.satLighter ?? fallback.controls.satLighter),
        ),
      ),
    },
  };
};

const parsePersistenceState = (payload: unknown): TonalPersistenceState | null => {
  const parsed = (() => {
    if (typeof payload !== 'string') return payload;
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  })();
  if (!parsed || typeof parsed !== 'object') return null;

  const input = parsed as Record<string, unknown>;
  if (input.version !== undefined && Number(input.version) !== 2) return null;

  if (input.roles && typeof input.roles === 'object') {
    const roles = input.roles as Partial<Record<TonalColorRole, Partial<RoleTonalState>>>;
    const previewInput =
      input.preview && typeof input.preview === 'object'
        ? (input.preview as Partial<TonalPersistenceState['preview']>)
        : {};
    const activeRole: TonalColorRole = input.activeRole === 'primary' ? 'primary' : 'surface';
    const surfaceContrast: SurfaceContrast = ['low', 'medium', 'high'].includes(
      String(previewInput.surfaceContrast),
    )
      ? (previewInput.surfaceContrast as SurfaceContrast)
      : DEFAULT_PREVIEW_STATE.surfaceContrast;

    return {
      version: 2,
      activeRole,
      roles: {
        surface: normalizeRoleState(roles.surface, DEFAULT_ROLE_STATES.surface),
        primary: normalizeRoleState(roles.primary, DEFAULT_ROLE_STATES.primary),
      },
      preview: {
        darkMode: Boolean(previewInput.darkMode),
        surfaceContrast,
        lightSurfaceTone: clamp(
          Number(previewInput.lightSurfaceTone ?? DEFAULT_PREVIEW_STATE.lightSurfaceTone),
          80,
          100,
        ),
        darkSurfaceTone: clamp(
          Number(previewInput.darkSurfaceTone ?? DEFAULT_PREVIEW_STATE.darkSurfaceTone),
          0,
          25,
        ),
      },
    };
  }

  return {
    version: 2,
    activeRole: 'surface',
    roles: {
      surface: normalizeRoleState(input as Partial<TonalScaleParams>, DEFAULT_ROLE_STATES.surface),
      primary: cloneRoleState(DEFAULT_ROLE_STATES.primary),
    },
    preview: { ...DEFAULT_PREVIEW_STATE },
  };
};

export const useTonalScaleStore = defineStore('tonalScale', () => {
  const activeRole = ref<TonalColorRole>('surface');
  const preview = reactive({ ...DEFAULT_PREVIEW_STATE });
  const roles = reactive<Record<TonalColorRole, RoleRuntime>>({
    surface: {
      state: cloneRoleState(DEFAULT_ROLE_STATES.surface),
      scale: generateTonalScale(roleStateToParams(DEFAULT_ROLE_STATES.surface)),
      metadata: [],
    },
    primary: {
      state: cloneRoleState(DEFAULT_ROLE_STATES.primary),
      scale: generateTonalScale(roleStateToParams(DEFAULT_ROLE_STATES.primary)),
      metadata: [],
    },
  });
  roles.surface.metadata = buildMetadata(roles.surface.scale.colorScale);
  roles.primary.metadata = buildMetadata(roles.primary.scale.colorScale);

  const listeners = new Set<(snapshot: TonalScaleSnapshot) => void>();
  const pendingRefreshes: Partial<Record<TonalColorRole, number>> = {};
  let suppressRefresh = false;

  const getRoleParams = (role: TonalColorRole) => roleStateToParams(roles[role].state);
  const getRoleFullStrip = (role: TonalColorRole) => roles[role].scale.colorScale;
  const getRoleExtendedStrip = (role: TonalColorRole) =>
    includeBaseIndex(
      EXTENDED_SCALE_INDICES,
      roles[role].scale.colorScale,
      roles[role].scale.luminance,
    );
  const getRoleKeyStrip = (role: TonalColorRole) =>
    includeBaseIndex(KEY_SCALE_INDICES, roles[role].scale.colorScale, roles[role].scale.luminance);

  const snapshotFor = (role: TonalColorRole): TonalScaleSnapshot => {
    const params = getRoleParams(role);
    return {
      role,
      params,
      baseHex: roles[role].state.baseHex,
      blendHex: roles[role].state.blendHex,
      scale: roles[role].scale,
      fullStrip: getRoleFullStrip(role),
      extendedStrip: getRoleExtendedStrip(role),
      keyStrip: getRoleKeyStrip(role),
      metadata: roles[role].metadata,
      serializedParams: JSON.stringify(params),
      blendDistribution: buildBlendDistribution(params, roles[role].scale),
    };
  };

  const refreshRole = (role: TonalColorRole, shouldBroadcast = true) => {
    const params = getRoleParams(role);
    roles[role].scale = generateTonalScale(params);
    roles[role].metadata = buildMetadata(roles[role].scale.colorScale);
    const snapshot = snapshotFor(role);
    if (shouldBroadcast) listeners.forEach((listener) => listener(snapshot));
  };

  const scheduleRefresh = (role: TonalColorRole) => {
    const pending = pendingRefreshes[role];
    if (pending !== undefined) cancelAnimationFrame(pending);
    pendingRefreshes[role] = requestAnimationFrame(() => {
      refreshRole(role);
      delete pendingRefreshes[role];
    });
  };

  const persistenceState = computed<TonalPersistenceState>(() => ({
    version: 2,
    activeRole: activeRole.value,
    roles: {
      surface: cloneRoleState(roles.surface.state),
      primary: cloneRoleState(roles.primary.state),
    },
    preview: { ...preview },
  }));

  const activeState = computed(() => roles[activeRole.value].state);
  const baseHex = computed({
    get: () => activeState.value.baseHex,
    set: (value: string) => {
      if (isValidHex(value)) activeState.value.baseHex = normalizeHex(value);
    },
  });
  const blendHex = computed({
    get: () => activeState.value.blendHex,
    set: (value: string) => {
      if (isValidHex(value)) activeState.value.blendHex = normalizeHex(value);
    },
  });
  const blendMode = computed({
    get: () => activeState.value.blendMode,
    set: (value: BlendMode) => {
      if (BLEND_MODES.has(value)) activeState.value.blendMode = value;
    },
  });
  const controls = computed(() => activeState.value.controls);
  const scale = computed(() => roles[activeRole.value].scale);
  const metadata = computed(() => roles[activeRole.value].metadata);
  const scaleParams = computed(() => getRoleParams(activeRole.value));
  const fullStrip = computed(() => getRoleFullStrip(activeRole.value));
  const extendedStrip = computed(() => getRoleExtendedStrip(activeRole.value));
  const keyStrip = computed(() => getRoleKeyStrip(activeRole.value));
  const blendDistribution = computed(() => buildBlendDistribution(scaleParams.value, scale.value));
  const serializedParams = computed(() => JSON.stringify(scaleParams.value));
  const serializedState = computed(() => JSON.stringify(persistenceState.value));
  const surfaceExtendedStrip = computed(() => getRoleExtendedStrip('surface'));
  const primaryExtendedStrip = computed(() => getRoleExtendedStrip('primary'));

  const setActiveRole = (role: TonalColorRole) => {
    activeRole.value = role;
  };
  const updateControl = (id: BlendControlId, value: number) => {
    activeState.value.controls[id] = clampControl(id, value);
  };
  const setBaseHex = (hex: string) => {
    if (!isValidHex(hex)) return false;
    baseHex.value = hex;
    return true;
  };
  const setBlendHex = (hex: string) => {
    if (!isValidHex(hex)) return false;
    blendHex.value = hex;
    return true;
  };
  const setBlendMode = (mode: BlendMode) => {
    if (!BLEND_MODES.has(mode)) return false;
    blendMode.value = mode;
    return true;
  };

  const applyPersistenceState = (state: TonalPersistenceState) => {
    suppressRefresh = true;
    roles.surface.state = cloneRoleState(state.roles.surface);
    roles.primary.state = cloneRoleState(state.roles.primary);
    activeRole.value = state.activeRole;
    Object.assign(preview, state.preview);
    Object.values(pendingRefreshes).forEach((pending) => {
      if (pending !== undefined) cancelAnimationFrame(pending);
    });
    refreshRole('surface', false);
    refreshRole('primary', false);
    const snapshot = snapshotFor(activeRole.value);
    listeners.forEach((listener) => listener(snapshot));
    suppressRefresh = false;
  };

  const importState = (payload: unknown) => {
    const parsed = parsePersistenceState(payload);
    if (!parsed) return false;
    applyPersistenceState(parsed);
    return true;
  };
  const importRoleState = (role: TonalColorRole, payload: Partial<TonalScaleParams>) => {
    roles[role].state = normalizeRoleState(payload, roles[role].state);
    return true;
  };
  const exportState = () => serializedState.value;
  const loadDefaults = () =>
    applyPersistenceState({
      version: 2,
      activeRole: 'surface',
      roles: {
        surface: cloneRoleState(DEFAULT_ROLE_STATES.surface),
        primary: cloneRoleState(DEFAULT_ROLE_STATES.primary),
      },
      preview: { ...DEFAULT_PREVIEW_STATE },
    });

  const onSnapshot = (listener: (snapshot: TonalScaleSnapshot) => void) => {
    listeners.add(listener);
    listener(snapshotFor(activeRole.value));
    return () => listeners.delete(listener);
  };

  (['surface', 'primary'] as const).forEach((role) => {
    watch(
      () => roles[role].state,
      () => {
        if (!suppressRefresh) scheduleRefresh(role);
      },
      { deep: true, flush: 'sync' },
    );
  });

  return {
    activeRole,
    preview,
    roles,
    baseHex,
    blendHex,
    blendMode,
    controls,
    scale,
    scaleParams,
    metadata,
    fullStrip,
    extendedStrip,
    keyStrip,
    surfaceExtendedStrip,
    primaryExtendedStrip,
    serializedParams,
    serializedState,
    persistenceState,
    blendDistribution,
    exportState,
    importState,
    importRoleState,
    setActiveRole,
    setBaseHex,
    setBlendHex,
    setBlendMode,
    updateControl,
    loadDefaults,
    onSnapshot,
  };
});
