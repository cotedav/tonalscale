<script setup lang="ts">
  import { useNow } from '@vueuse/core';
  import { DateTime } from 'luxon';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import LocaleSwitcher from '@/components/i18n/LocaleSwitcher.vue';
  import ValidationSampleForm from '@/components/forms/ValidationSampleForm.vue';
  import UtilityExamples from '@/components/demo/UtilityExamples.vue';

  const now = useNow();
  const { t } = useI18n();

  const title = computed(() => t('home.hero.title'));
  const description = computed(() => t('home.hero.description'));
  const toolkitTitle = computed(() => t('home.toolkit.title'));
  const toolkitDescription = computed(() => t('home.toolkit.description'));
  const timestampTitle = computed(() => t('home.timestamp.title'));
  const localizationHeading = computed(() => t('home.localization.heading'));
  const localizationDescription = computed(() => t('home.localization.description'));
  const validationHeading = computed(() => t('home.validation.heading'));
  const validationDescription = computed(() => t('home.validation.description'));
  const utilitiesHeading = computed(() => t('home.utilities.heading'));
  const utilitiesDescription = computed(() => t('home.utilities.description'));
</script>

<template>
  <section
    class="d-flex flex-column gap-4"
    data-cy="home-shell"
  >
    <header class="text-center">
      <v-icon
        icon="mdi-rocket-launch"
        size="64"
        color="primary"
        class="mb-4"
      />
      <h1
        class="text-h4 font-weight-bold mb-2"
        data-cy="home-title"
      >
        {{ title }}
      </h1>
      <p
        class="text-body-1 text-medium-emphasis"
        data-cy="home-description"
      >
        {{ description }}
      </p>
    </header>

    <v-divider class="my-2" />

    <v-alert
      type="info"
      variant="tonal"
      border="start"
      prominent
      data-cy="toolkit-alert"
    >
      <div class="text-subtitle-1 font-weight-medium">{{ toolkitTitle }}</div>
      <div class="text-body-2 text-medium-emphasis">
        {{ toolkitDescription }}
      </div>
    </v-alert>

    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1 font-weight-medium">{{ timestampTitle }}</v-card-title>
      <v-card-text class="text-body-2">
        {{ DateTime.fromJSDate(now).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) }}
      </v-card-text>
    </v-card>

    <v-card
      variant="outlined"
      data-cy="localization-card"
    >
      <v-card-title class="text-subtitle-1 font-weight-medium">{{
        localizationHeading
      }}</v-card-title>
      <v-card-text class="d-flex flex-column gap-4">
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ localizationDescription }}
        </p>

        <LocaleSwitcher />
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1 font-weight-medium">{{
        validationHeading
      }}</v-card-title>
      <v-card-text class="d-flex flex-column gap-4">
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ validationDescription }}
        </p>

        <ValidationSampleForm />
      </v-card-text>
    </v-card>

    <v-card
      variant="outlined"
      data-cy="utilities-card"
    >
      <v-card-title class="text-subtitle-1 font-weight-medium">{{ utilitiesHeading }}</v-card-title>
      <v-card-text class="d-flex flex-column gap-4">
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ utilitiesDescription }}
        </p>

        <UtilityExamples />
      </v-card-text>
    </v-card>
  </section>
</template>
