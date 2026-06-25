import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

import MaterialSurfacePreview from '@/components/tonal-builder/MaterialSurfacePreview.vue';
import { useTonalScaleStore } from '@/stores/tonalScale';
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
      '[data-cy="material-surface-preview"]',
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
    expect(wrapper.find('#baseColorPickerInput').text()).toContain('#8000ff');
    expect(wrapper.get('[data-cy="builder-workspace"]').attributes('style')).toContain(
      '--controls-panel-width: 500px',
    );
    expect(wrapper.find('[data-cy="controls-resize-handle"]').exists()).toBe(true);

    expect(wrapper.findAll('#gradient-controls [type="range"]').length).toBe(5);
    expect(wrapper.findAll('#gradient-controls [data-cy$="-value"]').length).toBe(5);

    const fullStrip = wrapper.get('[data-cy="scale-strip-full"]');
    expect(fullStrip.findAll('[data-cy="tonal-swatch"]').length).toBeGreaterThan(0);
    expect(wrapper.getComponent(MaterialSurfacePreview).props('tones')).toEqual(
      useTonalScaleStore().extendedStrip,
    );
  });

  it('resizes the color controls panel with the split-pane handle', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });
    const workspace = wrapper.get('[data-cy="builder-workspace"]');
    vi.spyOn(workspace.element, 'getBoundingClientRect').mockReturnValue({
      bottom: 800,
      height: 700,
      left: 0,
      right: 1200,
      top: 100,
      width: 1200,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });

    await wrapper.get('[data-cy="controls-resize-handle"]').trigger('pointerdown');
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 620 }));
    window.dispatchEvent(new MouseEvent('pointerup'));
    await nextTick();

    expect(workspace.attributes('style')).toContain('--controls-panel-width: 580px');

    await wrapper.get('[data-cy="controls-resize-handle"]').trigger('keydown', {
      key: 'ArrowRight',
    });
    expect(workspace.attributes('style')).toContain('--controls-panel-width: 560px');
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

  it('reflects imported store parameters in every color and blend control', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });
    const store = useTonalScaleStore();

    store.importState({
      colorHex: '#123456',
      blendMode: 'multiply',
      blendStrength: 64,
      blendR: 101,
      blendG: 67,
      blendB: 33,
      middle: -18,
      spread: 72,
      satDarker: 23,
      satLighter: 41,
    });
    await nextTick();

    expect(wrapper.get('#baseColorPickerInput').text()).toContain('#123456');
    expect(wrapper.get('#blendColorPickerInput').text()).toContain('#654321');
    expect((wrapper.get('#blendmode').element as HTMLSelectElement).value).toBe('multiply');
    expect((wrapper.get('[data-cy="strength-value"]').element as HTMLInputElement).value).toBe(
      '64',
    );
    expect((wrapper.get('[data-cy="middle-value"]').element as HTMLInputElement).value).toBe('-18');
    expect((wrapper.get('[data-cy="spread-value"]').element as HTMLInputElement).value).toBe('72');
    expect((wrapper.get('[data-cy="satDarker-value"]').element as HTMLInputElement).value).toBe(
      '23',
    );
    expect((wrapper.get('[data-cy="satLighter-value"]').element as HTMLInputElement).value).toBe(
      '41',
    );
    expect(
      (wrapper.get('[data-cy="blend-enabled-toggle"]').element as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('collapses and expands the accessibility dock when clicking the toggle button', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    const toggleBtn = wrapper.get('[data-cy="accessibility-dock-toggle"]');
    const content = wrapper.get('[data-cy="accessibility-dock-content"]');

    // Initially expanded (visible)
    expect(toggleBtn.attributes('aria-expanded')).toBe('true');
    expect(content.isVisible()).toBe(true);

    // Click toggle to collapse
    await toggleBtn.trigger('click');
    await nextTick();

    expect(toggleBtn.attributes('aria-expanded')).toBe('false');
    expect(content.isVisible()).toBe(false);

    // Click toggle to expand again
    await toggleBtn.trigger('click');
    await nextTick();

    expect(toggleBtn.attributes('aria-expanded')).toBe('true');
    expect(content.isVisible()).toBe(true);
  });
});
