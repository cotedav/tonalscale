import { useEventListener } from '@vueuse/core';
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { useTonalScaleStore } from '@/stores/tonalScale';
import { decodeShareState, encodeShareState } from '@/utils/tonal/share-state';

export default function useTonalUrlSync(store: ReturnType<typeof useTonalScaleStore>) {
  const route = useRoute();
  const router = useRouter();
  const idleDelay = 400;
  let pendingState: string | null = null;
  let updateTimer: ReturnType<typeof setTimeout> | null = null;

  const clearUpdateTimer = () => {
    if (updateTimer === null) return;
    clearTimeout(updateTimer);
    updateTimer = null;
  };

  const flushUrlUpdate = () => {
    if (!pendingState) return;
    clearUpdateTimer();
    const serializedState = pendingState;
    pendingState = null;
    router.replace({ query: {}, hash: encodeShareState(serializedState) }).catch(() => undefined);
  };

  const scheduleUrlUpdate = (serializedState: string) => {
    pendingState = serializedState;
    clearUpdateTimer();
    updateTimer = setTimeout(flushUrlUpdate, idleDelay);
  };

  // Restore state from URL on mount
  onMounted(() => {
    const hashState = decodeShareState(route.hash);
    if (hashState && store.importState(hashState)) return;

    const { query } = route;
    if (Object.keys(query).length === 0) return;

    const encodedState = Array.isArray(query.config) ? query.config[0] : query.config;
    if (typeof encodedState === 'string' && store.importState(encodedState)) return;

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

    store.importState(payload);
  });

  // Sync state to URL
  watch(
    () => store.serializedState,
    (serializedState) => {
      scheduleUrlUpdate(serializedState);
    },
    { flush: 'post' },
  );

  useEventListener(window, ['pointerup', 'pointercancel', 'touchend', 'change'], flushUrlUpdate);
  onBeforeUnmount(clearUpdateTimer);
}
