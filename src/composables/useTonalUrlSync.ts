import { useEventListener } from '@vueuse/core';
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { useTonalScaleStore } from '@/stores/tonalScale';
import decodeLegacyShareState from '@/utils/tonal/legacy-share-state';

export const TONAL_LOCAL_STORAGE_KEY = 'tonal-scale:state';

export default function useTonalUrlSync(store: ReturnType<typeof useTonalScaleStore>) {
  const route = useRoute();
  const router = useRouter();
  const idleDelay = 400;
  let pendingState: string | null = null;
  let updateTimer: ReturnType<typeof setTimeout> | null = null;

  const storage =
    typeof window !== 'undefined' && typeof window.localStorage?.getItem === 'function'
      ? window.localStorage
      : null;

  const clearUpdateTimer = () => {
    if (updateTimer === null) return;
    clearTimeout(updateTimer);
    updateTimer = null;
  };

  const persistState = (serializedState: string) => {
    storage?.setItem(TONAL_LOCAL_STORAGE_KEY, serializedState);
  };

  const flushLocalStorageUpdate = () => {
    if (!pendingState) return;
    clearUpdateTimer();
    const serializedState = pendingState;
    pendingState = null;
    persistState(serializedState);
  };

  const scheduleLocalStorageUpdate = (serializedState: string) => {
    pendingState = serializedState;
    clearUpdateTimer();
    updateTimer = setTimeout(flushLocalStorageUpdate, idleDelay);
  };

  const clearLegacyUrlState = () => {
    if (!route.hash && Object.keys(route.query).length === 0) return;
    router.replace({ query: {}, hash: '' }).catch(() => undefined);
  };

  const importAndPersist = (payload: string | Record<string, unknown>) => {
    if (!store.importState(payload)) return false;
    persistState(store.serializedState);
    clearLegacyUrlState();
    return true;
  };

  // Restore state from local storage, with one-time migration from old URL payloads.
  onMounted(() => {
    const hashState = decodeLegacyShareState(route.hash);
    if (hashState && importAndPersist(hashState)) return;

    const { query } = route;
    if (Object.keys(query).length > 0) {
      const encodedState = Array.isArray(query.config) ? query.config[0] : query.config;
      if (typeof encodedState === 'string' && importAndPersist(encodedState)) return;

      const payload: Record<string, unknown> = {};

      Object.keys(query).forEach((key) => {
        const value = query[key];
        // Take the first value if it's an array
        if (Array.isArray(value)) {
          const [first] = value;
          payload[key] = first;
        } else {
          payload[key] = value;
        }
      });

      if (importAndPersist(payload)) return;
    }

    const storedState = storage?.getItem(TONAL_LOCAL_STORAGE_KEY);
    if (storedState) {
      store.importState(storedState);
    }
  });

  // Sync state to local storage
  watch(
    () => store.serializedState,
    (serializedState) => {
      scheduleLocalStorageUpdate(serializedState);
    },
    { flush: 'post' },
  );

  useEventListener(
    window,
    ['pointerup', 'pointercancel', 'touchend', 'change'],
    flushLocalStorageUpdate,
  );
  onBeforeUnmount(clearUpdateTimer);
}
