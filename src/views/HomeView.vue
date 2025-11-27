<script setup lang="ts">
  import { useNow } from '@vueuse/core';
  import { DateTime } from 'luxon';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { RocketLaunchIcon } from '@heroicons/vue/24/solid';
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
    class="space-y-6"
    data-cy="home-shell"
  >
    <header class="text-center space-y-4">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-strong/20 text-accent-strong"
      >
        <RocketLaunchIcon class="h-8 w-8" />
      </div>
      <h1
        class="text-3xl font-bold tracking-tight sm:text-4xl"
        data-cy="home-title"
      >
        {{ title }}
      </h1>
      <p
        class="mx-auto max-w-3xl text-base text-slate-300"
        data-cy="home-description"
      >
        {{ description }}
      </p>
    </header>

    <div class="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

    <div
      class="card-surface border-accent-strong/30 bg-surface-soft/80"
      data-cy="toolkit-alert"
    >
      <div class="flex items-start gap-3">
        <div
          class="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-accent-strong/15 text-accent-strong shadow-glow"
        >
          <div class="flex h-full items-center justify-center text-lg font-semibold">ℹ</div>
        </div>
        <div class="space-y-2">
          <div class="section-title">{{ toolkitTitle }}</div>
          <p class="section-subtitle">{{ toolkitDescription }}</p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="card-surface">
        <div class="section-title">{{ timestampTitle }}</div>
        <p class="mt-3 text-sm text-slate-300">
          {{ DateTime.fromJSDate(now).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) }}
        </p>
      </div>

      <div
        class="card-surface space-y-3"
        data-cy="localization-card"
      >
        <div class="section-title">{{ localizationHeading }}</div>
        <p class="section-subtitle">
          {{ localizationDescription }}
        </p>

        <LocaleSwitcher />
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="card-surface space-y-3">
        <div class="section-title">{{ validationHeading }}</div>
        <p class="section-subtitle">
          {{ validationDescription }}
        </p>

        <ValidationSampleForm />
      </div>

      <div
        class="card-surface space-y-3"
        data-cy="utilities-card"
      >
        <div class="section-title">{{ utilitiesHeading }}</div>
        <p class="section-subtitle">
          {{ utilitiesDescription }}
        </p>

        <UtilityExamples />
      </div>
    </div>
  </section>
</template>
