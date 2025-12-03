import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
import type { PairingSelection } from '@/components/tonal-builder/types';

const tones = [
  { index: 0, hex: '#000000' },
  { index: 60, hex: '#787878' },
  { index: 92, hex: '#e6e6e6' },
  { index: 100, hex: '#ffffff' },
];

describe('TonalStrip', () => {
  it('emits pairing data on hover and renders helper dots', async () => {
    const wrapper = mount(TonalStrip, {
      props: {
        tones,
        baseIndex: 60,
      },
    });

    const swatches = wrapper.findAll('[data-cy="tonal-swatch"]');
    await swatches[1].trigger('mouseenter');
    await nextTick();

    expect(wrapper.findAll('[data-cy="contrast-helper-dot"]').length).toBeGreaterThan(0);

    const payload = wrapper.emitted('pairing-change')?.pop()?.[0] as PairingSelection;
    if (!payload) {
      throw new Error('Expected pairing payload on hover');
    }
    expect(payload).toMatchObject({
      base: tones[1],
      darker45: tones[0],
      darker3: tones[0],
    });
    expect(payload.lighter3?.index).toBe(tones[2].index);
    expect(payload.lighter45).toBeNull();
  });

  it('supports cycling through matches with wheel and keyboard input', async () => {
    const wrapper = mount(TonalStrip, {
      props: {
        tones,
        baseIndex: 60,
      },
    });

    const swatch = wrapper.findAll('[data-cy="tonal-swatch"]')[1];
    await swatch.trigger('focus');
    await nextTick();

    await swatch.trigger('wheel', { deltaY: 120 });
    await nextTick();
    const wheelEvents = wrapper.emitted('pairing-change') ?? [];
    const wheelPayload = wheelEvents.at(-1)?.[0] as PairingSelection;
    if (!wheelPayload) {
      throw new Error('Expected pairing payload after wheel event');
    }
    expect(wheelPayload).toMatchObject({
      darker3: tones[0],
    });
    expect(wheelPayload.lighter3?.index).toBe(tones[3].index);
    expect(wheelPayload.lighter45).toBeNull();

    await swatch.trigger('keydown', { key: 'ArrowLeft' });
    await nextTick();
    const keyEvents = wrapper.emitted('pairing-change') ?? [];
    const keyPayload = keyEvents.at(-1)?.[0] as PairingSelection;
    if (!keyPayload) {
      throw new Error('Expected pairing payload after keyboard event');
    }
    expect(keyPayload.darker3).toEqual(tones[0]);
    expect(keyPayload.lighter3?.index).toBe(tones[2].index);
  });
});
