<script setup lang="ts">
  import { useTitle } from '@vueuse/core';
  import { computed, watchEffect } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const pageTitle = computed(() => t('tonal_builder.meta.title'));
  const pageDescription = computed(() => t('tonal_builder.meta.description'));

  useTitle(pageTitle);

  watchEffect(() => {
    const descriptionTag =
      (document.querySelector('meta[name="description"]') as HTMLMetaElement | null) ??
      (() => {
        const tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
        return tag;
      })();

    descriptionTag.setAttribute('content', pageDescription.value);
  });
</script>

<template>
  <section
    class="isolate space-y-8 overflow-visible"
    aria-labelledby="tonal-builder-heading"
    data-cy="tonal-builder-home"
  >
    <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-wide text-accent-soft">
          {{ t('tonal_builder.hero.kicker') }}
        </p>
        <h1
          id="tonal-builder-heading"
          class="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl"
          data-cy="tonal-builder-title"
        >
          {{ t('tonal_builder.hero.title') }}
        </h1>
        <p class="max-w-3xl text-base text-slate-300">
          {{ t('tonal_builder.hero.description') }}
        </p>
      </div>

      <div
        class="flex flex-wrap gap-3"
        :aria-label="t('tonal_builder.hero.actions_label')"
      >
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-accent-strong/20 px-4 py-2 text-sm font-semibold text-accent-strong shadow-glow ring-1 ring-inset ring-accent-strong/30 backdrop-blur transition hover:bg-accent-strong/30"
          data-cy="tonal-builder-import"
        >
          {{ t('tonal_builder.hero.import_export') }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-white/10 transition hover:bg-white/10"
          data-cy="tonal-builder-copy"
        >
          {{ t('tonal_builder.hero.copy_svg') }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/5"
          data-cy="tonal-builder-scaffolding"
        >
          {{ t('tonal_builder.hero.view_demo') }}
        </button>
      </div>
    </header>

    <div class="grid gap-6 xl:[grid-template-columns:320px_minmax(0,1fr)_320px]">
      <aside
        class="space-y-4"
        :aria-label="t('tonal_builder.regions.pickers_label')"
      >
        <div
          class="card-surface space-y-3 border-dashed border-accent-soft/40 bg-surface-soft/80"
          data-cy="base-picker-placeholder"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="section-title">{{ t('tonal_builder.pickers.base.title') }}</div>
              <p class="section-subtitle">{{ t('tonal_builder.pickers.base.description') }}</p>
            </div>
            <span
              class="rounded-full bg-accent-strong/15 px-3 py-1 text-xs font-semibold text-accent-soft"
            >
              {{ t('tonal_builder.pickers.base.badge') }}
            </span>
          </div>
          <div
            class="rounded-xl border border-dashed border-accent-strong/40 bg-surface/60 p-4 text-sm text-slate-200"
          >
            {{ t('tonal_builder.pickers.base.placeholder') }}
          </div>
        </div>

        <div
          class="card-surface space-y-3 border-dashed border-accent-soft/40 bg-surface-soft/80"
          data-cy="blend-picker-placeholder"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="section-title">{{ t('tonal_builder.pickers.blend.title') }}</div>
              <p class="section-subtitle">{{ t('tonal_builder.pickers.blend.description') }}</p>
            </div>
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              {{ t('tonal_builder.pickers.blend.badge') }}
            </span>
          </div>
          <div
            class="rounded-xl border border-dashed border-white/20 bg-surface/60 p-4 text-sm text-slate-200"
          >
            {{ t('tonal_builder.pickers.blend.placeholder') }}
          </div>
        </div>

        <div
          class="card-surface space-y-3 border-dashed border-white/15 bg-surface-soft/80"
          data-cy="control-panel-placeholder"
        >
          <div class="section-title">{{ t('tonal_builder.controls.title') }}</div>
          <p class="section-subtitle">{{ t('tonal_builder.controls.description') }}</p>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              class="rounded-lg border border-dashed border-white/15 bg-surface/60 px-3 py-2 text-sm text-slate-200"
            >
              {{ t('tonal_builder.controls.blend_mode') }}
            </div>
            <div
              class="rounded-lg border border-dashed border-white/15 bg-surface/60 px-3 py-2 text-sm text-slate-200"
            >
              {{ t('tonal_builder.controls.sliders') }}
            </div>
            <div
              class="rounded-lg border border-dashed border-white/15 bg-surface/60 px-3 py-2 text-sm text-slate-200 sm:col-span-2"
            >
              {{ t('tonal_builder.controls.saturation') }}
            </div>
          </div>
        </div>
      </aside>

      <div
        class="space-y-4"
        data-cy="scale-preview-region"
      >
        <div
          class="card-surface space-y-4 border-dashed border-white/15 bg-surface-soft/80"
          data-cy="scale-strips-placeholder"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="section-title">{{ t('tonal_builder.scales.title') }}</div>
              <p class="section-subtitle">{{ t('tonal_builder.scales.description') }}</p>
            </div>
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('tonal_builder.scales.badge') }}
            </span>
          </div>
          <div class="grid gap-3 lg:grid-cols-3">
            <div
              class="space-y-2 rounded-xl border border-dashed border-accent-strong/40 bg-surface px-3 py-3"
            >
              <div class="text-sm font-semibold text-slate-100">
                {{ t('tonal_builder.scales.full') }}
              </div>
              <div
                class="h-20 rounded-lg bg-gradient-to-r from-white/10 via-accent-strong/20 to-white/5"
              />
            </div>
            <div
              class="space-y-2 rounded-xl border border-dashed border-white/20 bg-surface px-3 py-3"
            >
              <div class="text-sm font-semibold text-slate-100">
                {{ t('tonal_builder.scales.extended') }}
              </div>
              <div
                class="h-20 rounded-lg bg-gradient-to-r from-white/5 via-accent-soft/20 to-white/10"
              />
            </div>
            <div
              class="space-y-2 rounded-xl border border-dashed border-white/20 bg-surface px-3 py-3"
            >
              <div class="text-sm font-semibold text-slate-100">
                {{ t('tonal_builder.scales.key') }}
              </div>
              <div
                class="h-20 rounded-lg bg-gradient-to-r from-white/15 via-accent-soft/30 to-white/10"
              />
            </div>
          </div>
        </div>

        <div
          class="card-surface relative space-y-3 overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="interactive-overlays-placeholder"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="section-title">{{ t('tonal_builder.overlays.title') }}</div>
              <p class="section-subtitle">{{ t('tonal_builder.overlays.description') }}</p>
            </div>
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              {{ t('tonal_builder.overlays.badge') }}
            </span>
          </div>
          <div class="grid gap-3 lg:grid-cols-2">
            <div
              class="rounded-xl border border-dashed border-white/20 bg-surface/70 p-4 text-sm text-slate-200"
            >
              {{ t('tonal_builder.overlays.hover') }}
            </div>
            <div
              class="rounded-xl border border-dashed border-accent-soft/40 bg-surface/70 p-4 text-sm text-slate-200"
            >
              {{ t('tonal_builder.overlays.menus') }}
            </div>
          </div>
        </div>
      </div>

      <aside
        class="space-y-4"
        :aria-label="t('tonal_builder.regions.accessibility_label')"
      >
        <div
          class="card-surface space-y-3 border-dashed border-white/15 bg-surface-soft/80"
          data-cy="accessibility-placeholder"
        >
          <div class="section-title">{{ t('tonal_builder.accessibility.title') }}</div>
          <p class="section-subtitle">{{ t('tonal_builder.accessibility.description') }}</p>
          <div class="space-y-2">
            <div
              class="rounded-lg border border-dashed border-white/20 bg-surface px-3 py-2 text-sm text-slate-200"
            >
              {{ t('tonal_builder.accessibility.contrast_cards') }}
            </div>
            <div
              class="rounded-lg border border-dashed border-white/20 bg-surface px-3 py-2 text-sm text-slate-200"
            >
              {{ t('tonal_builder.accessibility.preview_links') }}
            </div>
          </div>
        </div>

        <div
          class="card-surface relative space-y-3 overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="modal-stack-placeholder"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="section-title">{{ t('tonal_builder.modals.title') }}</div>
              <p class="section-subtitle">{{ t('tonal_builder.modals.description') }}</p>
            </div>
            <span
              class="rounded-full bg-accent-strong/20 px-3 py-1 text-xs font-semibold text-accent-strong"
            >
              {{ t('tonal_builder.modals.badge') }}
            </span>
          </div>
          <div class="space-y-2">
            <div
              class="rounded-lg border border-dashed border-accent-strong/40 bg-surface px-3 py-2 text-sm text-slate-200"
            >
              {{ t('tonal_builder.modals.dialogs') }}
            </div>
            <div
              class="rounded-lg border border-dashed border-white/20 bg-surface px-3 py-2 text-sm text-slate-200"
            >
              {{ t('tonal_builder.modals.clipboard') }}
            </div>
            <div
              class="rounded-lg border border-dashed border-white/20 bg-surface px-3 py-2 text-sm text-slate-200"
            >
              {{ t('tonal_builder.modals.toast_area') }}
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
