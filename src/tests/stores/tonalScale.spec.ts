import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import {
  BUILT_IN_ROLE_IDS,
  EXTENDED_SCALE_INDICES,
  KEY_SCALE_INDICES,
  TONAL_PERSISTENCE_SCHEMA_VERSION,
  findNearestBaseAdjacentTone,
  type TonalScaleSnapshot,
  useTonalScaleStore,
} from '@/stores/tonalScale';
import { getContrastRatio } from '@/utils/tonal/contrast';

const flushTimers = async () => {
  vi.runAllTimers();
  await vi.runAllTimersAsync();
};

describe('useTonalScaleStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
  });

  it('initializes defaults and exposes derived strips', async () => {
    const store = useTonalScaleStore();
    await flushTimers();

    expect(store.baseHex).toBe('#8000ff');
    expect(store.blendHex).toBe('#000032');
    expect(store.fullStrip).toHaveLength(101);
    expect(store.extendedStrip.length).toBeGreaterThanOrEqual(EXTENDED_SCALE_INDICES.length);
    expect(store.keyStrip.length).toBeGreaterThanOrEqual(KEY_SCALE_INDICES.length);

    const baseTone = store.fullStrip.find((step) => step.index === store.scale.luminance);
    const excludedExtendedTone = findNearestBaseAdjacentTone(
      EXTENDED_SCALE_INDICES,
      store.scale.luminance,
    );
    const excludedKeyTone = findNearestBaseAdjacentTone(KEY_SCALE_INDICES, store.scale.luminance);

    expect(baseTone?.hex).toBe('#8000ff');
    expect(store.extendedStrip.some((step) => step.index === store.scale.luminance)).toBe(true);
    expect(store.keyStrip.some((step) => step.index === store.scale.luminance)).toBe(true);
    expect(store.extendedStrip.some((step) => step.index === excludedExtendedTone)).toBe(false);
    expect(store.keyStrip.some((step) => step.index === excludedKeyTone)).toBe(false);
    expect(store.fullStrip.some((step) => step.index === excludedKeyTone)).toBe(true);
    expect(store.roleOrder).toEqual([...BUILT_IN_ROLE_IDS]);
    expect(store.roleMeta.surface).toMatchObject({
      id: 'surface',
      label: 'Surface',
      isBuiltIn: true,
      deletable: false,
    });
    expect(store.roleMeta.secondary).toMatchObject({
      id: 'secondary',
      label: 'Secondary',
      isBuiltIn: true,
      deletable: false,
    });
    expect(store.roleMeta.tertiary).toMatchObject({
      id: 'tertiary',
      label: 'Tertiary',
      isBuiltIn: true,
      deletable: false,
    });
    expect(store.roleMeta.error).toMatchObject({
      id: 'error',
      label: 'Error',
      isBuiltIn: true,
      deletable: false,
    });
    expect(store.preview.roleSettings.surface).toEqual({
      lightContrast: 'low',
      darkContrast: 'low',
      lightSurfaceTone: 100,
      darkSurfaceTone: 0,
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
  });

  it('finds the nearest base-adjacent key tone for exclusion', () => {
    expect(findNearestBaseAdjacentTone(KEY_SCALE_INDICES, 43)).toBe(40);
    expect(findNearestBaseAdjacentTone(EXTENDED_SCALE_INDICES, 43)).toBe(40);
    expect(findNearestBaseAdjacentTone(KEY_SCALE_INDICES, 50)).toBeNull();
    expect(findNearestBaseAdjacentTone(EXTENDED_SCALE_INDICES, 50)).toBeNull();
  });

  it('broadcasts snapshots when parameters change', async () => {
    const store = useTonalScaleStore();
    const snapshots: TonalScaleSnapshot[] = [];
    store.onSnapshot((snapshot) => snapshots.push(snapshot));

    store.setBaseHex('#3366ff');
    store.updateControl('strength', 25);
    await flushTimers();

    expect(snapshots.length).toBeGreaterThan(1);
    const latest = snapshots.at(-1)!;
    expect(latest.params.colorHex).toBe('#3366ff');
    expect(latest.params.blendStrength).toBe(25);
    expect(latest.fullStrip.find((step) => step.index === latest.scale.luminance)?.hex).toBe(
      '#3366ff',
    );
  });

  it('imports and exports state payloads', async () => {
    const store = useTonalScaleStore();
    await flushTimers();
    const baseline = store.exportState();

    store.setBaseHex('#123456');
    store.setBlendHex('#654321');
    store.updateControl('middle', 10);
    await flushTimers();

    const imported = store.importState(baseline);
    await flushTimers();

    expect(imported).toBe(true);
    expect(store.baseHex).toBe('#8000ff');
    expect(store.blendHex).toBe('#000032');
    expect(store.controls.middle).toBe(0);
  });

  it('refreshes only once for import and default load operations', async () => {
    const store = useTonalScaleStore();
    const snapshots: TonalScaleSnapshot[] = [];
    store.onSnapshot((snapshot) => snapshots.push(snapshot));

    const defaultPayload = store.exportState();
    await flushTimers();

    store.setBaseHex('#123456');
    await flushTimers();
    const countAfterChange = snapshots.length;

    store.importState(defaultPayload);
    await flushTimers();

    expect(snapshots.length - countAfterChange).toBe(1);
    expect(snapshots.at(-1)?.baseHex).toBe('#8000ff');

    store.setBlendHex('#abcdef');
    await flushTimers();
    const countAfterBlendChange = snapshots.length;

    store.loadDefaults();
    await flushTimers();

    expect(snapshots.length - countAfterBlendChange).toBe(1);
    expect(snapshots.at(-1)?.blendHex).toBe('#000032');
  });

  it('detects non-default state and resets every dynamic role setting to defaults', async () => {
    const store = useTonalScaleStore();
    await flushTimers();
    const defaultPayload = store.exportState();

    const customRole = store.addRole({ label: 'Support', baseHex: '#224466' });
    store.setActiveRole(customRole);
    store.setBlendHex('#654321');
    store.updateControl('strength', 44);
    store.updateRolePreviewSettings(customRole, { contrast: 'high', lightSurfaceTone: 90 });
    store.preview.darkMode = true;
    await flushTimers();

    expect(store.isDefaultState).toBe(false);
    expect(store.roleOrder).toContain(customRole);

    store.loadDefaults();
    await flushTimers();

    expect(store.isDefaultState).toBe(true);
    expect(store.exportState()).toBe(defaultPayload);
    expect(store.activeRole).toBe('surface');
    expect(store.roleOrder).toEqual([...BUILT_IN_ROLE_IDS]);
    expect(store.roles[customRole]).toBeUndefined();
    expect(store.preview.darkMode).toBe(false);
    expect(store.baseHex).toBe('#8000ff');
    expect(store.blendHex).toBe('#000032');
    expect(store.controls.strength).toBe(0);
  });

  it('safely rejects malformed import payloads', async () => {
    const store = useTonalScaleStore();
    await flushTimers();

    expect(store.importState('{invalid json')).toBe(false);
    await flushTimers();

    expect(store.baseHex).toBe('#8000ff');
  });

  it('computes contrast metadata for each tone', async () => {
    const store = useTonalScaleStore();
    await flushTimers();

    const supportedMeta = store.metadata.find((meta) => meta.darker3 && meta.lighter3);
    expect(supportedMeta).toBeDefined();
    expect(supportedMeta?.darker3?.ratio).toBeGreaterThanOrEqual(3);

    const calculated = getContrastRatio(
      supportedMeta?.tone.hex ?? '#000000',
      supportedMeta?.lighter45?.hex ?? supportedMeta?.lighter3?.hex ?? '#ffffff',
    );
    expect(calculated).toBeGreaterThanOrEqual(3);
  });

  it('derives blend distribution data for overlay consumers', async () => {
    const store = useTonalScaleStore();
    store.updateControl('strength', 50);
    await flushTimers();

    const initial = store.blendDistribution;
    expect(initial).toBeTruthy();
    expect(initial?.curve.x.length).toBe(store.scale.luminance);
    const initialY = initial?.curve.y.slice();

    store.updateControl('spread', 10);
    store.updateControl('middle', 25);
    await flushTimers();

    const updated = store.blendDistribution;
    expect(updated?.curve.y).not.toEqual(initialY);
    expect(updated?.widthPercent).toBe(Math.max(0, store.scale.luminance - 1));
    expect(updated?.lineColor).toMatch(/^#/);
  });

  it('keeps surface and primary configurations independent', async () => {
    const store = useTonalScaleStore();
    store.setBaseHex('#112233');
    store.updateControl('spread', 61);
    await flushTimers();

    store.setActiveRole('primary');
    expect(store.baseHex).toBe('#6750a4');
    expect(store.controls.spread).toBe(50);

    store.setBaseHex('#445566');
    store.updateControl('spread', 72);
    await flushTimers();

    expect(store.primaryExtendedStrip).not.toEqual(store.surfaceExtendedStrip);
    store.setActiveRole('surface');
    expect(store.baseHex).toBe('#112233');
    expect(store.controls.spread).toBe(61);
    store.setActiveRole('primary');
    expect(store.baseHex).toBe('#445566');
    expect(store.controls.spread).toBe(72);
  });

  it('round-trips the versioned multi-role state and migrates legacy payloads', async () => {
    const store = useTonalScaleStore();
    store.setBaseHex('#123456');
    store.setActiveRole('primary');
    store.setBaseHex('#abcdef');
    store.preview.darkMode = true;
    store.updateRolePreviewSettings('surface', { contrast: 'high' });
    await flushTimers();

    const exported = store.exportState();
    expect(JSON.parse(exported)).toMatchObject({
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      activeRole: 'primary',
      roleOrder: [...BUILT_IN_ROLE_IDS],
      roleMeta: {
        surface: {
          label: 'Surface',
          isBuiltIn: true,
          deletable: false,
        },
        primary: {
          label: 'Primary',
          isBuiltIn: true,
          deletable: false,
        },
      },
      preview: {
        roleSettings: {
          surface: {
            lightContrast: 'high',
            darkContrast: 'high',
          },
        },
      },
    });
    store.loadDefaults();
    expect(store.importState(exported)).toBe(true);
    await flushTimers();

    expect(store.activeRole).toBe('primary');
    expect(store.baseHex).toBe('#abcdef');
    expect(store.roles.surface.state.baseHex).toBe('#123456');
    expect(store.preview.darkMode).toBe(true);
    expect(store.preview.roleSettings.surface.lightContrast).toBe('high');
    expect(store.preview.roleSettings.surface.darkContrast).toBe('high');

    expect(store.importState({ colorHex: '#fedcba', blendStrength: 25 })).toBe(true);
    await flushTimers();
    expect(store.activeRole).toBe('surface');
    expect(store.baseHex).toBe('#fedcba');
    expect(store.controls.strength).toBe(25);
    expect(store.roles.primary.state.baseHex).toBe('#6750a4');
    expect(store.roles.secondary.state.baseHex).toBe('#625b71');
    expect(store.roles.tertiary.state.baseHex).toBe('#7d5260');
    expect(store.roles.error.state.baseHex).toBe('#b3261e');
  });

  it('migrates version 2 surface and primary payloads into version 3 dynamic state', async () => {
    const store = useTonalScaleStore();
    expect(
      store.importState({
        version: 2,
        activeRole: 'primary',
        roles: {
          surface: {
            baseHex: '#112233',
            blendHex: '#000032',
            blendMode: 'colordodge',
            controls: { strength: 0, middle: 0, spread: 50, satDarker: 0, satLighter: 0 },
          },
          primary: {
            baseHex: '#abcdef',
            blendHex: '#010203',
            blendMode: 'multiply',
            controls: { strength: 20, middle: 5, spread: 60, satDarker: 10, satLighter: 15 },
          },
        },
        preview: {
          darkMode: true,
          surfaceContrast: 'medium',
          lightSurfaceTone: 95,
          darkSurfaceTone: 10,
          primarySurfaceContrast: 'high',
          primaryLightSurfaceTone: 98,
          primaryDarkSurfaceTone: 15,
        },
      }),
    ).toBe(true);
    await flushTimers();

    expect(store.activeRole).toBe('primary');
    expect(store.baseHex).toBe('#abcdef');
    expect(store.roleOrder).toEqual([...BUILT_IN_ROLE_IDS]);
    expect(store.getRolePreviewSettings('surface')).toEqual({
      lightContrast: 'medium',
      darkContrast: 'medium',
      lightSurfaceTone: 95,
      darkSurfaceTone: 10,
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
    expect(store.getRolePreviewSettings('primary')).toEqual({
      lightContrast: 'high',
      darkContrast: 'high',
      lightSurfaceTone: 98,
      darkSurfaceTone: 15,
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
    expect(JSON.parse(store.exportState()).version).toBe(TONAL_PERSISTENCE_SCHEMA_VERSION);
  });

  it('rejects unsupported schema versions without partially updating state', () => {
    const store = useTonalScaleStore();
    const before = store.exportState();

    expect(store.importState({ version: 99, roles: {} })).toBe(false);
    expect(store.exportState()).toBe(before);
  });

  it('creates custom role metadata with normalized collision-safe ids', async () => {
    const store = useTonalScaleStore();
    const firstRole = store.addRole({ label: 'Secondary Color', baseHex: '#224466' });
    const secondRole = store.addRole({ label: 'Secondary Color' });
    await flushTimers();

    expect(firstRole).toBe('secondary_color');
    expect(secondRole).toBe('secondary_color_2');
    expect(store.roleOrder).toEqual([...BUILT_IN_ROLE_IDS, firstRole, secondRole]);
    expect(store.roleMeta[firstRole]).toMatchObject({
      id: firstRole,
      label: 'Secondary Color',
      isBuiltIn: false,
      kind: 'custom',
      deletable: true,
    });
    expect(store.roles[firstRole].state.baseHex).toBe('#224466');
  });

  it('keeps role preview settings independent and falls back for unknown roles', () => {
    const store = useTonalScaleStore();
    const customRole = store.addRole({ label: 'Neutral accent' });

    store.updateRolePreviewSettings(customRole, {
      contrast: 'high',
      lightSurfaceTone: 90,
      darkSurfaceTone: 25,
    });
    store.updateRolePreviewSettings('missing-role', {
      contrast: 'medium',
      lightSurfaceTone: 80,
    });

    expect(store.getRolePreviewSettings(customRole)).toEqual({
      lightContrast: 'high',
      darkContrast: 'high',
      lightSurfaceTone: 90,
      darkSurfaceTone: 25,
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
    expect(store.getRolePreviewSettings('surface')).toEqual({
      lightContrast: 'medium',
      darkContrast: 'medium',
      lightSurfaceTone: 80,
      darkSurfaceTone: 0,
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
    expect(store.getRolePreviewSettings('primary')).toEqual({
      lightContrast: 'low',
      darkContrast: 'low',
      lightSurfaceTone: store.getRoleBaseTone('primary'),
      darkSurfaceTone: store.getRoleBaseTone('primary'),
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
  });

  it('keeps built-in accent and custom preview settings independent by theme mode', () => {
    const store = useTonalScaleStore();
    const customRole = store.addRole({ label: 'Support', baseHex: '#224466' });

    store.updateRolePreviewSettings('primary', {
      lightContrast: 'medium',
      lightSurfaceTone: 12,
    });
    store.updateRolePreviewSettings('primary', {
      darkContrast: 'high',
      darkSurfaceTone: 99,
    });
    store.updateRolePreviewSettings(customRole, {
      lightContrast: 'high',
      lightSurfaceTone: 0,
    });
    store.updateRolePreviewSettings(customRole, {
      darkContrast: 'medium',
      darkSurfaceTone: 100,
    });

    expect(store.getRolePreviewSettings('primary')).toMatchObject({
      lightContrast: 'medium',
      darkContrast: 'high',
      lightSurfaceTone: 12,
      darkSurfaceTone: 99,
    });
    expect(store.getRolePreviewContrast('primary', false)).toBe('medium');
    expect(store.getRolePreviewContrast('primary', true)).toBe('high');
    expect(store.getRolePreviewSettings(customRole)).toMatchObject({
      lightContrast: 'high',
      darkContrast: 'medium',
      lightSurfaceTone: 5,
      darkSurfaceTone: 99,
    });
    expect(store.getRolePreviewContrast(customRole, false)).toBe('high');
    expect(store.getRolePreviewContrast(customRole, true)).toBe('medium');
  });

  it('duplicates and removes custom roles while preserving active-role fallbacks', async () => {
    const store = useTonalScaleStore();
    store.setBaseHex('#123456');
    store.updateRolePreviewSettings('surface', { contrast: 'medium', lightSurfaceTone: 95 });

    const duplicateRole = store.duplicateRole('surface', 'Surface Variant');
    await flushTimers();

    expect(duplicateRole).toBe('surface_variant');
    expect(store.activeRole).toBe(duplicateRole);
    expect(store.baseHex).toBe('#123456');
    expect(store.getRolePreviewSettings(duplicateRole)).toMatchObject({
      lightContrast: 'medium',
      darkContrast: 'medium',
      lightSurfaceTone: 95,
    });

    expect(store.removeRole('surface')).toBe(false);
    expect(store.removeRole(duplicateRole)).toBe(true);
    expect(store.activeRole).toBe('error');
    expect(store.roleOrder).toEqual([...BUILT_IN_ROLE_IDS]);
  });

  it('renames custom roles with validation and protects built-in labels', () => {
    const store = useTonalScaleStore();
    const customRole = store.addRole({ label: 'Secondary' });

    expect(store.renameRole('surface', 'Base surface')).toEqual({
      success: false,
      error: 'protected',
    });
    expect(store.renameRole(customRole, '')).toEqual({
      success: false,
      error: 'empty',
    });
    expect(store.renameRole(customRole, 'Primary')).toEqual({
      success: false,
      error: 'duplicate',
    });
    expect(store.renameRole(customRole, 'Accent')).toEqual({ success: true });
    expect(store.roleMeta[customRole].label).toBe('Accent');
  });

  it('reorders roles without losing persistence order', () => {
    const store = useTonalScaleStore();
    const secondary = store.addRole({ label: 'Support' });
    const tertiary = store.addRole({ label: 'Accent' });

    expect(store.moveRoleByOffset(tertiary, -1)).toBe(true);
    expect(store.roleOrder).toEqual([...BUILT_IN_ROLE_IDS, tertiary, secondary]);
    expect(store.moveRole(tertiary, 0)).toBe(true);
    expect(store.roleOrder).toEqual([
      tertiary,
      'surface',
      'primary',
      'secondary',
      'tertiary',
      'error',
      secondary,
    ]);

    const exported = JSON.parse(store.exportState());
    expect(exported.roleOrder).toEqual([
      tertiary,
      'surface',
      'primary',
      'secondary',
      'tertiary',
      'error',
      secondary,
    ]);
  });

  it('uses generic selectors and isolates refreshes per dynamic role', async () => {
    const store = useTonalScaleStore();
    const snapshots: TonalScaleSnapshot[] = [];
    const customRole = store.addRole({ label: 'Neutral accent', baseHex: '#663399' });
    store.onSnapshot((snapshot) => snapshots.push(snapshot));
    await flushTimers();

    expect(store.getRoleExtendedStrip(customRole)).toHaveLength(store.extendedStrip.length);
    expect(
      store.getRoleFullStrip(customRole).find((step) => step.index === store.scale.luminance)?.hex,
    ).toBe('#663399');

    store.setActiveRole('surface');
    snapshots.length = 0;
    store.importRoleState(customRole, { colorHex: '#336699' });
    await flushTimers();

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].role).toBe(customRole);
    expect(store.baseHex).toBe('#8000ff');
    expect(store.roles[customRole].state.baseHex).toBe('#336699');
  });

  it('imports dynamic role payloads with generic preview settings', async () => {
    const store = useTonalScaleStore();
    const imported = store.importState({
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      activeRole: 'support',
      roleOrder: ['surface', 'support', 'primary'],
      roleMeta: {
        support: {
          id: 'support',
          label: 'Support',
          kind: 'accent',
          isBuiltIn: false,
          deletable: true,
        },
      },
      roles: {
        surface: { baseHex: '#111111' },
        primary: { baseHex: '#222222' },
        support: { baseHex: '#333333' },
      },
      preview: {
        darkMode: true,
        roleSettings: {
          support: {
            contrast: 'high',
            lightSurfaceTone: 90,
            darkSurfaceTone: 25,
            lightCustomSurfaceTones: {
              container: 80,
            },
            darkCustomSurfaceTones: {
              container: 20,
            },
          },
        },
      },
    });
    await flushTimers();

    expect(imported).toBe(true);
    expect(store.activeRole).toBe('support');
    expect(store.roleOrder).toEqual([
      'surface',
      'support',
      'primary',
      'secondary',
      'tertiary',
      'error',
    ]);
    expect(store.roleMeta.support.label).toBe('Support');
    expect(store.baseHex).toBe('#333333');
    expect(store.preview.darkMode).toBe(true);
    expect(store.getRolePreviewSettings('support')).toEqual({
      lightContrast: 'high',
      darkContrast: 'high',
      lightSurfaceTone: 90,
      darkSurfaceTone: 25,
      lightCustomSurfaceTones: {
        container: 80,
      },
      darkCustomSurfaceTones: {
        container: 20,
      },
    });
    const exported = JSON.parse(store.exportState());
    expect(exported.preview.roleSettings.support.lightCustomSurfaceTones).toEqual({
      container: 80,
    });
  });

  it('safely defaults malformed dynamic role records during import', async () => {
    const store = useTonalScaleStore();
    store.setBaseHex('#123456');
    const imported = store.importState({
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      activeRole: 'missing',
      roleOrder: ['broken', 'surface'],
      roleMeta: {
        broken: {
          id: 'broken',
          label: '',
          isBuiltIn: false,
          deletable: true,
        },
      },
      roles: {
        broken: 'not-a-role-record',
        surface: {
          baseHex: 'also-not-valid',
        },
      },
      preview: {
        darkMode: true,
        roleSettings: {
          broken: {
            contrast: 'wide-open',
            lightSurfaceTone: Number.NaN,
            darkSurfaceTone: Number.NaN,
          },
        },
      },
    });
    await flushTimers();

    expect(imported).toBe(true);
    expect(store.activeRole).toBe('surface');
    expect(store.roleOrder).toEqual([
      'broken',
      'surface',
      'primary',
      'secondary',
      'tertiary',
      'error',
    ]);
    expect(store.roles.broken.state.baseHex).toBe('#6750a4');
    expect(store.roles.surface.state.baseHex).toBe('#8000ff');
    expect(store.getRolePreviewSettings('broken')).toEqual({
      lightContrast: 'low',
      darkContrast: 'low',
      lightSurfaceTone: store.getRoleBaseTone('broken'),
      darkSurfaceTone: store.getRoleBaseTone('broken'),
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
  });
});
