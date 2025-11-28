<script setup lang="ts">
  import iro from '@jaames/iro';
  import { useEventListener, useResizeObserver } from '@vueuse/core';
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

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

  const cardRef = ref<HTMLElement | null>(null);
  const boxRef = ref<HTMLDivElement | null>(null);
  const hsvRef = ref<HTMLDivElement | null>(null);
  const rgbRef = ref<HTMLDivElement | null>(null);

  let boxPicker: iro.ColorPicker | null = null;
  let hsvPicker: iro.ColorPicker | null = null;
  let rgbPicker: iro.ColorPicker | null = null;

  const swatchStyle = computed(() => ({ backgroundColor: hexInput.value }));

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

  const createPicker = (target: HTMLElement | null, layout: PickerLayout) => {
    if (!target) return null;

    const picker = iro.ColorPicker(target, {
      color: hexInput.value,
      layout,
      borderWidth: 1,
      borderColor: '#0f172a',
      handleRadius: 8,
      layoutDirection: 'vertical',
    });

    picker.on('input:change', handlePickerInput);
    return picker;
  };

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

  const setMode = (value: SliderMode) => {
    mode.value = value;
    emit('update:sliderMode', value);
    nextTick(resizePickers);
  };

  useResizeObserver(cardRef, resizePickers);
  useEventListener(window, 'resize', resizePickers);

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
    class="space-y-4 rounded-3xl border border-dashed border-accent-soft/40 bg-surface-soft/80 p-4 shadow-card"
    :aria-label="label"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p
          class="text-sm font-semibold text-slate-100"
          data-cy="picker-title"
        >
          {{ label }}
        </p>
        <p
          v-if="description"
          class="text-xs text-slate-400"
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

    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div class="space-y-3">
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-400"
          :for="`${id}-hex-input`"
        >
          Hex
        </label>
        <div class="flex flex-wrap items-center gap-3">
          <span
            class="h-12 w-12 rounded-2xl border border-white/10 shadow-inner"
            :style="swatchStyle"
            data-cy="color-swatch"
            role="img"
            :aria-label="`${label} swatch`"
          />
          <div class="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <input
              :id="`${id}-hex-input`"
              v-model="hexInput"
              type="text"
              class="h-12 flex-1 rounded-xl border border-white/10 bg-surface px-3 text-sm text-slate-100 shadow-inner"
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
              class="text-xs font-semibold text-rose-300"
              data-cy="hex-error"
            >
              {{ hexError }}
            </span>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-2xl border border-white/10 bg-surface/70"
          data-cy="color-box"
        >
          <div
            ref="boxRef"
            class="h-72"
          />
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {{ t('tonal_builder.pickers.slider_modes') }}
          </p>
          <div
            class="inline-flex items-center gap-2 rounded-full bg-surface/70 p-1 text-xs font-semibold text-slate-200"
          >
            <button
              type="button"
              class="rounded-full px-3 py-1 transition"
              :class="
                mode === 'hsv'
                  ? 'bg-accent-strong/30 text-slate-900 shadow-glow'
                  : 'hover:bg-white/5'
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
                  ? 'bg-accent-strong/30 text-slate-900 shadow-glow'
                  : 'hover:bg-white/5'
              "
              data-cy="mode-rgb"
              @click="setMode('rgb')"
            >
              RGB
            </button>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-surface/70 p-3 shadow-inner">
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
  </section>
</template>
