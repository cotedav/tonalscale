import { computed, reactive, ref, watch, type WatchStopHandle } from 'vue';
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

export const BUILT_IN_ROLE_IDS = ['surface', 'primary', 'secondary', 'tertiary', 'error'] as const;
export const TONAL_PERSISTENCE_SCHEMA_VERSION = 3;
export type BuiltInTonalColorRole = (typeof BUILT_IN_ROLE_IDS)[number];
export type TonalColorRole = string;
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

export type ColorRoleKind = 'surface' | 'accent' | 'custom';

export type ColorRoleCapabilities = {
  tonalScale: boolean;
  materialSurfaces: boolean;
  appPreviewExamples: boolean;
};

export type ColorRoleMeta = {
  id: TonalColorRole;
  label: string;
  isBuiltIn: boolean;
  kind: ColorRoleKind;
  deletable: boolean;
  capabilities: ColorRoleCapabilities;
};

export type RoleSurfacePreviewSettings = {
  contrast: SurfaceContrast;
  lightSurfaceTone: number;
  darkSurfaceTone: number;
};

export type RoleRenameResult = {
  success: boolean;
  error?: 'not_found' | 'protected' | 'empty' | 'duplicate';
};

export type TonalPersistenceState = {
  version: typeof TONAL_PERSISTENCE_SCHEMA_VERSION;
  activeRole: TonalColorRole;
  roleOrder: TonalColorRole[];
  roleMeta: Record<TonalColorRole, ColorRoleMeta>;
  roles: Record<TonalColorRole, RoleTonalState>;
  preview: {
    darkMode: boolean;
    roleSettings: Record<TonalColorRole, RoleSurfacePreviewSettings>;
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

const DEFAULT_ROLE_STATES: Record<BuiltInTonalColorRole, RoleTonalState> = {
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
  secondary: {
    baseHex: '#625b71',
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
  tertiary: {
    baseHex: '#7d5260',
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
  error: {
    baseHex: '#b3261e',
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

const DEFAULT_ROLE_ORDER: BuiltInTonalColorRole[] = [...BUILT_IN_ROLE_IDS];

const DEFAULT_ROLE_CAPABILITIES: ColorRoleCapabilities = {
  tonalScale: true,
  materialSurfaces: true,
  appPreviewExamples: false,
};

const DEFAULT_ROLE_META: Record<BuiltInTonalColorRole, ColorRoleMeta> = {
  surface: {
    id: 'surface',
    label: 'Surface',
    isBuiltIn: true,
    kind: 'surface',
    deletable: false,
    capabilities: {
      ...DEFAULT_ROLE_CAPABILITIES,
      appPreviewExamples: true,
    },
  },
  primary: {
    id: 'primary',
    label: 'Primary',
    isBuiltIn: true,
    kind: 'accent',
    deletable: false,
    capabilities: {
      ...DEFAULT_ROLE_CAPABILITIES,
      appPreviewExamples: true,
    },
  },
  secondary: {
    id: 'secondary',
    label: 'Secondary',
    isBuiltIn: true,
    kind: 'accent',
    deletable: false,
    capabilities: {
      ...DEFAULT_ROLE_CAPABILITIES,
      appPreviewExamples: true,
    },
  },
  tertiary: {
    id: 'tertiary',
    label: 'Tertiary',
    isBuiltIn: true,
    kind: 'accent',
    deletable: false,
    capabilities: {
      ...DEFAULT_ROLE_CAPABILITIES,
      appPreviewExamples: true,
    },
  },
  error: {
    id: 'error',
    label: 'Error',
    isBuiltIn: true,
    kind: 'accent',
    deletable: false,
    capabilities: {
      ...DEFAULT_ROLE_CAPABILITIES,
      appPreviewExamples: true,
    },
  },
};

const DEFAULT_ROLE_PREVIEW_SETTINGS: RoleSurfacePreviewSettings = {
  contrast: 'low',
  lightSurfaceTone: 100,
  darkSurfaceTone: 0,
};

const DEFAULT_PREVIEW_STATE: TonalPersistenceState['preview'] = {
  darkMode: false,
  roleSettings: {
    ...Object.fromEntries(
      DEFAULT_ROLE_ORDER.map((role) => [role, { ...DEFAULT_ROLE_PREVIEW_SETTINGS }]),
    ),
  },
};

const cloneRoleState = (state: RoleTonalState): RoleTonalState => ({
  ...state,
  controls: { ...state.controls },
});

const cloneRoleMeta = (meta: ColorRoleMeta): ColorRoleMeta => ({
  ...meta,
  capabilities: { ...meta.capabilities },
});

const clonePreviewSettings = (
  settings: RoleSurfacePreviewSettings,
): RoleSurfacePreviewSettings => ({
  ...settings,
});

const cloneDefaultRoleMeta = () =>
  Object.fromEntries(
    DEFAULT_ROLE_ORDER.map((role) => [role, cloneRoleMeta(DEFAULT_ROLE_META[role])]),
  ) as Record<TonalColorRole, ColorRoleMeta>;

const cloneDefaultRoleStates = () =>
  Object.fromEntries(
    DEFAULT_ROLE_ORDER.map((role) => [role, cloneRoleState(DEFAULT_ROLE_STATES[role])]),
  ) as Record<TonalColorRole, RoleTonalState>;

const cloneDefaultRolePreviewSettings = () =>
  Object.fromEntries(
    DEFAULT_ROLE_ORDER.map((role) => [role, clonePreviewSettings(DEFAULT_ROLE_PREVIEW_SETTINGS)]),
  ) as Record<TonalColorRole, RoleSurfacePreviewSettings>;

const createDefaultPersistenceState = (): TonalPersistenceState => ({
  version: TONAL_PERSISTENCE_SCHEMA_VERSION,
  activeRole: 'surface',
  roleOrder: [...DEFAULT_ROLE_ORDER],
  roleMeta: cloneDefaultRoleMeta(),
  roles: cloneDefaultRoleStates(),
  preview: {
    darkMode: DEFAULT_PREVIEW_STATE.darkMode,
    roleSettings: cloneDefaultRolePreviewSettings(),
  },
});

const isBuiltInRole = (role: TonalColorRole): role is BuiltInTonalColorRole =>
  (BUILT_IN_ROLE_IDS as readonly string[]).includes(role);

const fallbackRoleStateFor = (role: TonalColorRole): RoleTonalState =>
  cloneRoleState(isBuiltInRole(role) ? DEFAULT_ROLE_STATES[role] : DEFAULT_ROLE_STATES.primary);

const normalizeRoleIdBase = (value: string): TonalColorRole => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replaceAll(/^_+|_+$/g, '');

  return normalized || 'custom_role';
};

const createUniqueRoleId = (
  label: string,
  existingIds: Iterable<TonalColorRole>,
): TonalColorRole => {
  const existing = new Set(existingIds);
  const base = normalizeRoleIdBase(label);
  let candidate = base;
  let suffix = 2;

  while (existing.has(candidate)) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const createUniqueRoleLabel = (label: string, existingLabels: Iterable<string>): string => {
  const existing = new Set(
    Array.from(existingLabels).map((existingLabel) => existingLabel.toLowerCase()),
  );
  const base = label.trim() || 'Custom role';
  let candidate = base;
  let suffix = 2;

  while (existing.has(candidate.toLowerCase())) {
    candidate = `${base} ${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const normalizeRoleId = (value: unknown): TonalColorRole | null => {
  if (typeof value !== 'string') return null;
  const normalized = normalizeRoleIdBase(value);

  return normalized;
};

const normalizeSurfaceContrast = (
  value: unknown,
  fallback: SurfaceContrast = DEFAULT_ROLE_PREVIEW_SETTINGS.contrast,
): SurfaceContrast =>
  ['low', 'medium', 'high'].includes(String(value)) ? (value as SurfaceContrast) : fallback;

const normalizeNumber = (value: unknown, fallback: number): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizePreviewSettings = (
  input: Partial<RoleSurfacePreviewSettings> | undefined,
): RoleSurfacePreviewSettings => ({
  contrast: normalizeSurfaceContrast(input?.contrast),
  lightSurfaceTone: clamp(
    normalizeNumber(input?.lightSurfaceTone, DEFAULT_ROLE_PREVIEW_SETTINGS.lightSurfaceTone),
    80,
    100,
  ),
  darkSurfaceTone: clamp(
    normalizeNumber(input?.darkSurfaceTone, DEFAULT_ROLE_PREVIEW_SETTINGS.darkSurfaceTone),
    0,
    25,
  ),
});

const createCustomRoleMeta = (id: TonalColorRole, label: string): ColorRoleMeta => ({
  id,
  label,
  isBuiltIn: false,
  kind: 'custom',
  deletable: true,
  capabilities: { ...DEFAULT_ROLE_CAPABILITIES },
});

const normalizeRoleMeta = (
  id: TonalColorRole,
  input: Partial<ColorRoleMeta> | undefined,
): ColorRoleMeta => {
  if (isBuiltInRole(id)) return cloneRoleMeta(DEFAULT_ROLE_META[id]);

  const label = typeof input?.label === 'string' && input.label.trim() ? input.label.trim() : id;
  const kind: ColorRoleKind = ['surface', 'accent', 'custom'].includes(String(input?.kind))
    ? (input?.kind as ColorRoleKind)
    : 'custom';

  return {
    id,
    label,
    isBuiltIn: false,
    kind,
    deletable: input?.deletable ?? true,
    capabilities: {
      ...DEFAULT_ROLE_CAPABILITIES,
      ...(input?.capabilities ?? {}),
    },
  };
};

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
  if (!input || typeof input !== 'object') return cloneRoleState(fallback);

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
  const inputVersion = Number(input.version ?? TONAL_PERSISTENCE_SCHEMA_VERSION);
  if (![2, TONAL_PERSISTENCE_SCHEMA_VERSION].includes(inputVersion)) return null;

  if (input.roles && typeof input.roles === 'object') {
    const inputRoles = input.roles as Record<string, Partial<RoleTonalState>>;
    const previewInput =
      input.preview && typeof input.preview === 'object'
        ? (input.preview as Record<string, unknown>)
        : {};
    const roleIds = new Set<TonalColorRole>(DEFAULT_ROLE_ORDER);
    const roleKeyLookup = new Map<string, TonalColorRole>();

    Object.keys(inputRoles).forEach((key) => {
      const normalized = normalizeRoleId(key);
      if (!normalized) return;
      roleIds.add(normalized);
      roleKeyLookup.set(key, normalized);
    });

    const inputRoleOrder = Array.isArray(input.roleOrder)
      ? input.roleOrder
          .map((role) => normalizeRoleId(role))
          .filter((role): role is TonalColorRole => {
            if (!role) return false;
            return roleIds.has(role);
          })
      : [];
    const roleOrder = Array.from(new Set([...inputRoleOrder, ...DEFAULT_ROLE_ORDER, ...roleIds]));

    const roles = roleOrder.reduce<Record<TonalColorRole, RoleTonalState>>((accumulator, role) => {
      accumulator[role] = normalizeRoleState(undefined, fallbackRoleStateFor(role));
      return accumulator;
    }, {});

    Object.entries(inputRoles).forEach(([key, value]) => {
      const role = roleKeyLookup.get(key);
      if (!role) return;
      roles[role] = normalizeRoleState(value, fallbackRoleStateFor(role));
    });

    const inputRoleMeta =
      input.roleMeta && typeof input.roleMeta === 'object'
        ? (input.roleMeta as Record<string, Partial<ColorRoleMeta>>)
        : {};
    const roleMeta = roleOrder.reduce<Record<TonalColorRole, ColorRoleMeta>>(
      (accumulator, role) => {
        accumulator[role] = normalizeRoleMeta(role, inputRoleMeta[role]);
        return accumulator;
      },
      {},
    );

    const legacyPreviewSettings: Record<TonalColorRole, RoleSurfacePreviewSettings> = {
      surface: normalizePreviewSettings({
        contrast: previewInput.surfaceContrast as SurfaceContrast,
        lightSurfaceTone: Number(previewInput.lightSurfaceTone),
        darkSurfaceTone: Number(previewInput.darkSurfaceTone),
      }),
      primary: normalizePreviewSettings({
        contrast: previewInput.primarySurfaceContrast as SurfaceContrast,
        lightSurfaceTone: Number(previewInput.primaryLightSurfaceTone),
        darkSurfaceTone: Number(previewInput.primaryDarkSurfaceTone),
      }),
    };
    const inputRoleSettings =
      previewInput.roleSettings && typeof previewInput.roleSettings === 'object'
        ? (previewInput.roleSettings as Record<string, Partial<RoleSurfacePreviewSettings>>)
        : {};
    const roleSettings = roleOrder.reduce<Record<TonalColorRole, RoleSurfacePreviewSettings>>(
      (accumulator, role) => {
        accumulator[role] = normalizePreviewSettings(
          inputRoleSettings[role] ?? legacyPreviewSettings[role],
        );
        return accumulator;
      },
      {},
    );
    const activeRole = normalizeRoleId(input.activeRole);

    return {
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      activeRole: activeRole && roleIds.has(activeRole) ? activeRole : 'surface',
      roleOrder,
      roleMeta,
      roles,
      preview: {
        darkMode: Boolean(previewInput.darkMode),
        roleSettings,
      },
    };
  }

  return {
    version: TONAL_PERSISTENCE_SCHEMA_VERSION,
    activeRole: 'surface',
    roleOrder: [...DEFAULT_ROLE_ORDER],
    roleMeta: cloneDefaultRoleMeta(),
    roles: {
      ...cloneDefaultRoleStates(),
      surface: normalizeRoleState(input as Partial<TonalScaleParams>, DEFAULT_ROLE_STATES.surface),
    },
    preview: {
      darkMode: DEFAULT_PREVIEW_STATE.darkMode,
      roleSettings: cloneDefaultRolePreviewSettings(),
    },
  };
};

export const useTonalScaleStore = defineStore('tonalScale', () => {
  const activeRole = ref<TonalColorRole>('surface');
  const roleOrder = ref<TonalColorRole[]>([...DEFAULT_ROLE_ORDER]);
  const roleMeta = reactive<Record<TonalColorRole, ColorRoleMeta>>(cloneDefaultRoleMeta());
  const preview = reactive<TonalPersistenceState['preview']>({
    darkMode: DEFAULT_PREVIEW_STATE.darkMode,
    roleSettings: cloneDefaultRolePreviewSettings(),
  });
  const createRoleRuntime = (state: RoleTonalState): RoleRuntime => {
    const clonedState = cloneRoleState(state);
    const scale = generateTonalScale(roleStateToParams(clonedState));
    return {
      state: clonedState,
      scale,
      metadata: buildMetadata(scale.colorScale),
    };
  };
  const roles = reactive<Record<TonalColorRole, RoleRuntime>>(
    Object.fromEntries(
      DEFAULT_ROLE_ORDER.map((role) => [role, createRoleRuntime(DEFAULT_ROLE_STATES[role])]),
    ),
  );

  const listeners = new Set<(snapshot: TonalScaleSnapshot) => void>();
  const pendingRefreshes: Partial<Record<TonalColorRole, number>> = {};
  const roleWatchStops: Partial<Record<TonalColorRole, WatchStopHandle>> = {};
  let suppressRefresh = false;

  const resolveRole = (role: TonalColorRole) => (roles[role] ? role : 'surface');
  const ensureRolePreviewSettings = (role: TonalColorRole) => {
    if (!preview.roleSettings[role]) {
      preview.roleSettings[role] = clonePreviewSettings(DEFAULT_ROLE_PREVIEW_SETTINGS);
    }
  };
  const getRolePreviewSettings = (role: TonalColorRole): RoleSurfacePreviewSettings => {
    const resolvedRole = resolveRole(role);
    ensureRolePreviewSettings(resolvedRole);
    return preview.roleSettings[resolvedRole];
  };
  const updateRolePreviewSettings = (
    role: TonalColorRole,
    patch: Partial<RoleSurfacePreviewSettings>,
  ) => {
    const resolvedRole = resolveRole(role);
    preview.roleSettings[resolvedRole] = normalizePreviewSettings({
      ...getRolePreviewSettings(resolvedRole),
      ...patch,
    });
  };
  const getRoleParams = (role: TonalColorRole) => roleStateToParams(roles[resolveRole(role)].state);
  const getRoleFullStrip = (role: TonalColorRole) => roles[resolveRole(role)].scale.colorScale;
  const getRoleExtendedStrip = (role: TonalColorRole) =>
    includeBaseIndex(
      EXTENDED_SCALE_INDICES,
      roles[resolveRole(role)].scale.colorScale,
      roles[resolveRole(role)].scale.luminance,
    );
  const getRoleKeyStrip = (role: TonalColorRole) =>
    includeBaseIndex(
      KEY_SCALE_INDICES,
      roles[resolveRole(role)].scale.colorScale,
      roles[resolveRole(role)].scale.luminance,
    );

  const snapshotFor = (role: TonalColorRole): TonalScaleSnapshot => {
    const resolvedRole = resolveRole(role);
    const params = getRoleParams(resolvedRole);
    return {
      role: resolvedRole,
      params,
      baseHex: roles[resolvedRole].state.baseHex,
      blendHex: roles[resolvedRole].state.blendHex,
      scale: roles[resolvedRole].scale,
      fullStrip: getRoleFullStrip(resolvedRole),
      extendedStrip: getRoleExtendedStrip(resolvedRole),
      keyStrip: getRoleKeyStrip(resolvedRole),
      metadata: roles[resolvedRole].metadata,
      serializedParams: JSON.stringify(params),
      blendDistribution: buildBlendDistribution(params, roles[resolvedRole].scale),
    };
  };

  const refreshRole = (role: TonalColorRole, shouldBroadcast = true) => {
    const resolvedRole = resolveRole(role);
    const params = getRoleParams(resolvedRole);
    roles[resolvedRole].scale = generateTonalScale(params);
    roles[resolvedRole].metadata = buildMetadata(roles[resolvedRole].scale.colorScale);
    const snapshot = snapshotFor(resolvedRole);
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

  const ensureRoleWatcher = (role: TonalColorRole) => {
    if (roleWatchStops[role]) return;
    roleWatchStops[role] = watch(
      () => roles[role]?.state,
      () => {
        if (!suppressRefresh && roles[role]) scheduleRefresh(role);
      },
      { deep: true, flush: 'sync' },
    );
  };

  const removeRoleWatcher = (role: TonalColorRole) => {
    roleWatchStops[role]?.();
    delete roleWatchStops[role];
    const pending = pendingRefreshes[role];
    if (pending !== undefined) cancelAnimationFrame(pending);
    delete pendingRefreshes[role];
  };

  DEFAULT_ROLE_ORDER.forEach((role) => ensureRoleWatcher(role));

  const persistenceState = computed<TonalPersistenceState>(() => ({
    version: TONAL_PERSISTENCE_SCHEMA_VERSION,
    activeRole: activeRole.value,
    roleOrder: [...roleOrder.value],
    roleMeta: Object.fromEntries(
      roleOrder.value.map((role) => [
        role,
        cloneRoleMeta(roleMeta[role] ?? normalizeRoleMeta(role, undefined)),
      ]),
    ),
    roles: Object.fromEntries(
      roleOrder.value.map((role) => [role, cloneRoleState(roles[role].state)]),
    ),
    preview: {
      darkMode: preview.darkMode,
      roleSettings: Object.fromEntries(
        roleOrder.value.map((role) => [role, clonePreviewSettings(getRolePreviewSettings(role))]),
      ),
    },
  }));
  const activeState = computed(() => roles[resolveRole(activeRole.value)].state);
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
  const scale = computed(() => roles[resolveRole(activeRole.value)].scale);
  const metadata = computed(() => roles[resolveRole(activeRole.value)].metadata);
  const scaleParams = computed(() => getRoleParams(activeRole.value));
  const fullStrip = computed(() => getRoleFullStrip(activeRole.value));
  const extendedStrip = computed(() => getRoleExtendedStrip(activeRole.value));
  const keyStrip = computed(() => getRoleKeyStrip(activeRole.value));
  const blendDistribution = computed(() => buildBlendDistribution(scaleParams.value, scale.value));
  const serializedParams = computed(() => JSON.stringify(scaleParams.value));
  const serializedState = computed(() => JSON.stringify(persistenceState.value));
  const defaultSerializedState = JSON.stringify(createDefaultPersistenceState());
  const isDefaultState = computed(() => serializedState.value === defaultSerializedState);
  const surfaceExtendedStrip = computed(() => getRoleExtendedStrip('surface'));
  const primaryExtendedStrip = computed(() => getRoleExtendedStrip('primary'));

  const setActiveRole = (role: TonalColorRole) => {
    activeRole.value = resolveRole(role);
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

  const existingRoleLabels = (excludedRole?: TonalColorRole) =>
    roleOrder.value
      .filter((role) => role !== excludedRole)
      .map((role) => roleMeta[role]?.label)
      .filter((label): label is string => Boolean(label));

  const addRole = (options: { label?: string; baseHex?: string } = {}) => {
    const label = createUniqueRoleLabel(
      options.label?.trim() || 'Custom role',
      existingRoleLabels(),
    );
    const id = createUniqueRoleId(label, roleOrder.value);
    const roleState = normalizeRoleState(
      {
        baseHex: options.baseHex,
      },
      DEFAULT_ROLE_STATES.primary,
    );

    roleOrder.value.push(id);
    roleMeta[id] = createCustomRoleMeta(id, label);
    preview.roleSettings[id] = clonePreviewSettings(DEFAULT_ROLE_PREVIEW_SETTINGS);
    roles[id] = createRoleRuntime(roleState);
    ensureRoleWatcher(id);
    activeRole.value = id;
    return id;
  };

  const duplicateRole = (sourceRole: TonalColorRole, label?: string) => {
    const resolvedSourceRole = resolveRole(sourceRole);
    const sourceMeta = roleMeta[resolvedSourceRole];
    const nextLabel = createUniqueRoleLabel(
      label?.trim() || `${sourceMeta?.label ?? resolvedSourceRole} copy`,
      existingRoleLabels(),
    );
    const id = createUniqueRoleId(nextLabel, roleOrder.value);

    roleOrder.value.push(id);
    roleMeta[id] = createCustomRoleMeta(id, nextLabel);
    preview.roleSettings[id] = clonePreviewSettings(getRolePreviewSettings(resolvedSourceRole));
    roles[id] = createRoleRuntime(roles[resolvedSourceRole].state);
    ensureRoleWatcher(id);
    activeRole.value = id;
    return id;
  };

  const renameRole = (role: TonalColorRole, nextLabel: string): RoleRenameResult => {
    if (!roleMeta[role]) return { success: false, error: 'not_found' };
    if (roleMeta[role].isBuiltIn) return { success: false, error: 'protected' };

    const normalizedLabel = nextLabel.trim();
    if (!normalizedLabel) return { success: false, error: 'empty' };

    const duplicate = existingRoleLabels(role).some(
      (label) => label.toLowerCase() === normalizedLabel.toLowerCase(),
    );
    if (duplicate) return { success: false, error: 'duplicate' };

    roleMeta[role] = {
      ...roleMeta[role],
      label: normalizedLabel,
    };
    return { success: true };
  };

  const moveRole = (role: TonalColorRole, targetIndex: number) => {
    const currentIndex = roleOrder.value.indexOf(role);
    if (currentIndex === -1) return false;

    const nextIndex = clamp(Math.round(targetIndex), 0, roleOrder.value.length - 1);
    if (currentIndex === nextIndex) return false;

    const nextOrder = [...roleOrder.value];
    nextOrder.splice(currentIndex, 1);
    nextOrder.splice(nextIndex, 0, role);
    roleOrder.value = nextOrder;
    return true;
  };

  const moveRoleByOffset = (role: TonalColorRole, offset: number) => {
    const currentIndex = roleOrder.value.indexOf(role);
    if (currentIndex === -1) return false;
    return moveRole(role, currentIndex + offset);
  };

  const removeRole = (role: TonalColorRole) => {
    if (!roles[role] || roleMeta[role]?.deletable === false) return false;
    const removedIndex = roleOrder.value.indexOf(role);

    removeRoleWatcher(role);
    delete roles[role];
    delete roleMeta[role];
    delete preview.roleSettings[role];
    roleOrder.value = roleOrder.value.filter((existingRole) => existingRole !== role);

    if (activeRole.value === role) {
      activeRole.value =
        roleOrder.value[Math.max(0, Math.min(removedIndex, roleOrder.value.length - 1))] ??
        'surface';
    }

    return true;
  };

  const applyPersistenceState = (state: TonalPersistenceState) => {
    suppressRefresh = true;
    Object.keys(roles).forEach((role) => {
      if (!state.roles[role]) {
        removeRoleWatcher(role);
        delete roles[role];
      }
    });
    Object.keys(roleMeta).forEach((role) => delete roleMeta[role]);
    Object.keys(preview.roleSettings).forEach((role) => delete preview.roleSettings[role]);

    roleOrder.value = [...state.roleOrder];
    roleOrder.value.forEach((role) => {
      roles[role] = createRoleRuntime(state.roles[role] ?? fallbackRoleStateFor(role));
      roleMeta[role] = cloneRoleMeta(state.roleMeta[role] ?? normalizeRoleMeta(role, undefined));
      preview.roleSettings[role] = normalizePreviewSettings(state.preview.roleSettings[role]);
      ensureRoleWatcher(role);
    });
    activeRole.value = state.roles[state.activeRole]
      ? state.activeRole
      : (roleOrder.value[0] ?? 'surface');
    preview.darkMode = state.preview.darkMode;
    Object.values(pendingRefreshes).forEach((pending) => {
      if (pending !== undefined) cancelAnimationFrame(pending);
    });
    roleOrder.value.forEach((role) => refreshRole(role, false));
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
    const resolvedRole = resolveRole(role);
    roles[resolvedRole].state = normalizeRoleState(payload, roles[resolvedRole].state);
    return true;
  };
  const exportState = () => serializedState.value;
  const loadDefaults = () => applyPersistenceState(createDefaultPersistenceState());

  const onSnapshot = (listener: (snapshot: TonalScaleSnapshot) => void) => {
    listeners.add(listener);
    listener(snapshotFor(activeRole.value));
    return () => listeners.delete(listener);
  };

  return {
    activeRole,
    roleOrder,
    roleMeta,
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
    isDefaultState,
    persistenceState,
    blendDistribution,
    getRoleParams,
    getRoleFullStrip,
    getRoleExtendedStrip,
    getRoleKeyStrip,
    getRolePreviewSettings,
    updateRolePreviewSettings,
    addRole,
    duplicateRole,
    renameRole,
    moveRole,
    moveRoleByOffset,
    removeRole,
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
