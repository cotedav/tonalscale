<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import { useMouseInElement } from '@vueuse/core';
  import { useI18n } from 'vue-i18n';

  import { useContextMenu } from '@/composables/useContextMenu';
  import { clamp } from '@/utils/collection';
  import type { BlendDistribution } from '@/stores/tonalScale';
  import { getContrastRatio } from '@/utils/tonal/contrast';
  import type { TonalStep } from '@/utils/tonal/scale';
  import BlendDistributionGraph from './BlendDistributionGraph.vue';
  import type { PairingSelection } from './types';

  type ContrastDirection = 'lighter' | 'darker';

  type ContrastMatch = {
    tone: TonalStep;
    ratio: number;
  };

  const props = defineProps<{
    tones: TonalStep[];
    baseIndex: number;
    showBlendDistGraph?: boolean;
    blendGraphActive?: boolean;
    blendGraphData?: BlendDistribution | null;
  }>();

  const emit = defineEmits<{ 'pairing-change': [PairingSelection] }>();

  const { t } = useI18n();
  const { open, isOpen: isMenuOpen, contextData } = useContextMenu();

  const containerRef = ref<HTMLElement | null>(null);
  const { isOutside } = useMouseInElement(containerRef);

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

  /*
   * Returns the closest tone index (to the active index) that satisfies the contrast ratio.
   * "closest" means the first match found when searching outwards from the base.
   */
  const findClosestMatch = (direction: ContrastDirection, ratio: number): ContrastMatch | null => {
    if (state.activeIndex === null) return null;

    const increment = direction === 'lighter' ? 1 : -1;
    const baseTone = props.tones[state.activeIndex];

    // Search outwards from active index
    for (
      let cursor = state.activeIndex + increment;
      cursor >= 0 && cursor < props.tones.length;
      cursor += increment
    ) {
      const candidate = props.tones[cursor];
      const ratioValue = getContrastRatio(baseTone.hex, candidate.hex);

      if (ratioValue >= ratio) {
        return { tone: candidate, ratio: ratioValue };
      }
    }

    return null;
  };

  const anchors = computed(() => {
    if (state.activeIndex === null) return null;

    return {
      darker3: findClosestMatch('darker', 3),
      darker45: findClosestMatch('darker', 4.5),
      lighter3: findClosestMatch('lighter', 3),
      lighter45: findClosestMatch('lighter', 4.5),
    };
  });

  // Helper to safely get tone at index
  const getToneAtIndex = (index: number): ContrastMatch | null => {
    if (index < 0 || index >= props.tones.length) return null;
    const tone = props.tones[index];
    // Re-calculate ratio for this strictly spatial match
    if (state.activeIndex === null) return null;
    const baseTone = props.tones[state.activeIndex];
    const ratio = getContrastRatio(baseTone.hex, tone.hex);
    return { tone, ratio };
  };

  const resolvedMatches = computed(() => {
    if (!anchors.value || state.activeIndex === null) return null;
    const { darker3, darker45, lighter3, lighter45 } = anchors.value;

    // For darker matches, increasing offset moves AWAY from base (lower index)
    // For lighter matches, increasing offset moves AWAY from base (higher index)
    const resolve = (anchor: ContrastMatch | null, direction: ContrastDirection) => {
      if (!anchor) return null;
      // Index delta: if darker, we substract offset. If lighter, we add offset.
      // But we must also ensure we don't cross the base or go out of bounds.
      // Actually, wait. The offset is always positive in the UI (it's a magnitude).
      // Let's look at index.js: `closestIndex - offset` (darker) and `closestIndex + offset` (lighter).
      // And offset is a positive integer derived from scroll.

      const sign = direction === 'lighter' ? 1 : -1;
      const targetIndex = props.tones.indexOf(anchor.tone) + sign * state.offset;

      // Now clamp to bounds.
      // Darker must be < activeIndex and >= 0
      // Lighter must be > activeIndex and < tones.length
      if (direction === 'darker') {
        // Clamp between 0 and activeIndex - 1
        const clampedIndex = clamp(targetIndex, 0, state.activeIndex! - 1);
        return getToneAtIndex(clampedIndex);
      }
      // Clamp between activeIndex + 1 and length - 1
      const clampedIndex = clamp(targetIndex, state.activeIndex! + 1, props.tones.length - 1);
      return getToneAtIndex(clampedIndex);
    };

    return {
      darker3: resolve(darker3, 'darker'),
      darker45: resolve(darker45, 'darker'),
      lighter3: resolve(lighter3, 'lighter'),
      lighter45: resolve(lighter45, 'lighter'),
    };
  });

  // Calculate limits for the offset
  const offsetLimits = computed(() => {
    if (state.activeIndex === null || !anchors.value) return { min: 0, max: 0 };

    const { darker3, darker45, lighter3, lighter45 } = anchors.value;
    const baseIndex = state.activeIndex;
    const totalTones = props.tones.length;

    // We need to find the most restrictive limits that still allow movement.
    // Actually, we want the most permissive limits that stay within bounds?
    // No, "offset" is global. If we set offset to -10, ALL markers shift by -10.
    // We must ensure that correctly shifting BY -10 keeps ALL active markers in bounds?
    // Or do we stop them individually?
    // The previous `resolve` logic clamps individually.
    // So `state.offset` can technically go as far as we want, and markers just pile up at the edge.
    // BUT to prevent "dead scrolling" (scrolling where nothing moves), we should limit `state.offset`
    // to the range where AT LEAST ONE marker is still moving.
    //
    // For Min Offset (contraction towards base):
    // We can decrease offset until the "furthest" marker hits the base neighbor?
    // Or until the "closest" marker hits the base neighbor?
    // If we have markers at 40 and 20 (Base 50).
    // offset 0: 40, 20.
    // offset -5: 45, 25.
    // offset -9: 49, 29.
    // offset -10: 50 (CLASH), 30.
    // The previous clamping logic handles the clash.
    // So we can let offset go to -Infinity and they just stick.
    // But for UX, we probably want to stop scrolling when the *last* moving thing stops.
    // Or just pick a reasonable range.
    // Let's calculate the theoretical max range for each anchor.

    // Darker anchors (index < base):
    // Move towards base (negative offset): max move is (baseIndex - 1) - anchorIndex.
    // Move away (positive offset): max move is anchorIndex - 0.

    // Lighter anchors (index > base):
    // Move towards base (negative offset): max move is anchorIndex - (baseIndex + 1).
    // Move away (positive offset): max move is (length - 1) - anchorIndex.

    // We want the range [min, max] where min is negative.
    // Min limit is the negative of the maximum possible contraction.
    // Max limit is the maximum possible expansion.

    let maxContraction = 0; // Absolute value
    let maxExpansion = 0;

    const check = (anchorIndex: number, isDarker: boolean) => {
      if (isDarker) {
        // Anchor < Base
        // Contraction (move to Base-1): Distance = (baseIndex - 1) - anchorIndex
        maxContraction = Math.max(maxContraction, Math.max(0, baseIndex - 1 - anchorIndex));
        // Expansion (move to 0): Distance = anchorIndex
        // For darker, expansion (positive offset) moves to 0?
        // Wait, `target = anchor - offset`. Positive offset reduces index.
        // Yes. So max positive offset = anchorIndex.
        maxExpansion = Math.max(maxExpansion, anchorIndex);
      } else {
        // Anchor > Base
        // Contraction (move to Base+1): Distance = anchorIndex - (baseIndex + 1)
        maxContraction = Math.max(maxContraction, Math.max(0, anchorIndex - (baseIndex + 1)));
        // Expansion (move to End): Distance = (total - 1) - anchorIndex.
        // `target = anchor + offset`. Positive offset increases index.
        maxExpansion = Math.max(maxExpansion, totalTones - 1 - anchorIndex);
      }
    };

    if (darker3) check(props.tones.indexOf(darker3.tone), true);
    if (darker45) check(props.tones.indexOf(darker45.tone), true);
    if (lighter3) check(props.tones.indexOf(lighter3.tone), false);
    if (lighter45) check(props.tones.indexOf(lighter45.tone), false);

    return {
      min: -maxContraction,
      max: maxExpansion,
    };
  });

  const adjustOffset = (delta: number) => {
    // Current logic: state.offset
    // New logic: clamp between min and max
    const { min, max } = offsetLimits.value;
    const next = clamp(state.offset + delta, min, max);
    if (next === state.offset) return;
    state.offset = next;
  };

  const handleWheel = (event: WheelEvent) => {
    if (state.activeIndex === null) {
      console.error('DEBUG: handleWheel activeIndex is null');
      return;
    }
    event.preventDefault();
    const step = event.shiftKey ? 2 : 1;
    const delta = Math.sign(event.deltaY) * step;

    adjustOffset(delta);
  };

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
    // If context menu is open for THIS element, don't clear.
    if (
      isMenuOpen.value &&
      contextData.value?.token === 'tone' &&
      state.activeIndex !== null &&
      contextData.value.tone?.index === props.tones[state.activeIndex]?.index
    ) {
      return;
    }

    state.activeIndex = null;
    state.offset = 0;
    emit('pairing-change', null);
  };

  // If menu closes, and we are not hovering, clear active.
  watch(isMenuOpen, (newVal) => {
    if (!newVal && isOutside.value) {
      state.activeIndex = null;
      state.offset = 0;
      emit('pairing-change', null);
    }
  });

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

  watch(state, (newState) => {
    if (state.activeIndex === null) return;
    // Ensure offset stays within dynamic limits if context changes
    const { min, max } = offsetLimits.value;
    if (newState.offset < min) state.offset = min;
    if (newState.offset > max) state.offset = max;
  });

  watch([resolvedMatches, () => state.activeIndex, () => state.offset], emitSelection);

  const swatchLabel = (index: number, hex: string) =>
    t('tonal_builder.scales.metadata.swatch_label', { index, hex });

  const handleSwatchContextMenu = (event: MouseEvent, tone: TonalStep, indexOnStrip: number) => {
    // If we are strictly on a different tone, switch active index.
    // This resets the offset by definition of setActiveIndex().
    // But if we are on the SAME tone, we want to preserve the offset (user might have scrolled).
    if (state.activeIndex !== indexOnStrip) {
      setActiveIndex(indexOnStrip);
    }

    // We want to pass the current selection state (which accounts for offset).
    // We also want to update the menu if this selection changes while the menu is open (e.g. scrolling).

    nextTick(() => {
      const createMenuData = () => {
        const selection = resolvedMatches.value;
        return {
          token: 'tone' as const,
          tone,
          darker3: selection?.darker3
            ? { index: selection.darker3.tone.index, hex: selection.darker3.tone.hex }
            : null,
          darker45: selection?.darker45
            ? { index: selection.darker45.tone.index, hex: selection.darker45.tone.hex }
            : null,
          lighter3: selection?.lighter3
            ? { index: selection.lighter3.tone.index, hex: selection.lighter3.tone.hex }
            : null,
          lighter45: selection?.lighter45
            ? { index: selection.lighter45.tone.index, hex: selection.lighter45.tone.hex }
            : null,
          onScroll: handleWheel,
        };
      };

      open(event, createMenuData());
    });
  };

  // Watch for changes in resolvedMatches (e.g. via scroll) and update the menu if it's open for this context.
  watch(resolvedMatches, (newVal) => {
    // Access the singleton state directly to check if we should update.
    // We need to be careful not to create a tight coupling, but useContextMenu is global.
    // contextData is available from top-level scope.
    if (
      isMenuOpen.value &&
      contextData.value &&
      contextData.value.token === 'tone' &&
      state.activeIndex !== null &&
      // We can't easily check equal tones by reference, but index on strip matching activeIndex is a good proxy
      // assuming standard usage.
      contextData.value.tone?.index === props.tones[state.activeIndex].index
    ) {
      // Update the context data with new neighbor values in-place
      // We can't use 'open' as it resets position/isOpen state logic in the composable (toggle).
      // We must update the reactive state directly or have an 'update' method.
      // Since useContextMenu returns refs, we can write to contextData.value!

      const selection = newVal;
      contextData.value = {
        ...contextData.value,
        darker3: selection?.darker3
          ? { index: selection.darker3.tone.index, hex: selection.darker3.tone.hex }
          : null,
        darker45: selection?.darker45
          ? { index: selection.darker45.tone.index, hex: selection.darker45.tone.hex }
          : null,
        lighter3: selection?.lighter3
          ? { index: selection.lighter3.tone.index, hex: selection.lighter3.tone.hex }
          : null,
        lighter45: selection?.lighter45
          ? { index: selection.lighter45.tone.index, hex: selection.lighter45.tone.hex }
          : null,
      };
    }
  });
</script>

<template>
  <div
    ref="containerRef"
    class="color-scale-container"
    data-cy="tonal-strip"
    role="list"
    :data-full="isFullStrip"
    :showBlendDistGraph="props.showBlendDistGraph ? 'true' : undefined"
    :style="{
      '--swatch-width': swatchWidth,
      '--wrap-mode': wrapMode,
    }"
  >
    <BlendDistributionGraph
      v-if="props.showBlendDistGraph"
      :active="props.blendGraphActive ?? false"
      :data="props.blendGraphData ?? null"
    />
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
      @contextmenu.stop.prevent="handleSwatchContextMenu($event, swatch.tone, swatch.indexOnStrip)"
    >
      <span class="color-number text-tertiary">{{ swatch.tone.index }}</span>
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
    font-family:
      'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
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
