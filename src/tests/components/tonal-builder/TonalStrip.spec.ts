import { mount } from '@vue/test-utils';

import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
import type { BlendDistribution } from '@/stores/tonalScale';
import type { TonalStep } from '@/utils/tonal/scale';

describe('TonalStrip', () => {
  const tones: TonalStep[] = [
    { index: 0, hex: '#0f172a' },
    { index: 50, hex: '#4b5563' },
    { index: 100, hex: '#e5e7eb' },
  ];

  it('renders swatches with indices and hex values', () => {
    const wrapper = mount(TonalStrip, {
      props: {
        tones,
        baseIndex: 50,
      },
    });

    const swatches = wrapper.findAll('[data-cy="tonal-swatch"]');
    expect(swatches).toHaveLength(3);
    expect(swatches[0].find('.color-number').text()).toBe('0');
    expect(swatches[1].find('.color-hex').text()).toBe('#4b5563');
  });

  it('marks the base luminance and exposes popover hex labels', () => {
    const wrapper = mount(TonalStrip, {
      props: {
        tones,
        baseIndex: 50,
      },
    });

    expect(wrapper.findAll('[data-cy="base-marker"]').length).toBe(1);

    const hexPopovers = wrapper.findAll('.color-hex');
    expect(hexPopovers).toHaveLength(3);
    expect(hexPopovers[2].text()).toBe('#e5e7eb');
  });

  it('passes blend distribution overlays when enabled', () => {
    const graph: BlendDistribution = {
      curve: { x: [0, 1, 2], y: [0.1, 0.2, 0.3] },
      widthPercent: 50,
      lineColor: '#ffffff',
    };

    const wrapper = mount(TonalStrip, {
      props: {
        tones,
        baseIndex: 50,
        showBlendDistGraph: true,
        blendGraphActive: true,
        blendGraphData: graph,
      },
      global: {
        stubs: {
          BlendDistributionGraph: {
            template: '<div data-cy="blend-graph-stub" />',
          },
        },
      },
    });

    expect(wrapper.attributes('showblenddistgraph')).toBe('true');
    expect(wrapper.find('[data-cy="blend-graph-stub"]').exists()).toBe(true);
  });
});
