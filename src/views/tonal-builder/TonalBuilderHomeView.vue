<script setup lang="ts">
  import { useEventListener, useTitle } from '@vueuse/core';
  import { computed, reactive, ref, watchEffect } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { storeToRefs } from 'pinia';
  import { MoonIcon, SunIcon } from '@heroicons/vue/24/solid';

  import ColorPickerCard from '@/components/tonal-builder/ColorPickerCard.vue';
  import ContrastPreviewCard from '@/components/tonal-builder/ContrastPreviewCard.vue';
  import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
  import {
    type BlendControlId,
    type ControlError,
    useTonalBuilderControls,
  } from '@/composables/useTonalBuilderControls';
  import { useTonalBuilderEngine } from '@/composables/useTonalBuilderEngine';
  import { useTonalBuilderColors } from '@/composables/useTonalBuilderColors';
  import { useClipboardActions } from '@/composables/useClipboardActions';
  import { useTonalScaleStore } from '@/stores/tonalScale';
  import { hexToRgb } from '@/utils/color';
  import type { TonalStripExport } from '@/utils/tonal/export';
  import type { TonalStep } from '@/utils/tonal/scale';
  import type { PairingSelection } from '@/components/tonal-builder/types';

  const { t } = useI18n();

  const pageTitle = computed(() => t('tonal_builder.meta.title'));
  const pageDescription = computed(() => t('tonal_builder.meta.description'));

  const { baseHex, blendHex, sliderMode, updateBase, updateBlend, setSliderMode } =
    useTonalBuilderColors();

  const tonalScale = useTonalScaleStore();
  const { blendDistribution, extendedStrip, fullStrip, keyStrip, scale } = storeToRefs(tonalScale);

  const {
    blendMode,
    controlDefinitions,
    controls,
    controlErrors,
    hasErrors,
    setBlendMode,
    updateControl,
  } = useTonalBuilderControls();
  const { copyScaleSvg, copyText, toast, clearToast } = useClipboardActions();

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
  const baseLuminanceIndex = computed(() => scale.value.luminance);

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

  const blendModeModel = computed({
    get: () => blendMode.value,
    set: (value: (typeof blendMode)['value']) => setBlendMode(value),
  });

  const sliderControls = computed(() =>
    controlDefinitions.map((control) => ({
      ...control,
      label: t(control.labelKey),
      value: controls[control.id] ?? control.defaultValue,
    })),
  );

  const previewSelection = ref<PairingSelection>(null);
  const contextMenuState = reactive({
    open: false,
    x: 0,
    y: 0,
    selection: null as PairingSelection | null,
  });

  const blendOverlayActive = ref(false);
  const overlayAnnouncement = ref('');

  const activateBlendOverlay = () => {
    blendOverlayActive.value = true;
    overlayAnnouncement.value = t('tonal_builder.scales.blend_overlay_active');
  };

  const handlePairingChange = (payload: PairingSelection) => {
    previewSelection.value = payload;
  };

  const previewCards = computed(() => {
    const base = previewSelection.value?.base ?? null;

    const pair = (background: TonalStep | null, text: TonalStep | null) => ({
      background,
      text,
    });

    return {
      darker45: pair(previewSelection.value?.darker45 ?? null, base),
      darker3: pair(previewSelection.value?.darker3 ?? null, base),
      lighter3: pair(base, previewSelection.value?.lighter3 ?? null),
      lighter45: pair(base, previewSelection.value?.lighter45 ?? null),
    };
  });

  const onControlInput = (
    id: BlendControlId,
    value: number | string,
    shouldActivateOverlay = false,
  ) => {
    updateControl(id, value);
    if (shouldActivateOverlay && ['middle', 'spread'].includes(id)) {
      activateBlendOverlay();
    }
  };

  const onBlendControlPointerDown = (id: BlendControlId) => {
    if (['middle', 'spread'].includes(id)) {
      activateBlendOverlay();
    }
  };

  const deactivateBlendOverlay = () => {
    if (!blendOverlayActive.value) return;
    blendOverlayActive.value = false;
    overlayAnnouncement.value = t('tonal_builder.scales.blend_overlay_inactive');
  };

  useEventListener(window, ['pointerup', 'pointercancel', 'touchend'], deactivateBlendOverlay);

  const visibleStrips = computed<TonalStripExport[]>(() => [
    { id: 'full', tones: fullStrip.value },
    { id: 'extended', tones: extendedStrip.value },
    { id: 'key', tones: keyStrip.value },
  ]);

  const clipboardMessages = computed(() => ({
    success: t('tonal_builder.actions.copied_message'),
    error: t('tonal_builder.clipboard.copy_error'),
    missing: t('tonal_builder.clipboard.missing_selection'),
    unsupported: t('tonal_builder.clipboard.unsupported'),
  }));

  const svgMessages = computed(() => ({
    success: t('tonal_builder.clipboard.svg_copied'),
    error: t('tonal_builder.clipboard.copy_error'),
    unsupported: t('tonal_builder.clipboard.unsupported'),
  }));

  const latestSelection = computed(() => contextMenuState.selection ?? previewSelection.value);

  const contextMenuActions = computed(() => {
    const selection = latestSelection.value;

    if (!selection) return [] as const;

    return [
      {
        key: 'darker45',
        label: t('tonal_builder.clipboard.options.darker_aaa'),
        tone: selection.darker45,
      },
      {
        key: 'darker3',
        label: t('tonal_builder.clipboard.options.darker_aa'),
        tone: selection.darker3,
      },
      { key: 'base', label: t('tonal_builder.clipboard.options.color'), tone: selection.base },
      {
        key: 'lighter3',
        label: t('tonal_builder.clipboard.options.lighter_aa'),
        tone: selection.lighter3,
      },
      {
        key: 'lighter45',
        label: t('tonal_builder.clipboard.options.lighter_aaa'),
        tone: selection.lighter45,
      },
    ];
  });

  const aaCandidate = computed(() => {
    const selection = latestSelection.value;
    if (!selection) return null;
    return selection.lighter3 ?? selection.darker3 ?? null;
  });

  const aaaCandidate = computed(() => {
    const selection = latestSelection.value;
    if (!selection) return null;
    return selection.lighter45 ?? selection.darker45 ?? null;
  });

  const handleContextMenuRequest = ({
    event,
    target,
    selection,
  }: {
    event: MouseEvent | KeyboardEvent;
    target: HTMLElement | null;
    selection: PairingSelection;
  }) => {
    const origin = (() => {
      if (event instanceof MouseEvent) {
        return { x: event.clientX + window.scrollX, y: event.clientY + window.scrollY };
      }

      const rect = target?.getBoundingClientRect();
      if (!rect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })();

    contextMenuState.open = true;
    contextMenuState.selection = selection;
    contextMenuState.x = origin.x;
    contextMenuState.y = origin.y;
  };

  const closeContextMenu = () => {
    contextMenuState.open = false;
  };

  useEventListener(window, 'keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Escape') {
      closeContextMenu();
    }
  });

  const copyTone = async (tone: TonalStep | null) => {
    await copyText(tone?.hex ?? '', clipboardMessages.value);
  };

  const handleMenuAction = async (tone: TonalStep | null) => {
    await copyTone(tone);
    closeContextMenu();
  };

  useEventListener(window, 'click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-cy="context-menu"]')) {
      closeContextMenu();
    }
  });

  const copySvg = async () => {
    await copyScaleSvg(
      visibleStrips.value,
      {
        url: typeof window !== 'undefined' ? window.location.href : '',
        exportJson: tonalScale.exportState(),
      },
      svgMessages.value,
    );
  };

  const copyPair = async (pair: TonalStep | null) => copyTone(pair);

  useTonalBuilderEngine(
    {
      colors: { baseHex, blendHex },
      controls: { blendMode, controls, hasErrors },
    },
    {
      onUpdate: (payload) => {
        const blendChannels = hexToRgb(payload.blendHex);

        tonalScale.importState({
          colorHex: payload.baseHex,
          blendMode: payload.blendMode,
          blendStrength: payload.strength,
          blendR: blendChannels.r,
          blendG: blendChannels.g,
          blendB: blendChannels.b,
          middle: payload.middle,
          spread: payload.spread,
          satDarker: payload.satDarker,
          satLighter: payload.satLighter,
        });
      },
    },
  );

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
            @click="copySvg"
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
              <MoonIcon class="moon h-5 w-5" />
              <SunIcon class="sun h-5 w-5" />
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
        <p
          class="sr-only"
          role="status"
          aria-live="polite"
        >
          {{ overlayAnnouncement }}
        </p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-100">
              {{ t('tonal_builder.scales.full') }}
            </span>
            <span class="text-xs text-slate-500">{{ t('tonal_builder.scales.full_helper') }}</span>
          </div>
          <TonalStrip
            id="color-scale-container-full"
            :tones="fullStrip"
            :base-index="baseLuminanceIndex"
            class="min-h-[96px]"
            :blend-graph-active="blendOverlayActive"
            :blend-graph-data="blendDistribution"
            :show-blend-dist-graph="true"
            data-cy="scale-strip-full"
            @pairing-change="handlePairingChange"
            @context-request="handleContextMenuRequest"
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
          <TonalStrip
            id="color-scale-container-custom"
            :tones="extendedStrip"
            :base-index="baseLuminanceIndex"
            class="min-h-[72px]"
            data-cy="scale-strip-extended"
            @pairing-change="handlePairingChange"
            @context-request="handleContextMenuRequest"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-100">
              {{ t('tonal_builder.scales.key') }}
            </span>
            <span class="text-xs text-slate-500">{{ t('tonal_builder.scales.key_helper') }}</span>
          </div>
          <TonalStrip
            id="color-scale-container-key"
            :tones="keyStrip"
            :base-index="baseLuminanceIndex"
            class="min-h-[72px]"
            data-cy="scale-strip-key"
            @pairing-change="handlePairingChange"
            @context-request="handleContextMenuRequest"
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
          v-model="blendModeModel"
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
          class="flex items-center gap-2 text-sm font-semibold text-slate-100"
          for="blendColorPickerInput"
        >
          <span class="h-3 w-3 rounded-full bg-accent-soft" />
          {{ t('tonal_builder.controls.labels.blend_color') }}
        </label>
        <div class="flex flex-1 flex-wrap items-center gap-2 sm:col-span-2">
          <div
            id="blendColorPickerInput"
            class="flex h-11 items-center gap-3 rounded-xl border border-dashed border-accent-soft/40 bg-surface/70 px-3"
            data-cy="blend-color-input"
          >
            <span
              class="h-8 w-8 rounded-xl border border-white/10"
              :style="blendSwatchStyle"
              role="img"
              :aria-label="t('tonal_builder.pickers.blend.title')"
            />
            <span class="text-xs font-semibold text-slate-200">{{ blendHex }}</span>
          </div>
          <div
            id="blendColorPicker"
            class="flex h-11 flex-1 items-center justify-between rounded-xl border border-dashed border-accent-soft/40 bg-surface/70 px-3"
            data-cy="blend-color-picker"
          >
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-300">
              {{ t('tonal_builder.controls.labels.blend_mode') }}
            </span>
            <span class="text-xs font-semibold text-accent-soft">{{ blendModeModel }}</span>
          </div>
        </div>

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
            :value="control.value"
            type="range"
            :min="control.range.min"
            :max="control.range.max"
            :step="control.range.step"
            class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-accent"
            :aria-label="control.label"
            :data-cy="`${control.id}-slider`"
            @pointerdown="onBlendControlPointerDown(control.id)"
            @pointerup="deactivateBlendOverlay"
            @pointercancel="deactivateBlendOverlay"
            @blur="deactivateBlendOverlay"
            @input="onControlInput(control.id, ($event.target as HTMLInputElement).value, true)"
            @change="onControlInput(control.id, ($event.target as HTMLInputElement).value)"
          />
          <input
            :id="control.number.id"
            :value="control.value"
            type="number"
            :min="control.number.min"
            :max="control.number.max"
            :step="control.number.step"
            class="h-11 w-full rounded-xl border border-white/10 bg-surface px-3 text-sm text-slate-100 shadow-inner"
            :aria-label="control.label"
            :data-cy="`${control.id}-value`"
            @input="onControlInput(control.id, ($event.target as HTMLInputElement).value)"
            @change="onControlInput(control.id, ($event.target as HTMLInputElement).value)"
            @blur="deactivateBlendOverlay"
          />
          <p
            v-if="controlErrors[control.id]"
            class="text-xs text-rose-300 sm:col-start-2 sm:col-span-2"
            role="alert"
          >
            {{
              t(
                (controlErrors[control.id] as ControlError).key,
                (controlErrors[control.id] as ControlError).values ?? {},
              )
            }}
          </p>
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

      <div class="grid gap-3 sm:grid-cols-2">
        <ContrastPreviewCard
          id="colorcard-darker45"
          :title-key="'tonal_builder.accessibility.cards.darker_45'"
          ratio-label="4.5:1"
          :background="previewCards.darker45.background"
          :text="previewCards.darker45.text"
        />

        <ContrastPreviewCard
          id="colorcard-darker3"
          :title-key="'tonal_builder.accessibility.cards.darker_3'"
          ratio-label="3:1"
          :background="previewCards.darker3.background"
          :text="previewCards.darker3.text"
        />

        <ContrastPreviewCard
          id="colorcard-lighter3"
          :title-key="'tonal_builder.accessibility.cards.lighter_3'"
          ratio-label="3:1"
          :background="previewCards.lighter3.background"
          :text="previewCards.lighter3.text"
        />

        <ContrastPreviewCard
          id="colorcard-lighter45"
          :title-key="'tonal_builder.accessibility.cards.lighter_45'"
          ratio-label="4.5:1"
          :background="previewCards.lighter45.background"
          :text="previewCards.lighter45.text"
        />
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
          <div
            class="mt-3 space-y-3 rounded-xl border border-white/10 bg-surface/60 p-4 text-sm text-slate-200"
          >
            <p class="text-xs text-slate-400">
              {{ t('tonal_builder.clipboard.context_helper') }}
            </p>
            <div class="grid gap-2 sm:grid-cols-2">
              <button
                v-for="action in contextMenuActions"
                :key="action.key"
                type="button"
                class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-accent/60 hover:bg-accent/10 disabled:opacity-40"
                :disabled="!action.tone"
                @click="handleMenuAction(action.tone ?? null)"
              >
                <span class="text-xs font-semibold">{{ action.label }}</span>
                <span
                  v-if="action.tone"
                  class="text-[11px] font-mono text-slate-300"
                >
                  {{ action.tone.hex }}
                </span>
                <span
                  v-else
                  class="text-[11px] text-slate-500"
                >
                  {{ t('tonal_builder.clipboard.unavailable') }}
                </span>
              </button>
            </div>
            <p
              v-if="!contextMenuActions.length"
              class="text-[11px] text-slate-500"
            >
              {{ t('tonal_builder.clipboard.missing_selection') }}
            </p>
            <p class="text-[11px] text-slate-500">
              {{ t('tonal_builder.clipboard.shortcut_helper') }}
            </p>
          </div>
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
          <div class="mt-3 space-y-3 rounded-xl border border-white/10 bg-surface/60 p-4">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 shadow-inner transition hover:border-accent/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                data-cy="copy-hovered-color"
                @click="copyTone(latestSelection?.base ?? null)"
              >
                {{ t('tonal_builder.clipboard.copy_color') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 shadow-inner transition hover:border-accent/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                data-cy="copy-aa-pair"
                @click="copyPair(aaCandidate)"
              >
                {{ t('tonal_builder.clipboard.copy_aa_pair') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 shadow-inner transition hover:border-accent/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                data-cy="copy-aaa-pair"
                @click="copyPair(aaaCandidate)"
              >
                {{ t('tonal_builder.clipboard.copy_aaa_pair') }}
              </button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent-strong shadow-inner transition hover:bg-accent/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                data-cy="copy-svg"
                @click="copySvg"
              >
                {{ t('tonal_builder.actions.copy_svg') }}
              </button>
              <span class="text-[11px] text-slate-400">
                {{ t('tonal_builder.clipboard.svg_helper') }}
              </span>
            </div>
            <p class="text-xs text-slate-400">
              <span class="font-semibold text-slate-200">{{
                latestSelection?.base?.hex ?? '—'
              }}</span>
              <span class="ml-2 text-slate-500">{{
                t('tonal_builder.clipboard.selection_helper')
              }}</span>
            </p>
          </div>
        </div>
        <div
          class="card-surface relative overflow-visible border-dashed border-white/15 bg-surface-soft/80"
          data-cy="toast-area-placeholder"
        >
          <p class="text-sm font-semibold text-slate-100">
            {{ t('tonal_builder.modals.toast_area') }}
          </p>
          <p class="text-sm text-slate-400">{{ t('tonal_builder.modals.toast_helper') }}</p>
          <div class="mt-3 space-y-2 rounded-xl border border-white/10 bg-surface/60 p-4">
            <p class="text-xs text-slate-400">
              {{ t('tonal_builder.clipboard.feedback_helper') }}
            </p>
            <div
              class="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
              :class="[
                toast?.variant === 'error'
                  ? 'border-rose-400/50 bg-rose-500/10 text-rose-100'
                  : 'border-accent/50 bg-accent/10 text-accent-soft',
              ]"
            >
              <span class="inline-flex h-2 w-2 rounded-full bg-current" />
              <span>{{ toast?.message ?? t('tonal_builder.clipboard.no_feedback') }}</span>
              <button
                v-if="toast"
                type="button"
                class="ml-auto text-[11px] text-slate-200 underline"
                @click="clearToast"
              >
                {{ t('tonal_builder.clipboard.dismiss') }}
              </button>
            </div>
          </div>
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
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="toast"
            id="copied-message"
            class="fixed left-1/2 top-6 z-40 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold shadow-card"
            :class="
              toast.variant === 'error' ? 'bg-rose-300 text-rose-900' : 'bg-accent text-slate-900'
            "
            role="status"
            aria-live="polite"
            data-cy="copied-message"
          >
            {{ toast.message }}
          </div>
        </Transition>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="contextMenuState.open"
          class="fixed inset-0 z-50"
          @click="closeContextMenu"
        >
          <div
            class="absolute min-w-[240px] max-w-xs space-y-2 rounded-xl border border-white/15 bg-surface-soft/95 p-3 text-sm text-slate-100 shadow-card"
            :style="{ top: `${contextMenuState.y}px`, left: `${contextMenuState.x}px` }"
            role="menu"
            aria-label="Context menu"
            data-cy="context-menu"
            @click.stop
          >
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {{ t('tonal_builder.clipboard.menu_title') }}
            </p>
            <button
              v-for="action in contextMenuActions"
              :key="action.key"
              type="button"
              class="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left transition hover:border-accent/60 hover:bg-accent/10 disabled:opacity-40"
              :disabled="!action.tone"
              role="menuitem"
              @click="handleMenuAction(action.tone ?? null)"
            >
              <span class="text-xs font-semibold">{{ action.label }}</span>
              <span
                v-if="action.tone"
                class="text-[11px] font-mono text-slate-300"
              >
                #{{ action.tone.index }} — {{ action.tone.hex }}
              </span>
              <span
                v-else
                class="text-[11px] text-slate-500"
              >
                {{ t('tonal_builder.clipboard.unavailable') }}
              </span>
            </button>
            <p class="text-[11px] text-slate-500">
              {{ t('tonal_builder.clipboard.context_helper') }}
            </p>
          </div>
        </div>
      </Teleport>
    </section>
  </main>
</template>
