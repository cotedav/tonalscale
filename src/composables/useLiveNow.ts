import { computed, ref } from 'vue';
import { useIntervalFn, usePreferredLanguages } from '@vueuse/core';
import { DateTime } from 'luxon';

const DEFAULT_INTERVAL = 1000;

/**
 * Lightweight clock composable that updates on an interval.
 * Demonstrates VueUse helpers with Luxon for timezone-safe times.
 */
export default function useLiveNow(intervalMs = DEFAULT_INTERVAL) {
  const languages = usePreferredLanguages();
  const now = ref(DateTime.now());

  const { pause, resume } = useIntervalFn(() => {
    now.value = DateTime.now();
  }, intervalMs);

  const label = computed(() =>
    now.value.setLocale(languages.value?.[0]).toLocaleString(DateTime.DATETIME_MED),
  );

  return {
    now,
    label,
    pause,
    resume,
  };
}
