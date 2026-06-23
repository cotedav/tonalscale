import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

import TonalBuilderHomeView from '@/views/tonal-builder/TonalBuilderHomeView.vue';

// Mock useTonalUrlSync to avoid router dependency
vi.mock('@/composables/useTonalUrlSync', () => ({
  default: vi.fn(),
}));

describe('TonalBuilderHomeView', () => {
  it('renders tonal builder shell aligned to the prototype layout', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.find('[data-cy="tonal-builder-title"]').text()).toContain('Tonal Builder');

    [
      '#toolbar',
      '#baseColorPickerInput',
      '#blendColorPickerInput',
      '#baseColorPicker',
      '#blendColorPicker',
      '#color-scale-container-full',
      '#color-scale-container-custom',
      '#color-scale-container-key',
      '#gradient-controls',
      '[data-cy="accessibility-dock"]',
      '#colorcard-darker45',
      '#colorcard-darker3',
      '#colorcard-lighter3',
      '#colorcard-lighter45',
    ].forEach((selector) => {
      expect(wrapper.find(selector).exists()).toBe(true);
    });

    expect(wrapper.find('[data-cy="base-color-picker"]').exists()).toBe(true);
    expect(wrapper.find('[data-cy="blend-color-picker"]').exists()).toBe(true);
    expect(wrapper.get('#gradient-controls').find('#blendColorPicker').exists()).toBe(true);
    expect(wrapper.find('[data-cy="blend-mode-summary"]').exists()).toBe(false);
    expect(wrapper.find('[data-cy="blend-enabled-toggle"]').exists()).toBe(true);
    expect(wrapper.find('#baseColorPickerInput').text()).toContain('#7c3aed');

    expect(wrapper.findAll('[type="range"]').length).toBe(5);
    expect(wrapper.findAll('[data-cy$="-value"]').length).toBe(5);

    const fullStrip = wrapper.get('[data-cy="scale-strip-full"]');
    expect(fullStrip.findAll('[data-cy="tonal-swatch"]').length).toBeGreaterThan(0);
  });

  it('initializes blend controls to the expected defaults', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    const expectedDefaults: Record<string, string> = {
      strength: '0',
      middle: '0',
      spread: '50',
      satDarker: '0',
      satLighter: '0',
    };

    Object.entries(expectedDefaults).forEach(([id, value]) => {
      const slider = wrapper.get(`[data-cy="${id}-slider"]`);
      const number = wrapper.get(`[data-cy="${id}-value"]`);

      expect((slider.element as HTMLInputElement).value).toBe(value);
      expect((number.element as HTMLInputElement).value).toBe(value);
    });
  });

  it('clears a selected tone only when clicking outside a tone in the swatches panel', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    const swatch = wrapper.get('[data-cy="scale-strip-key"] [data-cy="tonal-swatch"]');
    await swatch.trigger('click');
    await nextTick();

    expect(swatch.attributes('data-selected')).toBe('true');

    await wrapper.get('#gradient-controls').trigger('click');
    await nextTick();

    expect(swatch.attributes('data-selected')).toBe('true');

    await wrapper.get('[data-cy="swatches-panel"]').trigger('click');
    await nextTick();

    expect(swatch.attributes('data-selected')).toBe('false');
    wrapper.findAll('[data-cy="contrast-preview-card"]').forEach((card) => {
      expect(card.attributes('style')).toContain('opacity: 0.2');
    });
  });
});
