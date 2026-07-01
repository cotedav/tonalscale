import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { compressToEncodedURIComponent } from 'lz-string';

import useTonalUrlSync, { TONAL_LOCAL_STORAGE_KEY } from '@/composables/useTonalUrlSync';
import {
  BUILT_IN_ROLE_IDS,
  TONAL_PERSISTENCE_SCHEMA_VERSION,
  useTonalScaleStore,
} from '@/stores/tonalScale';

const mockReplace = vi.fn().mockResolvedValue(undefined);
const mockRoute = { query: {}, hash: '' };
const eventHandlers = new Map<string, () => void>();

vi.mock('@vueuse/core', () => ({
  useEventListener: (_target: EventTarget, events: string | string[], handler: () => void) => {
    const eventNames = Array.isArray(events) ? events : [events];
    eventNames.forEach((eventName) => eventHandlers.set(eventName, handler));
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useRoute: () => mockRoute,
}));

vi.mock('vue', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    onMounted: (fn: () => void) => fn(),
    onBeforeUnmount: vi.fn(),
  };
});

const legacyHash = (payload: unknown) =>
  `#v2=${compressToEncodedURIComponent(JSON.stringify(payload))}`;

describe('useTonalUrlSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    eventHandlers.clear();
    mockReplace.mockClear();
    mockRoute.query = {};
    mockRoute.hash = '';
    window.localStorage.clear();
    setActivePinia(createPinia());
  });

  it('persists store changes to local storage without updating the URL', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    store.baseHex = '#ff0000';
    await nextTick();

    expect(mockReplace).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY)).toBeNull();

    eventHandlers.get('pointerup')?.();

    expect(mockReplace).not.toHaveBeenCalled();
    const serialized = window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY);
    expect(serialized).toBeTruthy();
    expect(JSON.parse(serialized as string)).toMatchObject({
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      roles: {
        surface: {
          baseHex: '#ff0000',
        },
      },
    });
  });

  it('stores custom roles through local storage', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    const customRole = store.addRole({ label: 'Support', baseHex: '#224466' });
    store.updateRolePreviewSettings(customRole, {
      contrast: 'high',
      lightSurfaceTone: 90,
      darkSurfaceTone: 25,
    });
    await nextTick();
    eventHandlers.get('change')?.();

    const payload = JSON.parse(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY) as string);
    expect(payload).toMatchObject({
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      activeRole: customRole,
      roleOrder: [...BUILT_IN_ROLE_IDS, customRole],
      roleMeta: {
        [customRole]: {
          label: 'Support',
          isBuiltIn: false,
        },
      },
      roles: {
        [customRole]: {
          baseHex: '#224466',
        },
      },
      preview: {
        roleSettings: {
          [customRole]: {
            lightContrast: 'high',
            darkContrast: 'high',
            lightSurfaceTone: 90,
            darkSurfaceTone: 25,
          },
        },
      },
    });
  });

  it('persists after an idle delay for keyboard and text changes', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    store.baseHex = '#00ff00';
    await nextTick();
    expect(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY)).toBeNull();

    vi.advanceTimersByTime(399);
    expect(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY)).toBeNull();
    vi.advanceTimersByTime(1);

    const serialized = window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY);
    expect(JSON.parse(serialized as string).roles.surface.baseHex).toBe('#00ff00');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('coalesces repeated drag updates into the final local storage state', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    store.updateControl('spread', 51);
    await nextTick();
    store.updateControl('spread', 62);
    await nextTick();
    store.updateControl('spread', 73);
    await nextTick();

    expect(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY)).toBeNull();
    eventHandlers.get('pointerup')?.();

    const serialized = window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY);
    expect(JSON.parse(serialized as string).roles.surface.controls.spread).toBe(73);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('restores state from local storage on mount', () => {
    window.localStorage.setItem(
      TONAL_LOCAL_STORAGE_KEY,
      JSON.stringify({
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
            blendHex: '#000032',
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
    );

    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    expect(store.activeRole).toBe('primary');
    expect(store.baseHex).toBe('#abcdef');
    expect(store.roles.surface.state.baseHex).toBe('#112233');
    expect(store.preview.darkMode).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('migrates a legacy compressed URL hash into local storage and clears the URL', () => {
    mockRoute.hash = legacyHash({
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
          blendHex: '#000032',
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
    });

    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    expect(store.activeRole).toBe('primary');
    expect(store.baseHex).toBe('#abcdef');
    expect(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY)).toContain('#abcdef');
    expect(mockReplace).toHaveBeenCalledWith({ query: {}, hash: '' });
  });

  it('continues to restore the previous JSON query format once and then clears it', () => {
    mockRoute.query = {
      config: JSON.stringify({
        version: 2,
        activeRole: 'primary',
        roles: {
          surface: {
            baseHex: '#123456',
            blendHex: '#000032',
            blendMode: 'colordodge',
            controls: { strength: 0, middle: 0, spread: 50, satDarker: 0, satLighter: 0 },
          },
          primary: {
            baseHex: '#abcdef',
            blendHex: '#000032',
            blendMode: 'colordodge',
            controls: { strength: 0, middle: 0, spread: 50, satDarker: 0, satLighter: 0 },
          },
        },
        preview: {
          darkMode: false,
          surfaceContrast: 'low',
          lightSurfaceTone: 100,
          darkSurfaceTone: 0,
          primarySurfaceContrast: 'low',
          primaryLightSurfaceTone: 100,
          primaryDarkSurfaceTone: 0,
        },
      }),
    };

    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    expect(store.activeRole).toBe('primary');
    expect(store.baseHex).toBe('#abcdef');
    expect(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY)).toContain('#abcdef');
    expect(mockReplace).toHaveBeenCalledWith({ query: {}, hash: '' });
  });

  it('restores legacy dynamic custom-role configurations from the URL', () => {
    mockRoute.hash = legacyHash({
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      activeRole: 'support',
      roleOrder: ['surface', 'primary', 'support'],
      roleMeta: {
        surface: {
          id: 'surface',
          label: 'Surface',
          isBuiltIn: true,
          kind: 'surface',
          deletable: false,
          capabilities: { tonalScale: true, materialSurfaces: true, appPreviewExamples: true },
        },
        primary: {
          id: 'primary',
          label: 'Primary',
          isBuiltIn: true,
          kind: 'accent',
          deletable: false,
          capabilities: { tonalScale: true, materialSurfaces: true, appPreviewExamples: true },
        },
        support: {
          id: 'support',
          label: 'Support',
          isBuiltIn: false,
          kind: 'custom',
          deletable: true,
          capabilities: { tonalScale: true, materialSurfaces: true, appPreviewExamples: false },
        },
      },
      roles: {
        surface: { baseHex: '#123456' },
        primary: { baseHex: '#abcdef' },
        support: { baseHex: '#224466' },
      },
      preview: {
        darkMode: true,
        roleSettings: {
          support: {
            contrast: 'medium',
            lightSurfaceTone: 95,
            darkSurfaceTone: 15,
          },
        },
      },
    });

    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    expect(store.activeRole).toBe('support');
    expect(store.roleOrder).toEqual([
      'surface',
      'primary',
      'support',
      'secondary',
      'tertiary',
      'error',
    ]);
    expect(store.roleMeta.support.label).toBe('Support');
    expect(store.baseHex).toBe('#224466');
    expect(store.getRolePreviewSettings('support')).toEqual({
      lightContrast: 'medium',
      darkContrast: 'medium',
      lightSurfaceTone: 95,
      darkSurfaceTone: 15,
      lightCustomSurfaceTones: {},
      darkCustomSurfaceTones: {},
    });
    expect(window.localStorage.getItem(TONAL_LOCAL_STORAGE_KEY)).toContain('#224466');
    expect(mockReplace).toHaveBeenCalledWith({ query: {}, hash: '' });
  });
});
