import { computed, defineComponent, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';

import ContrastPreviewCard from '@/components/tonal-builder/ContrastPreviewCard.vue';
import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
import type { PairingSelection } from '@/components/tonal-builder/types';
import { formatContrastRatio, getContrastRatio } from '@/utils/tonal/contrast';

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

    expect(wrapper.find('h1').text()).toBe(formatContrastRatio(21));
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

  it('updates contrast previews from tonal strip interactions and resets on blur/leave', async () => {
    const tones = [
      { index: 0, hex: '#000000' },
      { index: 60, hex: '#787878' },
      { index: 92, hex: '#e6e6e6' },
      { index: 100, hex: '#ffffff' },
    ];

    const Harness = defineComponent({
      name: 'ContrastPreviewHarness',
      components: { TonalStrip, ContrastPreviewCard },
      setup() {
        const selection = ref<PairingSelection>(null);

        const previewCards = computed(() => {
          const base = selection.value?.base ?? null;
          const pair = (background: typeof base | null, text: typeof base | null) => ({
            background,
            text,
          });

          return {
            darker45: pair(selection.value?.darker45 ?? null, base),
            darker3: pair(selection.value?.darker3 ?? null, base),
            lighter3: pair(base, selection.value?.lighter3 ?? null),
            lighter45: pair(base, selection.value?.lighter45 ?? null),
          };
        });

        const handlePairingChange = (payload: PairingSelection) => {
          selection.value = payload;
        };

        return {
          tones,
          previewCards,
          handlePairingChange,
        };
      },
      template: `
        <div>
          <TonalStrip
            :tones="tones"
            :base-index="60"
            data-cy="tonal-strip"
            @pairing-change="handlePairingChange"
          />
          <div class="grid">
            <ContrastPreviewCard
              id="colorcard-darker45"
              :title-key="'tonal_builder.accessibility.cards.darker_45'"
              ratio-label="4.5:1"
              :background="previewCards.darker45.background"
              :text="previewCards.darker45.text"
            />
            <ContrastPreviewCard
              id="colorcard-darker3"
              :title-key="'tonal_builder.accessibility.cards.darker_3'"
              ratio-label="3:1"
              :background="previewCards.darker3.background"
              :text="previewCards.darker3.text"
            />
            <ContrastPreviewCard
              id="colorcard-lighter3"
              :title-key="'tonal_builder.accessibility.cards.lighter_3'"
              ratio-label="3:1"
              :background="previewCards.lighter3.background"
              :text="previewCards.lighter3.text"
            />
            <ContrastPreviewCard
              id="colorcard-lighter45"
              :title-key="'tonal_builder.accessibility.cards.lighter_45'"
              ratio-label="4.5:1"
              :background="previewCards.lighter45.background"
              :text="previewCards.lighter45.text"
            />
          </div>
        </div>
      `,
    });

    const wrapper = mount(Harness, {
      global: {
        mocks: {
          $t: (key: string, values?: Record<string, string | number>) =>
            values ? `${key}-${Object.values(values).join('-')}` : key,
        },
      },
    });

    const swatches = wrapper.findAll('[data-cy="tonal-swatch"]');
    const baseSwatch = swatches[1];
    const expectClearedCards = () => {
      expect(wrapper.get('#colorcard-darker45 h1').text()).toBe('4.5:1');
      expect(wrapper.get('#colorcard-darker3 h1').text()).toBe('3:1');
      expect(wrapper.get('#colorcard-lighter3 h1').text()).toBe('3:1');
      expect(wrapper.get('#colorcard-lighter45 h1').text()).toBe('4.5:1');

      wrapper.findAll('[data-cy="contrast-preview-card"]').forEach((card) => {
        const indices = card.findAll('.colorcard-colorref-index').map((node) => node.text());
        expect(indices.every((value) => value === '—')).toBe(true);
      });
    };

    expectClearedCards();

    await baseSwatch.trigger('mouseenter');
    await nextTick();

    const darker45Ratio = getContrastRatio(tones[0].hex, tones[1].hex);
    expect(wrapper.get('#colorcard-darker45 h1').text()).toBe(formatContrastRatio(darker45Ratio));
    expect(wrapper.get('#colorcard-darker45').text()).toContain(tones[0].hex.toUpperCase());
    expect(wrapper.get('#colorcard-darker45').text()).toContain(tones[1].hex.toUpperCase());

    const lighter3Ratio = getContrastRatio(tones[1].hex, tones[2].hex);
    expect(wrapper.get('#colorcard-lighter3 h1').text()).toBe(formatContrastRatio(lighter3Ratio));
    const lighter3Levels = wrapper.get('#colorcard-lighter3').findAll('.colorcard-wcaglevel');
    expect(lighter3Levels[0].classes()).toContain('colorcard-wcaglevel_pass');
    expect(lighter3Levels[1].classes()).toContain('colorcard-wcaglevel_fail');
    expect(lighter3Levels[3].classes()).toContain('colorcard-wcaglevel_fail');

    await baseSwatch.trigger('mouseleave');
    await nextTick();

    expectClearedCards();

    const darkestSwatch = swatches[0];
    await darkestSwatch.trigger('focus');
    await nextTick();

    const lighter45Ratio = getContrastRatio(tones[0].hex, tones[1].hex);
    expect(wrapper.get('#colorcard-lighter45 h1').text()).toBe(formatContrastRatio(lighter45Ratio));
    const lighter45Levels = wrapper.get('#colorcard-lighter45').findAll('.colorcard-wcaglevel');
    expect(
      lighter45Levels
        .slice(0, 3)
        .every((node) => node.classes().includes('colorcard-wcaglevel_pass')),
    ).toBe(true);
    expect(lighter45Levels[3].classes()).toContain('colorcard-wcaglevel_fail');

    await darkestSwatch.trigger('blur');
    await nextTick();

    expectClearedCards();
  });
});
