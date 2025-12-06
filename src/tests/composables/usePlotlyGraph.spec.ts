import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick, defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { usePlotlyGraph, type PlotSpec } from '@/composables/usePlotlyGraph';
import Plotly from 'plotly.js-dist-min';

// Mock Plotly
vi.mock('plotly.js-dist-min', () => ({
  default: {
    react: vi.fn(),
    purge: vi.fn(),
  },
}));

describe('usePlotlyGraph', () => {
  let spec: PlotSpec;

  beforeEach(() => {
    spec = {
      traces: [{ x: [1, 2], y: [1, 2] }],
      layout: { title: 'Test' },
      config: { responsive: true },
    };
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createWrapper = (initialSpec: PlotSpec | null, debounceMs = 0) => {
    return mount(
      defineComponent({
        setup() {
          const plotRef = ref<HTMLDivElement | null>(null);
          const specRef = ref(initialSpec);

          usePlotlyGraph({ plotRef, spec: specRef, debounceMs });

          return { plotRef, specRef };
        },
        template: '<div ref="plotRef"></div>',
      }),
    );
  };

  it('renders graph when mounted with spec', async () => {
    const wrapper = createWrapper(spec);
    await nextTick(); // Wait for mount and render

    expect(Plotly.react).toHaveBeenCalledWith(
      wrapper.element,
      spec.traces,
      spec.layout,
      spec.config,
    );
  });

  it('purges graph when spec becomes null', async () => {
    const wrapper = createWrapper(spec);
    await nextTick();

    wrapper.vm.specRef = null;
    await nextTick();
    await vi.runAllTimersAsync();

    expect(Plotly.purge).toHaveBeenCalledWith(wrapper.element);
  });

  it('debounces rendering', async () => {
    const wrapper = createWrapper(spec, 100);
    await nextTick();

    // Initial render might happen immediately on mount depending on implementation,
    // but the watcher should debounce updates.
    // However, the current implementation calls render() in onMounted WITHOUT debounce.
    expect(Plotly.react).toHaveBeenCalledTimes(1);

    // Update spec
    wrapper.vm.specRef = { ...spec, layout: { title: 'Updated' } };
    await nextTick();

    // Should not have rendered yet due to debounce
    expect(Plotly.react).toHaveBeenCalledTimes(1);

    // Advance time
    vi.advanceTimersByTime(100);
    await nextTick();

    expect(Plotly.react).toHaveBeenCalledTimes(2);
  });

  it('purges on unmount', () => {
    const wrapper = createWrapper(spec);
    wrapper.unmount();
    expect(Plotly.purge).toHaveBeenCalledWith(wrapper.element);
  });
});
