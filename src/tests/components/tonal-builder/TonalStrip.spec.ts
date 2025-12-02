import { mount } from '@vue/test-utils';

import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
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
});
