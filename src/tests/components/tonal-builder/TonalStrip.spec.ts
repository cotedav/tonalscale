import { mount } from '@vue/test-utils';

import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
import type { ToneMetadata } from '@/stores/tonalScale';
import type { TonalStep } from '@/utils/tonal/scale';

const buildMetadata = (tones: TonalStep[]): ToneMetadata[] => [
  {
    tone: tones[0],
    darker3: null,
    darker45: null,
    lighter3: { index: 50, hex: tones[1].hex, ratio: 3.2 },
    lighter45: { index: 100, hex: tones[2].hex, ratio: 4.8 },
  },
  {
    tone: tones[1],
    darker3: { index: 0, hex: tones[0].hex, ratio: 3.2 },
    darker45: null,
    lighter3: { index: 100, hex: tones[2].hex, ratio: 3.6 },
    lighter45: { index: 100, hex: tones[2].hex, ratio: 4.8 },
  },
  {
    tone: tones[2],
    darker3: { index: 50, hex: tones[1].hex, ratio: 3.6 },
    darker45: { index: 0, hex: tones[0].hex, ratio: 4.8 },
    lighter3: null,
    lighter45: null,
  },
];

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
        metadata: buildMetadata(tones),
      },
    });

    const swatches = wrapper.findAll('[data-cy="tonal-swatch"]');
    expect(swatches).toHaveLength(3);
    expect(swatches[0].text()).toContain('0');
    expect(swatches[1].text()).toContain('#4b5563');
  });

  it('marks the base luminance and shows contextual metadata', () => {
    const wrapper = mount(TonalStrip, {
      props: {
        tones,
        baseIndex: 50,
        metadata: buildMetadata(tones),
      },
    });

    expect(wrapper.findAll('[data-cy="base-marker"]').length).toBe(1);

    const metadataCard = wrapper.get('[data-cy="tone-metadata"]');
    expect(metadataCard.text()).toContain('4.5:1');
    expect(metadataCard.text()).toContain('#e5e7eb');
  });
});
