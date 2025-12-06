import { describe, it, expect, vi, beforeEach } from 'vitest';
import useTonalUrlSync from '@/composables/useTonalUrlSync';
import { createPinia, setActivePinia } from 'pinia';
import { useTonalScaleStore } from '@/stores/tonalScale';
import { nextTick } from 'vue';

// Mock vue-router
const mockReplace = vi.fn();
const mockRoute = { query: {} };

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
  };
});

describe('useTonalUrlSync', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockRoute.query = {};
    setActivePinia(createPinia());
  });

  it('updates the URL when store state changes', async () => {
    const store = useTonalScaleStore();
    useTonalUrlSync(store);

    // Initial state change
    store.baseHex = '#ff0000';
    await nextTick();

    expect(mockReplace).toHaveBeenCalled();
    const callArgs = mockReplace.mock.lastCall?.[0];
    expect(callArgs?.query).toMatchObject({
      colorHex: 'ff0000',
    });
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
});
