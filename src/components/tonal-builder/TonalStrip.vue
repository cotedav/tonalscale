<script setup lang="ts">
  import { computed } from 'vue';

  import type { TonalStep } from '@/utils/tonal/scale';

  const props = defineProps<{ tones: TonalStep[]; baseIndex: number }>();

  const swatches = computed(() =>
    props.tones.map((tone) => ({
      tone,
      isBase: tone.index === props.baseIndex,
    })),
  );
</script>

<template>
  <div
    class="color-scale-container"
    data-cy="tonal-strip"
  >
    <div
      v-for="swatch in swatches"
      :key="swatch.tone.index"
      class="color-box"
      :style="{ backgroundColor: swatch.tone.hex }"
      data-cy="tonal-swatch"
      :data-index="swatch.tone.index"
      role="listitem"
      tabindex="0"
    >
      <span class="color-number">{{ swatch.tone.index }}</span>
      <span class="color-hex">{{ swatch.tone.hex }}</span>
      <div
        v-if="swatch.isBase"
        class="color-dot"
        data-cy="base-marker"
      />
    </div>
  </div>
</template>

<style scoped>
  .color-scale-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    position: relative;
    margin-bottom: 16px;
  }

  #color-scale-container-custom,
  #color-scale-container-key {
    flex-wrap: nowrap;
  }

  .color-box {
    width: calc(100% / 101);
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
  .color-box:focus-visible {
    transform: scale(1.3);
    z-index: 2;
  }

  #color-scale-container-custom .color-box,
  #color-scale-container-key .color-box {
    width: 100%;
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

  @media (width <= 1100px) {
    #color-scale-container-full .color-box {
      width: calc(100% / 51);
    }
  }

  @media (width <= 600px) {
    #color-scale-container-full .color-box {
      width: calc(100% / 26);
    }
  }

  @media (width <= 400px) {
    #color-scale-container-full .color-box {
      width: calc(100% / 21);
    }
  }

  @media (width <= 300px) {
    #color-scale-container-full .color-box {
      width: calc(100% / 21);
    }
  }
</style>
