<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { usePlotlyGraph, type PlotSpec } from '@/composables/usePlotlyGraph';
  import type { BlendDistribution } from '@/stores/tonalScale';

  const props = defineProps<{ active: boolean; data: BlendDistribution | null }>();

  const plotRef = ref<HTMLDivElement | null>(null);

  const styles = computed(() => ({
    opacity: props.active && props.data ? 1 : 0,
    width: props.data ? `${Math.max(props.data.widthPercent, 0)}%` : '0%',
  }));

  const plotSpec = computed<PlotSpec | null>(() => {
    if (!props.active || !props.data) {
      return null;
    }

    return {
      traces: [
        {
          x: props.data.curve.x,
          y: props.data.curve.y,
          mode: 'lines',
          line: {
            color: props.data.lineColor,
            width: 2,
            dash: 'dot',
          },
          name: 'blend distribution',
        },
      ],
      layout: {
        showlegend: false,
        xaxis: {
          showgrid: false,
          zeroline: false,
          showline: false,
          showticklabels: false,
        },
        yaxis: {
          showgrid: false,
          zeroline: false,
          showline: false,
          showticklabels: false,
        },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0,
          pad: 0,
        },
        autosize: true,
      },
      config: {
        displayModeBar: false,
        staticPlot: true,
        responsive: true,
      },
    };
  });

  usePlotlyGraph({ plotRef, spec: plotSpec });
</script>

<template>
  <div
    class="blend-dist-graph pointer-events-none absolute inset-x-0 top-0 z-10 flex h-full items-start justify-start"
    data-cy="blend-distribution-overlay"
    aria-hidden="true"
  >
    <div class="relative h-full w-full">
      <div
        ref="plotRef"
        class="h-full"
        :style="styles"
      />
    </div>
  </div>
</template>

<style scoped>
  .blend-dist-graph {
    mix-blend-mode: screen;
    transition: opacity 120ms ease;
  }
</style>
