<script setup lang="ts">
  import iro from '@jaames/iro';
  import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue';
  import { onClickOutside, useEventListener, useResizeObserver } from '@vueuse/core';
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { isDark } from '@/composables/useTheme';
  import type { SliderMode } from '@/composables/useTonalBuilderColors';
  import {
    hexToHsv,
    hexToRgb,
    isValidHex,
    normalizeHex,
    type HsvColor,
    type RgbColor,
  } from '@/utils/color';

  type PickerChangePayload = {
    hex: string;
    rgb: RgbColor;
    hsv: HsvColor;
  };

  const props = defineProps<{
    id: string;
    label: string;
    description?: string;
    modelValue: string;
    sliderMode?: SliderMode;
    swatchLabel?: string;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [string];
    'update:sliderMode': [SliderMode];
    'color-change': [PickerChangePayload];
    'invalid-hex': [string];
  }>();

  const { t } = useI18n();

  const hexInput = ref(normalizeHex(props.modelValue));
  const mode = ref<SliderMode>(props.sliderMode ?? 'hsv');
  const hexError = ref('');
  const isControlsOpen = ref(false);

  const cardRef = ref<HTMLElement | null>(null);
  const swatchButtonRef = ref<HTMLButtonElement | null>(null);
  const floatingRef = ref<HTMLElement | null>(null);
  const boxRef = ref<HTMLDivElement | null>(null);
  const hsvRef = ref<HTMLDivElement | null>(null);
  const rgbRef = ref<HTMLDivElement | null>(null);

  let boxPicker: iro.ColorPicker | null = null;
  let hsvPicker: iro.ColorPicker | null = null;
  let rgbPicker: iro.ColorPicker | null = null;

  const swatchStyle = computed(() => ({ backgroundColor: hexInput.value }));
  const { floatingStyles } = useFloating(swatchButtonRef, floatingRef, {
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });

  const emitColorChange = (hex: string, color?: { rgb?: RgbColor; hsv?: HsvColor }) => {
    emit('color-change', {
      hex,
      rgb: color?.rgb ?? hexToRgb(hex),
      hsv: color?.hsv ?? hexToHsv(hex),
    });
  };

  const syncPickers = (hex: string) => {
    [boxPicker, hsvPicker, rgbPicker].forEach((picker) => picker?.color.set(hex));
  };

  const updateHexFromInput = () => {
    const normalized = normalizeHex(hexInput.value);
    if (!isValidHex(normalized)) {
      hexError.value = t('tonal_builder.pickers.invalid_hex');
      emit('invalid-hex', hexInput.value);
      return;
    }

    hexError.value = '';
    hexInput.value = normalized;
    syncPickers(normalized);
    emit('update:modelValue', normalized);
    emitColorChange(normalized);
  };

  const handlePickerInput = (color: iro.Color) => {
    const normalized = normalizeHex(color.hexString);
    hexError.value = '';
    hexInput.value = normalized;
    emit('update:modelValue', normalized);
    emitColorChange(normalized);
  };

  type PickerLayout = Array<{ component: unknown; options?: Record<string, unknown> }>;

  // We need to react to theme changes to update the picker border
  const pickerBorderColor = computed(() => {
    // Return semantic colors:
    // Dark: Slate 700 (#334155) - matches border-highlight in dark mode approx
    // Light: Slate 200 (#e2e8f0) - matches border-dim in light mode
    return isDark.value ? '#334155' : '#e2e8f0';
  });

  const createPicker = (target: HTMLElement | null, layout: PickerLayout) => {
    if (!target) return null;

    const picker = iro.ColorPicker(target, {
      color: hexInput.value,
      layout,
      borderWidth: 1,
      borderColor: pickerBorderColor.value,
      handleRadius: 8,
      layoutDirection: 'vertical',
    });

    picker.on('input:change', handlePickerInput);
    return picker;
  };

  const updatePickerOptions = () => {
    const color = pickerBorderColor.value;
    [boxPicker, hsvPicker, rgbPicker].forEach((picker) => {
      picker?.setOptions({ borderColor: color });
    });
  };

  watch(isDark, updatePickerOptions);

  const resizePickers = () => {
    requestAnimationFrame(() => {
      if (boxRef.value && boxPicker) {
        boxPicker.resize(boxRef.value.clientWidth);
      }
      if (hsvRef.value && hsvPicker) {
        hsvPicker.resize(hsvRef.value.clientWidth);
      }
      if (rgbRef.value && rgbPicker) {
        rgbPicker.resize(rgbRef.value.clientWidth);
      }
    });
  };

  const closeControls = () => {
    isControlsOpen.value = false;
  };

  const toggleControls = () => {
    isControlsOpen.value = !isControlsOpen.value;
    if (isControlsOpen.value) {
      nextTick(resizePickers);
    }
  };

  const setMode = (value: SliderMode) => {
    mode.value = value;
    emit('update:sliderMode', value);
    nextTick(resizePickers);
  };

  useResizeObserver(cardRef, resizePickers);
  useResizeObserver(floatingRef, resizePickers);
  useEventListener(window, 'resize', resizePickers);
  useEventListener(document, 'keydown', (event) => {
    if (event.key === 'Escape') {
      closeControls();
      swatchButtonRef.value?.focus();
    }
  });
  onClickOutside(floatingRef, closeControls, { ignore: [swatchButtonRef] });

  watch(
    () => props.modelValue,
    (value) => {
      const normalized = normalizeHex(value);
      hexInput.value = normalized;
      syncPickers(normalized);
    },
  );

  watch(
    () => props.sliderMode,
    (value) => {
      if (value) {
        mode.value = value;
        nextTick(resizePickers);
      }
    },
  );

  onMounted(() => {
    boxPicker = createPicker(boxRef.value, [{ component: iro.ui.Box }]);
    hsvPicker = createPicker(hsvRef.value, [
      { component: iro.ui.Slider, options: { sliderType: 'hue' } },
      { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
      { component: iro.ui.Slider, options: { sliderType: 'value' } },
    ]);
    rgbPicker = createPicker(rgbRef.value, [
      { component: iro.ui.Slider, options: { sliderType: 'red' } },
      { component: iro.ui.Slider, options: { sliderType: 'green' } },
      { component: iro.ui.Slider, options: { sliderType: 'blue' } },
    ]);

    resizePickers();
  });

  onBeforeUnmount(() => {
    boxPicker?.off('input:change', handlePickerInput);
    hsvPicker?.off('input:change', handlePickerInput);
    rgbPicker?.off('input:change', handlePickerInput);
  });
</script>

<template>
  <section
    :id="id"
    ref="cardRef"
    class="space-y-4 rounded-lg border border-dashed border-accent-soft/40 bg-surface-soft/80 p-4 shadow-card"
    :aria-label="label"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p
          class="text-sm font-semibold text-primary"
          data-cy="picker-title"
        >
          {{ label }}
        </p>
        <p
          v-if="description"
          class="text-xs text-tertiary"
        >
          {{ description }}
        </p>
      </div>
      <span
        v-if="swatchLabel"
        class="rounded-full bg-accent-strong/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-strong"
      >
        {{ swatchLabel }}
      </span>
    </div>

    <div class="space-y-2">
      <label
        class="text-xs font-semibold uppercase tracking-wide text-tertiary"
        :for="`${id}-hex-input`"
      >
        Hex
      </label>
      <div class="flex items-start gap-3">
        <button
          ref="swatchButtonRef"
          type="button"
          class="h-12 w-12 shrink-0 rounded-lg border border-dim shadow-inner transition hover:ring-2 hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :style="swatchStyle"
          :aria-label="
            t(
              isControlsOpen
                ? 'tonal_builder.pickers.close_controls'
                : 'tonal_builder.pickers.open_controls',
              { label },
            )
          "
          :aria-expanded="isControlsOpen"
          :aria-controls="`${id}-controls`"
          data-cy="color-swatch"
          @click="toggleControls"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <input
            :id="`${id}-hex-input`"
            v-model="hexInput"
            type="text"
            class="h-12 w-full rounded-lg border border-dim bg-surface px-3 text-sm text-primary shadow-inner"
            maxlength="7"
            spellcheck="false"
            inputmode="text"
            :aria-invalid="!!hexError"
            data-cy="hex-input"
            @input="updateHexFromInput"
            @blur="updateHexFromInput"
            @keyup.enter="updateHexFromInput"
          />
          <span
            v-if="hexError"
            class="text-xs font-semibold text-rose-500 dark:text-rose-300"
            data-cy="hex-error"
          >
            {{ hexError }}
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        :id="`${id}-controls`"
        v-show="isControlsOpen"
        ref="floatingRef"
        class="color-picker-popover"
        :style="floatingStyles"
        data-cy="color-picker-controls"
      >
        <div class="grid gap-4 md:grid-cols-[minmax(280px,1fr)_260px] md:items-start">
          <div
            class="overflow-hidden rounded-lg border border-dim bg-surface"
            data-cy="color-box"
          >
            <div
              ref="boxRef"
              class="h-72"
            />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-semibold uppercase tracking-wide text-tertiary">
                {{ t('tonal_builder.pickers.slider_modes') }}
              </p>
              <div
                class="inline-flex items-center gap-2 rounded-full bg-surface-soft p-1 text-xs font-semibold text-secondary"
              >
                <button
                  type="button"
                  class="rounded-full px-3 py-1 transition"
                  :class="
                    mode === 'hsv'
                      ? 'bg-accent-strong/30 text-primary shadow-glow'
                      : 'hover:bg-glass/5'
                  "
                  data-cy="mode-hsv"
                  @click="setMode('hsv')"
                >
                  HSV
                </button>
                <button
                  type="button"
                  class="rounded-full px-3 py-1 transition"
                  :class="
                    mode === 'rgb'
                      ? 'bg-accent-strong/30 text-primary shadow-glow'
                      : 'hover:bg-glass/5'
                  "
                  data-cy="mode-rgb"
                  @click="setMode('rgb')"
                >
                  RGB
                </button>
              </div>
            </div>

            <div class="rounded-lg border border-dim bg-surface p-3 shadow-inner">
              <div
                v-show="mode === 'hsv'"
                ref="hsvRef"
                class="space-y-3"
                data-cy="slider-hsv"
              />
              <div
                v-show="mode === 'rgb'"
                ref="rgbRef"
                class="space-y-3"
                data-cy="slider-rgb"
              />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
  .color-picker-popover {
    z-index: 80;
    width: min(620px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow: auto;
    border: 1px solid rgb(var(--color-border-highlight));
    border-radius: 8px;
    padding: 14px;
    background: rgb(var(--color-surface-strong));
    box-shadow: 0 18px 48px rgb(0 0 0 / 28%);
  }
</style>
```
