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
</script>

<template>
  <div
    class="d-flex flex-column gap-2"
    data-cy="locale-switcher"
  >
    <div class="d-flex align-center justify-space-between">
      <div class="text-subtitle-2 font-weight-medium">
        {{ t('i18n.switcher.label') }}
      </div>
      <v-chip
        color="primary"
        variant="tonal"
        density="comfortable"
        size="small"
        data-cy="current-locale"
      >
        {{ t(`i18n.locales.${currentLocale}`) }}
      </v-chip>
    </div>

    <v-select
      :model-value="currentLocale"
      :items="options"
      density="comfortable"
      variant="outlined"
      hide-details="auto"
      @update:model-value="onUpdate"
    >
      <template #prepend-inner>
        <v-icon
          icon="mdi-translate"
          size="18"
          class="me-2"
        />
      </template>
      <template #message>
        <span class="text-body-2 text-medium-emphasis">
          {{ t('i18n.switcher.helper') }}
        </span>
      </template>
    </v-select>
  </div>
</template>
