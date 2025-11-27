<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useLocale } from '@/composables/useLocale';
  import type { SupportedLocale } from '@/locales';

  const { t } = useI18n();
  const { availableLocales, currentLocale, switchLocale } = useLocale();

  const options = computed(() =>
    availableLocales.value.map((locale) => ({
      value: locale,
      title: t(`i18n.locales.${locale}`),
    })),
  );

  const onUpdate = async (locale: SupportedLocale) => {
    await switchLocale(locale);
  };

  const updateLocale = async (event: Event) => {
    const value = (event.target as HTMLSelectElement).value as SupportedLocale;
    await onUpdate(value);
  };
</script>

<template>
  <div
    class="space-y-2"
    data-cy="locale-switcher"
  >
    <div class="flex items-center justify-between">
      <div class="text-sm font-semibold text-slate-100">
        {{ t('i18n.switcher.label') }}
      </div>
      <span
        class="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
        data-cy="current-locale"
      >
        {{ t(`i18n.locales.${currentLocale}`) }}
      </span>
    </div>

    <label class="flex flex-col gap-2 text-xs text-slate-400">
      <span>{{ t('i18n.switcher.helper') }}</span>
      <div class="relative">
        <select
          :value="currentLocale"
          class="w-full appearance-none rounded-lg border border-slate-700 bg-surface-soft px-3 py-2 text-sm font-medium text-slate-100 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-strong/30"
          data-cy="locale-select"
          @change="updateLocale"
        >
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="bg-surface-strong text-slate-100"
          >
            {{ option.title }}
          </option>
        </select>
        <span
          class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500"
          >⌄</span
        >
      </div>
    </label>
  </div>
</template>
