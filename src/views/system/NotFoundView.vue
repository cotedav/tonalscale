<script setup lang="ts">
  import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>

<template>
  <section
    class="flex flex-col items-center gap-6 text-center"
    data-cy="not-found"
  >
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-rose-300"
    >
      <ExclamationTriangleIcon class="h-9 w-9" />
    </div>
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-slate-50">{{ t('system.not_found.title') }}</h1>
      <p class="text-sm text-slate-300">{{ t('system.not_found.message') }}</p>
    </div>
    <RouterLink
      to="/"
      class="rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent"
      data-cy="not-found-home-link"
    >
      {{ t('system.not_found.home') }}
    </RouterLink>
  </section>
</template>
