<script setup lang="ts">
  import { useTitle } from '@vueuse/core';
  import { computed, watchEffect } from 'vue';
  import { useI18n } from 'vue-i18n';

  import ColorPickerCard from '@/components/tonal-builder/ColorPickerCard.vue';
  import { useTonalBuilderColors } from '@/composables/useTonalBuilderColors';

  const { t } = useI18n();

  const pageTitle = computed(() => t('tonal_builder.meta.title'));
  const pageDescription = computed(() => t('tonal_builder.meta.description'));

  const { baseHex, blendHex, sliderMode, updateBase, updateBlend, setSliderMode } =
    useTonalBuilderColors();

  const baseHexModel = computed({
    get: () => baseHex.value,
    set: (value: string) => {
      updateBase(value);
    },
  });

  const blendHexModel = computed({
    get: () => blendHex.value,
    set: (value: string) => {
      updateBlend(value);
    },
  });

  const sliderModeModel = computed({
    get: () => sliderMode.value,
    set: (value: typeof sliderMode.value) => {
      setSliderMode(value);
    },
  });

  const baseSwatchStyle = computed(() => ({ backgroundColor: baseHex.value }));
  const blendSwatchStyle = computed(() => ({ backgroundColor: blendHex.value }));

  const blendModes = computed(() => [
    { label: t('tonal_builder.controls.blend_modes.darken'), value: 'darken' },
    { label: t('tonal_builder.controls.blend_modes.multiply'), value: 'multiply' },
    { label: t('tonal_builder.controls.blend_modes.color_burn'), value: 'colorburn' },
    { label: t('tonal_builder.controls.blend_modes.lighten'), value: 'lighten' },
    { label: t('tonal_builder.controls.blend_modes.screen'), value: 'screen' },
    { label: t('tonal_builder.controls.blend_modes.color_dodge'), value: 'colordodge' },
    { label: t('tonal_builder.controls.blend_modes.overlay'), value: 'overlay' },
    { label: t('tonal_builder.controls.blend_modes.soft_light'), value: 'softlight' },
    { label: t('tonal_builder.controls.blend_modes.hard_light'), value: 'hardlight' },
    { label: t('tonal_builder.controls.blend_modes.vivid_light'), value: 'vividlight' },
    { label: t('tonal_builder.controls.blend_modes.hue'), value: 'hue' },
  ]);

  const sliderControls = computed(() => [
    {
      id: 'strength',
      label: t('tonal_builder.controls.fields.strength'),
      range: { id: 'strength-slider', min: 0, max: 100, step: 1, value: 0 },
      number: { id: 'strength-value', min: 0, max: 100, step: 1, value: 0 },
    },
    {
      id: 'middle',
      label: t('tonal_builder.controls.fields.middle'),
      range: { id: 'middle-slider', min: -50, max: 50, step: 1, value: 0 },
      number: { id: 'middle-value', min: 0, max: 100, step: 1, value: 0 },
    },
    {
      id: 'spread',
      label: t('tonal_builder.controls.fields.spread'),
      range: { id: 'spread-slider', min: 0, max: 100, step: 1, value: 0 },
      number: { id: 'spread-value', min: 0, max: 1, step: 1, value: 0 },
    },
    {
      id: 'satDarker',
      label: t('tonal_builder.controls.fields.sat_darker'),
      range: { id: 'satDarker-slider', min: 0, max: 100, step: 1, value: 0 },
      number: { id: 'satDarker-value', min: 0, max: 100, step: 1, value: 0 },
    },
    {
      id: 'satLighter',
      label: t('tonal_builder.controls.fields.sat_lighter'),
      range: { id: 'satLighter-slider', min: 0, max: 100, step: 1, value: 0 },
      number: { id: 'satLighter-value', min: 0, max: 100, step: 1, value: 0 },
    },
  ]);

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
  <main
    class="mx-auto max-w-6xl space-y-8 px-4 py-8"
    aria-labelledby="tonal-builder-heading"
    data-cy="tonal-builder-home"
  >
    <h1
      id="tonal-builder-heading"
      class="sr-only"
      data-cy="tonal-builder-title"
    >
      {{ pageTitle }}
    </h1>

    <section
      class="space-y-6"
      :aria-label="t('tonal_builder.actions.toolbar_label')"
    >
      <div
        id="toolbar"
        class="flex flex-wrap items-center justify-between gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <div
            id="baseColorPickerInput"
            class="flex items-center gap-3 rounded-2xl border border-dashed border-accent-soft/40 bg-surface-soft/80 px-4 py-3 shadow-card"
          >
            <div
              class="h-10 w-10 rounded-full border border-white/10"
              :style="baseSwatchStyle"
            />
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-100">
                {{ t('tonal_builder.pickers.base.title') }}
              </p>
              <p class="text-xs text-slate-400">
                {{ baseHex }}
              </p>
            </div>
          </div>

          <div
            id="blendColorPickerInput"
            class="flex items-center gap-3 rounded-2xl border border-dashed border-accent-soft/40 bg-surface-soft/80 px-4 py-3 shadow-card"
          >
            <div
              class="h-10 w-10 rounded-full border border-white/10"
              :style="blendSwatchStyle"
            />
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-100">
                {{ t('tonal_builder.pickers.blend.title') }}
              </p>
              <p class="text-xs text-slate-400">
                {{ blendHex }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="flex items-center gap-3"
          :aria-label="t('tonal_builder.actions.actions_label')"
        >
          <button
            id="import-export-button"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-accent-strong/20 px-4 py-2 text-sm font-semibold text-accent-strong shadow-glow ring-1 ring-inset ring-accent-strong/30 backdrop-blur transition hover:bg-accent-strong/30"
            data-cy="tonal-builder-import"
          >
            {{ t('tonal_builder.actions.import_export') }}
          </button>
          <button
            id="copy-button"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-white/10 transition hover:bg-white/10"
            data-cy="tonal-builder-copy"
          >
            {{ t('tonal_builder.actions.copy_svg') }}
          </button>
          <button
            id="theme-toggle"
            type="button"
            class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-surface-soft/60 text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/5"
            :aria-label="t('tonal_builder.actions.theme_toggle')"
            data-cy="tonal-builder-theme-toggle"
          >
            <div
              class="icon-holder flex h-full w-full flex-col items-center justify-center overflow-hidden text-lg"
            >
              <i class="material-icons moon leading-none">dark_mode</i>
              <i class="material-icons sun leading-none">light_mode</i>
            </div>
          </button>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <ColorPickerCard
          id="baseColorPicker"
          v-model="baseHexModel"
          v-model:slider-mode="sliderModeModel"
          :label="t('tonal_builder.pickers.base.title')"
          :description="t('tonal_builder.pickers.base.description')"
          :swatch-label="t('tonal_builder.pickers.base.badge')"
          data-cy="base-color-picker"
        />
        <ColorPickerCard
          id="blendColorPicker"
          v-model="blendHexModel"
          v-model:slider-mode="sliderModeModel"
          :label="t('tonal_builder.pickers.blend.title')"
          :description="t('tonal_builder.pickers.blend.description')"
          :swatch-label="t('tonal_builder.pickers.blend.badge')"
          data-cy="blend-color-picker"
        />
      </div>
    </section>

    <section
      class="space-y-4"
      :aria-label="t('tonal_builder.scales.title')"
    >
      <div class="space-y-1">
        <p class="text-sm uppercase tracking-wide text-accent-soft">
          {{ t('tonal_builder.scales.badge') }}
        </p>
        <p class="text-lg font-semibold text-slate-100">
          {{ t('tonal_builder.scales.title') }}
        </p>
        <p class="text-sm text-slate-400">{{ t('tonal_builder.scales.description') }}</p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-100">
              {{ t('tonal_builder.scales.full') }}
            </span>
            <span class="text-xs text-slate-500">{{ t('tonal_builder.scales.full_helper') }}</span>
          </div>
          <div
            id="color-scale-container-full"
            class="color-scale-container relative min-h-[96px] rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-3"
            showBlendDistGraph="true"
            data-cy="scale-strip-full"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-100">
              {{ t('tonal_builder.scales.extended') }}
            </span>
            <span class="text-xs text-slate-500">{{
              t('tonal_builder.scales.extended_helper')
            }}</span>
          </div>
          <div
            id="color-scale-container-custom"
            class="color-scale-container relative min-h-[72px] rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-3"
            data-cy="scale-strip-extended"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-100">
              {{ t('tonal_builder.scales.key') }}
            </span>
            <span class="text-xs text-slate-500">{{ t('tonal_builder.scales.key_helper') }}</span>
          </div>
          <div
            id="color-scale-container-key"
            class="color-scale-container relative min-h-[72px] rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-3"
            data-cy="scale-strip-key"
          />
        </div>
      </div>
    </section>

    <section
      class="space-y-3"
      :aria-label="t('tonal_builder.controls.title')"
    >
      <p class="text-lg font-semibold text-slate-100">{{ t('tonal_builder.controls.title') }}</p>
      <p class="text-sm text-slate-400">{{ t('tonal_builder.controls.description') }}</p>

      <div
        id="gradient-controls"
        class="grid grid-cols-1 items-center gap-3 rounded-3xl border border-dashed border-white/15 bg-surface-soft/80 p-4 sm:grid-cols-[auto_minmax(0,1fr)_88px]"
        data-cy="gradient-controls"
      >
        <label
          class="text-sm font-semibold text-slate-100"
          for="blendmode"
        >
          {{ t('tonal_builder.controls.labels.blend_mode') }}
        </label>
        <select
          id="blendmode"
          name="blendmode"
          class="h-11 w-full rounded-xl border border-white/10 bg-surface px-3 text-sm text-slate-100 shadow-inner"
          data-cy="blendmode-select"
        >
          <option
            v-for="mode in blendModes"
            :key="mode.value"
            :value="mode.value"
          >
            {{ mode.label }}
          </option>
        </select>
        <span
          aria-hidden="true"
          class="hidden sm:block"
        />

        <label
          class="text-sm font-semibold text-slate-100"
          for="blendColorPickerInput"
        >
          {{ t('tonal_builder.controls.labels.blend_color') }}
        </label>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            id="blendColorPickerInput"
            class="h-11 rounded-xl border border-dashed border-accent-soft/40 bg-surface/70 px-3"
            data-cy="blend-color-input"
          />
          <div
            id="blendColorPicker"
            class="h-11 flex-1 rounded-xl border border-dashed border-accent-soft/40 bg-surface/70"
            data-cy="blend-color-picker"
          />
        </div>
        <span
          aria-hidden="true"
          class="hidden sm:block"
        />

        <template
          v-for="control in sliderControls"
          :key="control.id"
        >
          <label
            :for="control.range.id"
            class="text-sm font-semibold text-slate-100"
          >
            {{ control.label }}
          </label>
          <input
            :id="control.range.id"
            type="range"
            :min="control.range.min"
            :max="control.range.max"
            :step="control.range.step"
            :value="control.range.value"
            class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-accent"
            :aria-label="control.label"
            :data-cy="`${control.id}-slider`"
          />
          <input
            :id="control.number.id"
            type="number"
            :min="control.number.min"
            :max="control.number.max"
            :step="control.number.step"
            :value="control.number.value"
            class="h-11 w-full rounded-xl border border-white/10 bg-surface px-3 text-sm text-slate-100 shadow-inner"
            :aria-label="control.label"
            :data-cy="`${control.id}-value`"
          />
        </template>
      </div>
    </section>

    <section
      class="space-y-3"
      :aria-label="t('tonal_builder.accessibility.title')"
    >
      <div class="flex flex-wrap items-baseline gap-2">
        <p class="text-lg font-semibold text-slate-100">
          {{ t('tonal_builder.accessibility.title') }}
        </p>
        <p class="text-sm text-slate-400">
          {{ t('tonal_builder.accessibility.description') }}
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div
          id="colorcard-darker45"
          class="space-y-3 rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-4"
          data-cy="colorcard-darker45"
        >
          <p class="text-base font-semibold text-slate-100">
            {{ t('tonal_builder.accessibility.cards.darker_45') }}
          </p>
          <div
            class="h-28 rounded-xl border border-white/10 bg-gradient-to-r from-slate-700 via-slate-500 to-white/20"
          />
        </div>

        <div
          id="colorcard-darker3"
          class="space-y-3 rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-4"
          data-cy="colorcard-darker3"
        >
          <p class="text-base font-semibold text-slate-100">
            {{ t('tonal_builder.accessibility.cards.darker_3') }}
          </p>
          <div
            class="h-28 rounded-xl border border-white/10 bg-gradient-to-r from-slate-600 via-slate-400 to-white/25"
          />
        </div>

        <div
          id="colorcard-lighter3"
          class="space-y-3 rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-4"
          data-cy="colorcard-lighter3"
        >
          <p class="text-base font-semibold text-slate-100">
            {{ t('tonal_builder.accessibility.cards.lighter_3') }}
          </p>
          <div
            class="h-28 rounded-xl border border-white/10 bg-gradient-to-r from-white/20 via-accent-soft/40 to-white/60"
          />
        </div>

        <div
          id="colorcard-lighter45"
          class="space-y-3 rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-4"
          data-cy="colorcard-lighter45"
        >
          <p class="text-base font-semibold text-slate-100">
            {{ t('tonal_builder.accessibility.cards.lighter_45') }}
          </p>
          <div
            class="h-28 rounded-xl border border-white/10 bg-gradient-to-r from-white/30 via-accent/60 to-white/80"
          />
        </div>
      </div>
    </section>

    <section
      class="space-y-4"
      :aria-label="t('tonal_builder.overlays.title')"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="text-lg font-semibold text-slate-100">
            {{ t('tonal_builder.overlays.title') }}
          </p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.overlays.description') }}</p>
        </div>
        <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
          {{ t('tonal_builder.overlays.badge') }}
        </span>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <div
          class="card-surface relative overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="interactive-overlays-placeholder"
        >
          <p class="text-sm font-semibold text-slate-100">
            {{ t('tonal_builder.overlays.hover') }}
          </p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.overlays.hover_helper') }}</p>
          <div class="mt-3 h-32 rounded-xl border border-white/10 bg-surface/60" />
        </div>

        <div
          class="card-surface relative overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="context-menus-placeholder"
        >
          <p class="text-sm font-semibold text-slate-100">
            {{ t('tonal_builder.overlays.menus') }}
          </p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.overlays.menus_helper') }}</p>
          <div class="mt-3 h-32 rounded-xl border border-white/10 bg-surface/60" />
        </div>
      </div>
    </section>

    <section
      class="space-y-3"
      :aria-label="t('tonal_builder.modals.title')"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-lg font-semibold text-slate-100">{{ t('tonal_builder.modals.title') }}</p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.modals.description') }}</p>
        </div>
        <span
          class="rounded-full bg-accent-strong/20 px-3 py-1 text-xs font-semibold text-accent-strong"
        >
          {{ t('tonal_builder.modals.badge') }}
        </span>
      </div>

      <div class="grid gap-3 lg:grid-cols-3">
        <div
          class="card-surface relative overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="modal-dialog-placeholder"
        >
          <p class="text-sm font-semibold text-slate-100">
            {{ t('tonal_builder.modals.dialogs') }}
          </p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.modals.dialogs_helper') }}</p>
          <div class="mt-3 h-24 rounded-xl border border-white/10 bg-surface/60" />
        </div>
        <div
          class="card-surface relative overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="clipboard-placeholder"
        >
          <p class="text-sm font-semibold text-slate-100">
            {{ t('tonal_builder.modals.clipboard') }}
          </p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.modals.clipboard_helper') }}</p>
          <div class="mt-3 h-24 rounded-xl border border-white/10 bg-surface/60" />
        </div>
        <div
          class="card-surface relative overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="toast-area-placeholder"
        >
          <p class="text-sm font-semibold text-slate-100">
            {{ t('tonal_builder.modals.toast_area') }}
          </p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.modals.toast_helper') }}</p>
          <div class="mt-3 h-24 rounded-xl border border-white/10 bg-surface/60" />
        </div>
      </div>

      <div
        id="dialog-overlay"
        class="fixed inset-0 z-20 hidden bg-black/60"
        aria-hidden="true"
        data-cy="dialog-overlay"
      />
      <div
        id="dialog"
        class="fixed inset-x-4 top-20 z-30 hidden space-y-4 rounded-2xl border border-white/15 bg-surface-soft/95 p-4 shadow-card"
        role="dialog"
        aria-labelledby="dialog-title"
        data-cy="dialog-shell"
      >
        <div
          id="dialog-header"
          class="flex items-center justify-between gap-3"
        >
          <label
            id="dialog-title"
            class="text-base font-semibold text-slate-100"
          >
            {{ t('tonal_builder.modals.dialog_title') }}
          </label>
          <button
            id="dialog-close"
            type="button"
            class="rounded-full border border-white/10 px-3 py-1 text-lg text-slate-100 hover:bg-white/5"
            :aria-label="t('tonal_builder.modals.close_label')"
          >
            &times;
          </button>
        </div>
        <div
          id="dialog-body"
          class="min-h-[120px] rounded-xl border border-dashed border-white/10 bg-surface/60"
          :aria-label="t('tonal_builder.modals.dialog_body')"
        />
        <div
          id="dialog-footer"
          class="min-h-[56px] rounded-xl border border-white/10 bg-surface/50"
        />
      </div>

      <div
        id="copied-message"
        class="fixed left-1/2 top-6 z-40 hidden -translate-x-1/2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-900 shadow-card"
        role="status"
        aria-live="polite"
        data-cy="copied-message"
      >
        {{ t('tonal_builder.actions.copied_message') }}
      </div>
    </section>
  </main>
</template>
