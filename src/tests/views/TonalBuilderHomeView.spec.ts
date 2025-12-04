import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import TonalBuilderHomeView from '@/views/tonal-builder/TonalBuilderHomeView.vue';

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
      '#colorcard-darker45',
      '#colorcard-darker3',
      '#colorcard-lighter3',
      '#colorcard-lighter45',
      '#dialog-overlay',
      '#dialog',
    ].forEach((selector) => {
      expect(wrapper.find(selector).exists()).toBe(true);
    });

    expect(wrapper.find('[data-cy="base-color-picker"]').exists()).toBe(true);
    expect(wrapper.find('[data-cy="blend-color-picker"]').exists()).toBe(true);
    expect(wrapper.find('#baseColorPickerInput').text()).toContain('#7c3aed');

    expect(wrapper.findAll('[type="range"]').length).toBe(5);
    expect(wrapper.findAll('[data-cy$="-value"]').length).toBe(5);

    const fullStrip = wrapper.get('[data-cy="scale-strip-full"]');
    expect(fullStrip.findAll('[data-cy="tonal-swatch"]').length).toBeGreaterThan(0);

    expect(wrapper.find('[data-cy="copy-svg"]').exists()).toBe(true);
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

  it('opens the context menu with Headless UI and closes on escape', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      attachTo: document.body,
      global: {
        plugins: [pinia],
      },
    });

    const swatches = wrapper
      .find('[data-cy="scale-strip-full"]')
      .findAll('[data-cy="tonal-swatch"]');
    expect(swatches.length).toBeGreaterThan(1);

    const targetSwatch = swatches[1];

    await targetSwatch.trigger('contextmenu');
    await nextTick();

    const contextMenu = document.querySelector('[data-cy="context-menu"]');
    expect(contextMenu).not.toBeNull();

    const menuItems = contextMenu?.querySelectorAll('[role="menuitem"]') ?? [];
    expect(menuItems.length).toBeGreaterThan(0);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();
  });
});
