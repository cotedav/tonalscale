import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { useTonalScaleStore } from '@/stores/tonalScale';

export default function useTonalUrlSync(store: ReturnType<typeof useTonalScaleStore>) {
  const route = useRoute();
  const router = useRouter();

  // Restore state from URL on mount
  onMounted(() => {
    const { query } = route;
    if (Object.keys(query).length === 0) return;

    // Convert query params (string | null | (string | null)[]) to simple object for importState
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
    () => store.scaleParams,
    (params) => {
      const query: Record<string, string> = {};

      query.colorHex = params.colorHex.replace('#', '');
      query.blendMode = params.blendMode;
      query.blendStrength = String(params.blendStrength);
      query.blendR = String(params.blendR);
      query.blendG = String(params.blendG);
      query.blendB = String(params.blendB);
      query.middle = String(params.middle);
      query.spread = String(params.spread);
      query.satDarker = String(params.satDarker);
      query.satLighter = String(params.satLighter);

      router.replace({ query });
    },
    { deep: true },
  );
}
