<script setup lang="ts">
  import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    TransitionChild,
    TransitionRoot,
  } from '@headlessui/vue';
  import { useNow } from '@vueuse/core';
  import { DateTime } from 'luxon';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ChevronDownIcon, RocketLaunchIcon } from '@heroicons/vue/24/solid';
  import LocaleSwitcher from '@/components/i18n/LocaleSwitcher.vue';
  import ValidationSampleForm from '@/components/forms/ValidationSampleForm.vue';
  import UtilityExamples from '@/components/demo/UtilityExamples.vue';

  const now = useNow();
  const { t, tm } = useI18n();

  const title = computed(() => t('home.hero.title'));
  const description = computed(() => t('home.hero.description'));
  const toolkitTitle = computed(() => t('home.toolkit.title'));
  const toolkitDescription = computed(() => t('home.toolkit.description'));
  const toolkitStackLabel = computed(() => t('home.toolkit.stack_label'));
  const timestampTitle = computed(() => t('home.timestamp.title'));
  const localizationHeading = computed(() => t('home.localization.heading'));
  const localizationDescription = computed(() => t('home.localization.description'));
  const validationHeading = computed(() => t('home.validation.heading'));
  const validationDescription = computed(() => t('home.validation.description'));
  const utilitiesHeading = computed(() => t('home.utilities.heading'));
  const utilitiesDescription = computed(() => t('home.utilities.description'));

  const toolkitStackItems = computed(() => tm('home.toolkit.stack_items') as string[]);
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
      <Disclosure
        v-slot="{ open }"
        default-open
        as="div"
        class="space-y-3"
      >
        <DisclosureButton
          class="flex w-full items-start justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
          data-cy="toolkit-toggle"
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
          <ChevronDownIcon
            class="h-5 w-5 shrink-0 text-slate-400 transition duration-200"
            :class="open ? 'rotate-180 text-accent-soft' : ''"
            aria-hidden="true"
          />
        </DisclosureButton>

        <TransitionRoot
          :show="open"
          as="template"
        >
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 -translate-y-1"
            enter-to="opacity-100 translate-y-0"
            leave="duration-150 ease-in"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 -translate-y-1"
          >
            <DisclosurePanel
              class="space-y-2 rounded-xl border border-slate-800 bg-surface-soft/80 p-4"
            >
              <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {{ toolkitStackLabel }}
              </div>
              <div
                class="flex flex-wrap gap-2"
                data-cy="toolkit-stack"
              >
                <span
                  v-for="item in toolkitStackItems"
                  :key="item"
                  class="inline-flex items-center gap-2 rounded-full border border-accent-strong/40 bg-accent-strong/15 px-3 py-1 text-xs font-semibold text-accent-soft"
                  data-cy="toolkit-stack-item"
                >
                  <span class="h-2 w-2 rounded-full bg-accent-soft" />
                  {{ item }}
                </span>
              </div>
            </DisclosurePanel>
          </TransitionChild>
        </TransitionRoot>
      </Disclosure>
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
