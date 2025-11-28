import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
import type { TonalSwatch } from '@/composables/useTonalBuilderStrips';

const buildSwatches = (): TonalSwatch[] => [
  { index: 0, hex: '#000000', isBase: false },
  { index: 50, hex: '#7c3aed', isBase: true },
  { index: 100, hex: '#ffffff', isBase: false },
];

describe('TonalStrip', () => {
  it('renders swatch index, hex, and base marker', () => {
    const wrapper = mount(TonalStrip, {
      props: {
        swatches: buildSwatches(),
        baseIndex: 50,
      },
    });

    expect(wrapper.findAll('[role="listitem"]').length).toBe(3);
    expect(wrapper.text()).toContain('#7c3aed');
    expect(wrapper.find('[data-cy="base-marker"]').exists()).toBe(true);
  });

  it('shows an empty state when no swatches are provided', () => {
    const wrapper = mount(TonalStrip, {
      props: {
        swatches: [],
        baseIndex: 50,
      },
    });

    expect(wrapper.text()).toContain('No tonal data');
  });
});
