import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
// eslint-disable-next-line import/no-unresolved
import Plotly, { type Config, type Layout, type PlotData } from 'plotly.js-dist-min';

export type PlotSpec = {
  traces: Partial<PlotData>[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
};

interface UsePlotlyGraphOptions {
  plotRef: Ref<HTMLDivElement | null>;
  spec: Ref<PlotSpec | null | undefined>;
  debounceMs?: number;
}

export function usePlotlyGraph({ plotRef, spec, debounceMs = 60 }: UsePlotlyGraphOptions) {
  const pendingRender = ref<ReturnType<typeof setTimeout> | null>(null);

  const purge = () => {
    const plotElement = plotRef.value;
    if (!plotElement) return;

    Plotly.purge(plotElement);
    plotElement.innerHTML = '';
  };

  const render = () => {
    const currentSpec = spec.value;
    const plotElement = plotRef.value;
    if (!plotElement || !currentSpec) {
      purge();
      return;
    }

    Plotly.react(plotElement, currentSpec.traces, currentSpec.layout, currentSpec.config);
  };

  const scheduleRender = () => {
    if (pendingRender.value) {
      clearTimeout(pendingRender.value);
    }

    pendingRender.value = setTimeout(render, debounceMs);
  };

  watch(
    spec,
    () => {
      if (!spec.value) {
        purge();
        return;
      }
      scheduleRender();
    },
    { deep: true },
  );

  onMounted(() => {
    if (spec.value) {
      render();
    }
  });

  onBeforeUnmount(() => {
    if (pendingRender.value) {
      clearTimeout(pendingRender.value);
    }
    purge();
  });

  return { render, scheduleRender, purge };
}
