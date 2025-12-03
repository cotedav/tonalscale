import { mount } from '@vue/test-utils';

import ContrastPreviewCard from '@/components/tonal-builder/ContrastPreviewCard.vue';

describe('ContrastPreviewCard', () => {
  it('formats calculated contrast ratios for display', () => {
    const wrapper = mount(ContrastPreviewCard, {
      props: {
        id: 'preview-card',
        titleKey: 'tonal_builder.accessibility.cards.darker_45',
        ratioLabel: '4.5:1',
        background: { index: 0, hex: '#000000' },
        text: { index: 100, hex: '#ffffff' },
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.find('h1').text()).toBe('21:1');
  });

  it('falls back to provided ratio label when no pair is selected', () => {
    const wrapper = mount(ContrastPreviewCard, {
      props: {
        id: 'preview-card-unset',
        titleKey: 'tonal_builder.accessibility.cards.darker_45',
        ratioLabel: '4.5:1',
        background: null,
        text: null,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    const card = wrapper.get('[data-cy="contrast-preview-card"]');
    expect(wrapper.find('h1').text()).toBe('4.5:1');
    expect(card.attributes('style')).toContain('opacity: 0.2');
  });
});
