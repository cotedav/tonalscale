import { describe, it, expect, vi, beforeEach } from 'vitest';
import useTonalUrlSync from '@/composables/useTonalUrlSync';
import { createPinia, setActivePinia } from 'pinia';
import { useTonalScaleStore } from '@/stores/tonalScale';
import { nextTick } from 'vue';
import { decodeShareState, encodeShareState } from '@/utils/tonal/share-state';

// Mock vue-router
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

// Mock onMounted to run immediately
vi.mock('vue', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    onMounted: (fn: () => void) => fn(),
    onBeforeUnmount: vi.fn(),
  };
});

describe('useTonalUrlSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    eventHandlers.clear();
    mockReplace.mockClear();
    mockRoute.query = {};
    mockRoute.hash = '';
    setActivePinia(createPinia());
  });

  it('updates the URL when store state changes', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    // Initial state change
    store.baseHex = '#ff0000';
    await nextTick();

    expect(mockReplace).not.toHaveBeenCalled();
    eventHandlers.get('pointerup')?.();

    expect(mockReplace).toHaveBeenCalled();
    const callArgs = mockReplace.mock.lastCall?.[0];
    expect(callArgs?.query).toEqual({});
    const serialized = decodeShareState(callArgs?.hash as string);
    expect(serialized).toBeTruthy();
    expect(JSON.parse(serialized as string)).toMatchObject({
      version: 2,
      roles: {
        surface: {
          baseHex: '#ff0000',
        },
      },
    });
  });

  it('updates after an idle delay for keyboard and text changes', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    store.baseHex = '#00ff00';
    await nextTick();
    expect(mockReplace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(399);
    expect(mockReplace).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(mockReplace).toHaveBeenCalledOnce();
    const serialized = decodeShareState(mockReplace.mock.lastCall?.[0]?.hash);
    expect(JSON.parse(serialized as string).roles.surface.baseHex).toBe('#00ff00');
  });

  it('coalesces repeated drag updates into the final URL state', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    store.updateControl('spread', 51);
    await nextTick();
    store.updateControl('spread', 62);
    await nextTick();
    store.updateControl('spread', 73);
    await nextTick();

    expect(mockReplace).not.toHaveBeenCalled();
    eventHandlers.get('pointerup')?.();

    expect(mockReplace).toHaveBeenCalledOnce();
    const serialized = decodeShareState(mockReplace.mock.lastCall?.[0]?.hash);
    expect(JSON.parse(serialized as string).roles.surface.controls.spread).toBe(73);
  });

  it('initializes store from URL query on mount', async () => {
    mockRoute.query = {
      colorHex: '00ff00',
      blendMode: 'multiply',
      blendStrength: '50',
    };

    // Create store
    const store = useTonalScaleStore();
    const importSpy = vi.spyOn(store, 'importState');

    useTonalUrlSync(store);

    expect(importSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        colorHex: '00ff00',
        blendMode: 'multiply',
        blendStrength: '50',
      }),
    );
  });

  it('restores a versioned multi-role configuration from the URL', () => {
    mockRoute.hash = encodeShareState(
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
  });

  it('continues to restore the previous JSON query format', () => {
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
  });
});
