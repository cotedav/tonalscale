<script setup lang="ts">
  import { computed, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { clamp } from '@/utils/collection';
  import { getContrastRatio } from '@/utils/tonal/contrast';
  import type { TonalStep } from '@/utils/tonal/scale';
  import type { PairingSelection } from './types';

  type ContrastDirection = 'lighter' | 'darker';

  type ContrastMatch = {
    tone: TonalStep;
    ratio: number;
  };

  const props = defineProps<{ tones: TonalStep[]; baseIndex: number }>();

  const emit = defineEmits<{ 'pairing-change': [PairingSelection] }>();

  const { t } = useI18n();

  const state = reactive({
    activeIndex: null as number | null,
    offset: 0,
  });

  const swatches = computed(() =>
    props.tones.map((tone, indexOnStrip) => ({
      tone,
      isBase: tone.index === props.baseIndex,
      indexOnStrip,
    })),
  );

  const isFullStrip = computed(() => props.tones.length >= 101);
  const wrapMode = computed(() => (isFullStrip.value ? 'wrap' : 'nowrap'));
  const swatchWidth = computed(() => {
    if (isFullStrip.value) return 'calc(100% / 101)';

    const count = props.tones.length || 1;
    return `calc(100% / ${count})`;
  });

  const findMatches = (direction: ContrastDirection, ratio: number): ContrastMatch[] => {
    if (state.activeIndex === null) return [];

    const matches: ContrastMatch[] = [];
    const increment = direction === 'lighter' ? 1 : -1;
    const baseTone = props.tones[state.activeIndex];

    for (
      let cursor = state.activeIndex + increment;
      cursor >= 0 && cursor < props.tones.length;
      cursor += increment
    ) {
      const candidate = props.tones[cursor];
      const ratioValue = getContrastRatio(baseTone.hex, candidate.hex);

      if (ratioValue >= ratio) {
        matches.push({ tone: candidate, ratio: ratioValue });
      }
    }

    return matches;
  };

  const matchBuckets = computed(() => {
    if (state.activeIndex === null) return null;

    return {
      darker3: findMatches('darker', 3),
      darker45: findMatches('darker', 4.5),
      lighter3: findMatches('lighter', 3),
      lighter45: findMatches('lighter', 4.5),
    };
  });

  const maxOffset = computed(() => {
    const lengths = Object.values(matchBuckets.value ?? {}).map((bucket) =>
      Math.max(0, bucket.length - 1),
    );

    return lengths.length ? Math.max(...lengths) : 0;
  });

  const resolveWithOffset = (matches: ContrastMatch[]): ContrastMatch | null => {
    if (!matches.length) return null;
    const targetIndex = clamp(state.offset, 0, matches.length - 1);
    return matches[targetIndex];
  };

  const resolvedMatches = computed(() => {
    if (!matchBuckets.value || state.activeIndex === null) return null;

    return {
      darker3: resolveWithOffset(matchBuckets.value.darker3),
      darker45: resolveWithOffset(matchBuckets.value.darker45),
      lighter3: resolveWithOffset(matchBuckets.value.lighter3),
      lighter45: resolveWithOffset(matchBuckets.value.lighter45),
    };
  });

  const helperDots = computed(() => {
    const dots = new Map<
      number,
      Array<{ type: keyof NonNullable<typeof resolvedMatches.value> }>
    >();
    const selection = resolvedMatches.value;

    if (!selection) return dots;

    const addDot = (
      match: ContrastMatch | null,
      type: keyof NonNullable<typeof resolvedMatches.value>,
    ) => {
      if (!match) return;
      const list = dots.get(match.tone.index) ?? [];
      list.push({ type });
      dots.set(match.tone.index, list);
    };

    addDot(selection.darker45, 'darker45');
    addDot(selection.darker3, 'darker3');
    addDot(selection.lighter3, 'lighter3');
    addDot(selection.lighter45, 'lighter45');

    return dots;
  });

  const emitSelection = () => {
    if (state.activeIndex === null) {
      emit('pairing-change', null);
      return;
    }

    const selection = resolvedMatches.value;
    if (!selection) {
      emit('pairing-change', null);
      return;
    }

    emit('pairing-change', {
      base: props.tones[state.activeIndex],
      darker3: selection.darker3?.tone ?? null,
      darker45: selection.darker45?.tone ?? null,
      lighter3: selection.lighter3?.tone ?? null,
      lighter45: selection.lighter45?.tone ?? null,
    });
  };

  const setActiveIndex = (index: number) => {
    state.activeIndex = index;
    state.offset = 0;
  };

  const clearActive = () => {
    state.activeIndex = null;
    state.offset = 0;
    emit('pairing-change', null);
  };

  const adjustOffset = (delta: number) => {
    const next = clamp(state.offset + delta, 0, maxOffset.value);
    if (next === state.offset) return;
    state.offset = next;
  };

  const handleWheel = (event: WheelEvent) => {
    if (state.activeIndex === null) return;
    event.preventDefault();
    const step = event.shiftKey ? 2 : 1;
    const delta = Math.sign(event.deltaY) * step;
    adjustOffset(delta);
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key)) return;

    event.preventDefault();
    const delta = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
    adjustOffset(delta);
  };

  const handleBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as HTMLElement | null;
    const currentTarget = event.currentTarget as HTMLElement | null;
    const container = currentTarget?.parentElement;

    if (!next || !container || !container.contains(next)) {
      clearActive();
    }
  };

  watch(matchBuckets, () => {
    if (state.offset > maxOffset.value) {
      state.offset = maxOffset.value;
    }
  });

  watch([resolvedMatches, () => state.activeIndex, () => state.offset], emitSelection);

  const swatchLabel = (index: number, hex: string) =>
    t('tonal_builder.scales.metadata.swatch_label', { index, hex });
</script>

<template>
  <div
    class="color-scale-container"
    data-cy="tonal-strip"
    role="list"
    :data-full="isFullStrip"
    :style="{
      '--swatch-width': swatchWidth,
      '--wrap-mode': wrapMode,
    }"
  >
    <div
      v-for="swatch in swatches"
      :key="swatch.tone.index"
      class="color-box"
      :style="{ backgroundColor: swatch.tone.hex }"
      data-cy="tonal-swatch"
      :data-index="swatch.tone.index"
      :data-active="state.activeIndex === swatch.indexOnStrip"
      role="listitem"
      tabindex="0"
      :aria-label="swatchLabel(swatch.tone.index, swatch.tone.hex)"
      @mouseenter="setActiveIndex(swatch.indexOnStrip)"
      @focus="setActiveIndex(swatch.indexOnStrip)"
      @blur="handleBlur"
      @mouseleave="clearActive"
      @wheel="handleWheel"
      @keydown="handleKeydown"
    >
      <span class="color-number">{{ swatch.tone.index }}</span>
      <span class="color-hex">{{ swatch.tone.hex }}</span>
      <div
        v-if="swatch.isBase"
        class="color-dot"
        data-cy="base-marker"
      />
      <div
        v-for="helper in helperDots.get(swatch.tone.index) ?? []"
        :key="`${swatch.tone.index}-${helper.type}`"
        class="color-dot contrast-dot"
        :data-kind="helper.type.includes('darker') ? 'background' : 'text'"
        :data-level="helper.type.includes('45') ? 'aaa' : 'aa'"
        data-cy="contrast-helper-dot"
      />
    </div>
  </div>
</template>

<style scoped>
  .color-scale-container {
    display: flex;
    flex-wrap: var(--wrap-mode, wrap);
    justify-content: flex-start;
    position: relative;
    margin-bottom: 16px;
  }

  .color-box {
    width: var(--swatch-width, calc(100% / 101));
    height: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-top: 16px;
    transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    z-index: 1;
    flex-shrink: 0;
    border-radius: 4px;
    cursor: pointer;
    overflow: visible;
  }

  .color-box:hover,
  .color-box:focus-visible,
  .color-box[data-active='true'] {
    transform: scale(1.3);
    z-index: 2;
  }

  .color-scale-container:not([data-full='true']) .color-box {
    flex-shrink: unset;
  }

  .color-box span {
    position: absolute;
    width: 100%;
    text-align: center;
    font-family: 'Roboto Mono', monospace;
    text-transform: uppercase;
    pointer-events: none;
  }

  .color-box .color-number {
    top: -10px;
    font-size: 8px;
  }

  .color-box .color-hex {
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    background-color: rgb(0 0 0 / 80%);
    color: rgb(255 255 255);
    font-size: 11px;
    padding: 5px;
    border-radius: 5px;
    opacity: 0;
    transition:
      opacity 0.15s cubic-bezier(0.19, 1, 0.22, 1),
      bottom 0.15s cubic-bezier(0.19, 1, 0.22, 1);
    z-index: 999;
  }

  .color-box:hover .color-hex,
  .color-box:focus-visible .color-hex {
    opacity: 1;
    bottom: -30px;
  }

  .color-box .color-dot {
    width: 3px;
    height: 3px;
    background: white;
    outline: 2px solid rgb(0 0 0 / 25%);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .color-box .contrast-dot {
    width: 5px;
    height: 5px;
    outline: 1px solid rgb(0 0 0 / 25%);
    z-index: 100;
  }

  .color-box .contrast-dot[data-kind='background'] {
    background: rgb(255 255 255 / 50%);
  }

  .color-box .contrast-dot[data-kind='text'] {
    background: rgb(0 0 0 / 50%);
    outline: 1px solid rgb(255 255 255 / 25%);
  }

  .color-box .contrast-dot[data-level='aaa'] {
    transform: translate(-50%, -50%);
  }

  .color-box .contrast-dot[data-level='aa'] {
    transform: translate(-50%, -50%);
  }

  @media (width <= 1100px) {
    .color-scale-container[data-full='true'] .color-box {
      width: calc(100% / 51);
    }
  }

  @media (width <= 600px) {
    .color-scale-container[data-full='true'] .color-box {
      width: calc(100% / 26);
    }
  }

  @media (width <= 400px) {
    .color-scale-container[data-full='true'] .color-box {
      width: calc(100% / 21);
    }
  }

  @media (width <= 300px) {
    .color-scale-container[data-full='true'] .color-box {
      width: calc(100% / 21);
    }
  }
</style>
