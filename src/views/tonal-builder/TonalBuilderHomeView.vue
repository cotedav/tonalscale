<script setup lang="ts">
  import { useEventListener, useTitle } from '@vueuse/core';
  import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { storeToRefs } from 'pinia';

  import ColorPickerCard from '@/components/tonal-builder/ColorPickerCard.vue';
  import BaseSwitch from '@/components/common/BaseSwitch.vue';
  import ContrastPreviewCard from '@/components/tonal-builder/ContrastPreviewCard.vue';
  import MaterialSurfacePreview from '@/components/tonal-builder/MaterialSurfacePreview.vue';
  import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
  import ThemeToggle from '@/components/common/ThemeToggle.vue';
  import {
    type BlendControlId,
    type ControlError,
    useTonalBuilderControls,
  } from '@/composables/useTonalBuilderControls';
  import {
    type TonalEnginePayload,
    useTonalBuilderEngine,
  } from '@/composables/useTonalBuilderEngine';
  import { useTonalBuilderColors } from '@/composables/useTonalBuilderColors';
  import { useTonalScaleStore } from '@/stores/tonalScale';
  import { hexToRgb } from '@/utils/color';
  import type { TonalStep } from '@/utils/tonal/scale';
  import { useClipboard } from '@/composables/useClipboard';
  import { useTonalExport } from '@/composables/useTonalExport';
  import useTonalUrlSync from '@/composables/useTonalUrlSync';
  import TheImportExportModal from '@/components/tonal-builder/TheImportExportModal.vue';
  import type { PairingSelection } from '@/components/tonal-builder/types';

  const { t } = useI18n();
  const isImportModalOpen = ref(false);
  const isBlendEnabled = ref(true);
  const workspaceRef = ref<HTMLElement | null>(null);
  const controlsPanelWidth = ref(500);
  const isResizingControls = ref(false);

  const controlsPanelStyle = computed(() => ({
    '--controls-panel-width': `${controlsPanelWidth.value}px`,
  }));

  const stopControlsResize = () => {
    isResizingControls.value = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const resizeControlsPanel = (event: PointerEvent) => {
    if (!isResizingControls.value || !workspaceRef.value) return;

    const bounds = workspaceRef.value.getBoundingClientRect();
    const minimumPreviewWidth = 420;
    const minimumControlsWidth = 360;
    const maximumControlsWidth = Math.max(minimumControlsWidth, bounds.width - minimumPreviewWidth);
    controlsPanelWidth.value = Math.min(
      maximumControlsWidth,
      Math.max(minimumControlsWidth, bounds.right - event.clientX),
    );
  };

  const startControlsResize = (event: PointerEvent) => {
    if (window.matchMedia?.('(max-width: 1023px)').matches) return;

    event.preventDefault();
    isResizingControls.value = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleControlsResizeKeydown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 50 : 20;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      controlsPanelWidth.value = Math.min(900, controlsPanelWidth.value + step);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      controlsPanelWidth.value = Math.max(360, controlsPanelWidth.value - step);
    }
  };

  useEventListener(window, 'pointermove', resizeControlsPanel);
  useEventListener(window, 'pointerup', stopControlsResize);
  useEventListener(window, 'pointercancel', stopControlsResize);
  onBeforeUnmount(stopControlsResize);

  const pageTitle = computed(() => t('tonal_builder.meta.title'));
  const pageDescription = computed(() => t('tonal_builder.meta.description'));

  const tonalScale = useTonalScaleStore();
  useTonalUrlSync(tonalScale);
  const { blendDistribution, extendedStrip, fullStrip, keyStrip, scale } = storeToRefs(tonalScale);

  const { baseHex, blendHex, sliderMode, updateBase, updateBlend, setSliderMode } =
    useTonalBuilderColors();
  updateBase(tonalScale.baseHex);
  updateBlend(tonalScale.blendHex);

  const {
    blendMode,
    controlDefinitions,
    controls,
    controlErrors,
    hasErrors,
    setBlendMode,
    updateControl,
  } = useTonalBuilderControls(tonalScale.blendMode);

  Object.entries(tonalScale.controls).forEach(([id, value]) => {
    updateControl(id as BlendControlId, value);
  });

  let isApplyingLocalState = false;

  watch(
    () => ({
      baseHex: tonalScale.baseHex,
      blendHex: tonalScale.blendHex,
      blendMode: tonalScale.blendMode,
      controls: { ...tonalScale.controls },
    }),
    (storeState) => {
      if (isApplyingLocalState) return;

      updateBase(storeState.baseHex);
      updateBlend(storeState.blendHex);
      setBlendMode(storeState.blendMode);
      Object.entries(storeState.controls).forEach(([id, value]) => {
        updateControl(id as BlendControlId, value);
      });
      isBlendEnabled.value = storeState.controls.strength > 0;
    },
    { deep: true, flush: 'sync' },
  );

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
  const selectedPreview = ref<PairingSelection>(null);
  const fullStripRef = ref<InstanceType<typeof TonalStrip> | null>(null);
  const extendedStripRef = ref<InstanceType<typeof TonalStrip> | null>(null);
  const keyStripRef = ref<InstanceType<typeof TonalStrip> | null>(null);

  const blendOverlayActive = ref(false);
  const overlayAnnouncement = ref('');

  const activateBlendOverlay = () => {
    blendOverlayActive.value = true;
    overlayAnnouncement.value = t('tonal_builder.scales.blend_overlay_active');
  };

  const handlePairingChange = (payload: PairingSelection) => {
    previewSelection.value = payload ?? selectedPreview.value;
  };

  const handlePairingSelect = (payload: PairingSelection) => {
    selectedPreview.value = payload;
    previewSelection.value = payload;
  };

  const handleSwatchesPanelClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-cy="tonal-swatch"]')) return;

    fullStripRef.value?.clearSelection();
    extendedStripRef.value?.clearSelection();
    keyStripRef.value?.clearSelection();
    selectedPreview.value = null;
    previewSelection.value = null;
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

  const applyTonalPayload = (payload: TonalEnginePayload) => {
    const blendChannels = hexToRgb(payload.blendHex);

    isApplyingLocalState = true;
    try {
      tonalScale.importState({
        colorHex: payload.baseHex,
        blendMode: payload.blendMode,
        blendStrength: isBlendEnabled.value ? payload.strength : 0,
        blendR: blendChannels.r,
        blendG: blendChannels.g,
        blendB: blendChannels.b,
        middle: payload.middle,
        spread: payload.spread,
        satDarker: payload.satDarker,
        satLighter: payload.satLighter,
      });
    } finally {
      isApplyingLocalState = false;
    }
  };

  const tonalEngine = useTonalBuilderEngine(
    {
      colors: { baseHex, blendHex },
      controls: { blendMode, controls, hasErrors },
    },
    {
      onUpdate: applyTonalPayload,
    },
  );

  watch(isBlendEnabled, () => {
    if (tonalEngine.lastPayload.value) {
      applyTonalPayload(tonalEngine.lastPayload.value);
    }
  });

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

  // Export & Clipboard

  const { copyToClipboard } = useClipboard();
  const { generateScaleSvg } = useTonalExport();

  const handleCopySvg = async () => {
    // Generate SVG from all 3 strips
    const svg = generateScaleSvg({
      params: tonalScale.scaleParams,
      fullStrip: fullStrip.value,
      extendedStrip: extendedStrip.value,
      keyStrip: keyStrip.value,
    });

    await copyToClipboard(svg, 'SVG');
  };
</script>

<template>
  <main
    class="flex h-screen flex-col overflow-hidden bg-surface"
    aria-labelledby="tonal-builder-heading"
    data-cy="tonal-builder-home"
  >
    <TheImportExportModal
      :is-open="isImportModalOpen"
      @close="isImportModalOpen = false"
    />
    <h1
      id="tonal-builder-heading"
      class="sr-only"
      data-cy="tonal-builder-title"
    >
      {{ pageTitle }}
    </h1>

    <header
      id="toolbar"
      class="flex h-[72px] shrink-0 items-center justify-end border-b border-dim bg-surface-soft px-4 sm:px-8"
      :aria-label="t('tonal_builder.actions.toolbar_label')"
    >
      <div
        class="flex flex-wrap items-center justify-end gap-3"
        :aria-label="t('tonal_builder.actions.actions_label')"
      >
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-none bg-accent-strong/15 px-5 text-sm font-semibold text-primary ring-1 ring-inset ring-accent-strong/20 transition hover:bg-accent-strong/25"
          data-cy="tonal-builder-import"
          @click="isImportModalOpen = true"
        >
          {{ t('tonal_builder.actions.import') }}
        </button>
        <button
          id="copy-button"
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-none bg-accent-strong/15 px-5 text-sm font-semibold text-primary ring-1 ring-inset ring-accent-strong/20 transition hover:bg-accent-strong/25"
          data-cy="tonal-builder-copy"
          @click="handleCopySvg"
        >
          {{ t('tonal_builder.actions.export') }}
        </button>

        <ThemeToggle
          id="theme-toggle"
          class="!h-11 !w-auto !rounded-none !bg-accent-strong/15 !px-5 !text-primary ring-1 ring-inset ring-accent-strong/20 hover:!bg-accent-strong/25"
          data-cy="tonal-builder-theme-toggle"
        />
      </div>
    </header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div
        ref="workspaceRef"
        class="builder-workspace grid min-h-0 flex-1"
        :style="controlsPanelStyle"
        data-cy="builder-workspace"
      >
        <div
          class="min-h-0 overflow-y-auto bg-surface-soft px-4 py-6 sm:px-8 lg:px-10"
          :aria-label="t('tonal_builder.scales.title')"
          data-cy="swatches-panel"
          @click="handleSwatchesPanelClick"
        >
          <section
            class="space-y-4"
            :aria-label="t('tonal_builder.scales.title')"
          >
            <p class="sr-only">{{ t('tonal_builder.scales.description') }}</p>
            <p
              class="sr-only"
              role="status"
              aria-live="polite"
            >
              {{ overlayAnnouncement }}
            </p>

            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-primary">
                    {{ t('tonal_builder.scales.full') }}
                  </span>
                  <span class="text-xs text-secondary">{{
                    t('tonal_builder.scales.full_helper')
                  }}</span>
                </div>
                <TonalStrip
                  id="color-scale-container-full"
                  ref="fullStripRef"
                  :tones="fullStrip"
                  :base-index="baseLuminanceIndex"
                  class="min-h-[96px]"
                  :blend-graph-active="blendOverlayActive"
                  :blend-graph-data="blendDistribution"
                  :show-blend-dist-graph="true"
                  data-cy="scale-strip-full"
                  @pairing-change="handlePairingChange"
                  @pairing-select="handlePairingSelect"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-primary">
                    {{ t('tonal_builder.scales.extended') }}
                  </span>
                  <span class="text-xs text-secondary">{{
                    t('tonal_builder.scales.extended_helper')
                  }}</span>
                </div>
                <TonalStrip
                  id="color-scale-container-custom"
                  ref="extendedStripRef"
                  :tones="extendedStrip"
                  :base-index="baseLuminanceIndex"
                  class="min-h-[72px]"
                  data-cy="scale-strip-extended"
                  @pairing-change="handlePairingChange"
                  @pairing-select="handlePairingSelect"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-primary">
                    {{ t('tonal_builder.scales.key') }}
                  </span>
                  <span class="text-xs text-secondary">{{
                    t('tonal_builder.scales.key_helper')
                  }}</span>
                </div>
                <TonalStrip
                  id="color-scale-container-key"
                  ref="keyStripRef"
                  :tones="keyStrip"
                  :base-index="baseLuminanceIndex"
                  class="min-h-[72px]"
                  data-cy="scale-strip-key"
                  @pairing-change="handlePairingChange"
                  @pairing-select="handlePairingSelect"
                />
              </div>
            </div>

            <MaterialSurfacePreview
              class="pt-4"
              :tones="fullStrip"
            />
          </section>
        </div>

        <div
          class="builder-resize-handle"
          :class="{ 'builder-resize-handle-active': isResizingControls }"
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          :aria-label="t('tonal_builder.regions.resize_controls')"
          :aria-valuenow="controlsPanelWidth"
          aria-valuemin="360"
          data-cy="controls-resize-handle"
          @pointerdown="startControlsResize"
          @keydown="handleControlsResizeKeydown"
        >
          <span aria-hidden="true" />
        </div>

        <div
          class="min-h-0 overflow-y-auto bg-surface px-4 py-6 sm:px-8 lg:px-10"
          :aria-label="t('tonal_builder.regions.pickers_label')"
          data-cy="color-controls-panel"
        >
          <span
            id="baseColorPickerInput"
            class="sr-only"
          >
            {{ baseHex }}
          </span>

          <section
            class="space-y-5"
            :aria-label="t('tonal_builder.actions.toolbar_label')"
          >
            <ColorPickerCard
              id="baseColorPicker"
              v-model="baseHexModel"
              v-model:slider-mode="sliderModeModel"
              :label="t('tonal_builder.pickers.base.title')"
              :description="t('tonal_builder.pickers.base.description')"
              :swatch-label="t('tonal_builder.pickers.base.badge')"
              data-cy="base-color-picker"
            />
          </section>

          <section
            class="mt-10 space-y-3"
            :aria-label="t('tonal_builder.controls.title')"
          >
            <div
              id="gradient-controls"
              class="grid grid-cols-1 items-center gap-3 rounded-none border border-dim bg-surface-soft/80 p-4 sm:grid-cols-[auto_minmax(0,1fr)_88px]"
              data-cy="gradient-controls"
            >
              <div class="flex flex-wrap items-center justify-between gap-3 sm:col-span-3">
                <p class="text-sm font-semibold text-primary">
                  {{ t('tonal_builder.controls.title') }}
                </p>
                <BaseSwitch
                  id="blend-enabled"
                  v-model="isBlendEnabled"
                  :label="t('tonal_builder.controls.labels.blend_enabled')"
                  data-cy="blend-enabled-toggle"
                >
                  {{ t('tonal_builder.controls.labels.blend_enabled') }}
                </BaseSwitch>
              </div>

              <ColorPickerCard
                id="blendColorPicker"
                v-model="blendHexModel"
                v-model:slider-mode="sliderModeModel"
                class="sm:col-span-3"
                :label="t('tonal_builder.pickers.blend.title')"
                :description="t('tonal_builder.pickers.blend.description')"
                :swatch-label="t('tonal_builder.pickers.blend.badge')"
                data-cy="blend-color-picker"
              />

              <label
                class="text-sm font-semibold text-primary"
                for="blendmode"
              >
                {{ t('tonal_builder.controls.labels.blend_mode') }}
              </label>
              <select
                id="blendmode"
                v-model="blendModeModel"
                name="blendmode"
                class="h-11 w-full rounded-xl border border-dim bg-surface px-3 text-sm text-primary shadow-inner"
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

              <span
                id="blendColorPickerInput"
                class="sr-only"
              >
                {{ blendHex }}
              </span>

              <template
                v-for="control in sliderControls"
                :key="control.id"
              >
                <label
                  :for="control.range.id"
                  class="text-sm font-semibold text-primary"
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
                  @input="
                    onControlInput(control.id, ($event.target as HTMLInputElement).value, true)
                  "
                  @change="onControlInput(control.id, ($event.target as HTMLInputElement).value)"
                />
                <input
                  :id="control.number.id"
                  :value="control.value"
                  type="number"
                  :min="control.number.min"
                  :max="control.number.max"
                  :step="control.number.step"
                  class="h-11 w-full rounded-xl border border-dim bg-surface px-3 text-sm text-primary shadow-inner"
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
        </div>
      </div>

      <section
        class="shrink-0 border-t border-dim bg-surface-soft px-4 py-4 sm:px-8 lg:px-10"
        :aria-label="t('tonal_builder.accessibility.title')"
        data-cy="accessibility-dock"
      >
        <div class="grid grid-cols-4 gap-4 overflow-hidden">
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
    </div>
  </main>
</template>

<style scoped>
  .builder-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .builder-resize-handle {
    display: none;
  }

  @media (width >= 1024px) {
    .builder-workspace {
      grid-template-columns: minmax(0, 1fr) 9px var(--controls-panel-width);
    }

    .builder-resize-handle {
      position: relative;
      z-index: 10;
      display: grid;
      cursor: col-resize;
      place-items: center;
      background: rgb(var(--color-border-dim));
      touch-action: none;
    }

    .builder-resize-handle::before {
      position: absolute;
      inset: 0 -4px;
      content: '';
    }

    .builder-resize-handle > span {
      width: 2px;
      height: 42px;
      border-radius: 999px;
      background: rgb(var(--color-text-tertiary));
      opacity: 0.65;
      transition:
        height 140ms ease,
        background-color 140ms ease,
        opacity 140ms ease;
    }

    .builder-resize-handle-active > span,
    .builder-resize-handle:hover > span,
    .builder-resize-handle:focus-visible > span {
      height: 64px;
      background: rgb(var(--color-accent));
      opacity: 1;
    }

    .builder-resize-handle:focus-visible {
      outline: 2px solid rgb(var(--color-accent));
      outline-offset: -2px;
    }
  }
</style>
