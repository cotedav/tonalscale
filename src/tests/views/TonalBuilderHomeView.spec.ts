import { mount } from '@vue/test-utils';
import TonalBuilderHomeView from '@/views/tonal-builder/TonalBuilderHomeView.vue';

describe('TonalBuilderHomeView', () => {
  it('renders tonal builder shell aligned to the prototype layout', () => {
    const wrapper = mount(TonalBuilderHomeView);

    expect(wrapper.find('[data-cy="tonal-builder-title"]').text()).toContain('Tonal Builder');

    [
      '#toolbar',
      '#baseColorPickerInput',
      '#blendColorPickerInput',
      '#baseColorPicker',
      '#blendColorPicker',
      '#gradient-controls',
      '#colorcard-darker45',
      '#colorcard-darker3',
      '#colorcard-lighter3',
      '#colorcard-lighter45',
      '#dialog-overlay',
      '#dialog',
      '#copied-message',
    ].forEach((selector) => {
      expect(wrapper.find(selector).exists()).toBe(true);
    });

    expect(wrapper.find('[data-cy="scale-strip-full"]').findAll('[role="listitem"]').length).toBe(
      101,
    );
    expect(
      wrapper.find('[data-cy="scale-strip-extended"]').findAll('[role="listitem"]').length,
    ).toBeGreaterThan(10);
    expect(
      wrapper.find('[data-cy="scale-strip-key"]').findAll('[role="listitem"]').length,
    ).toBeGreaterThan(5);

    expect(wrapper.find('[data-cy="base-color-picker"]').exists()).toBe(true);
    expect(wrapper.find('[data-cy="blend-color-picker"]').exists()).toBe(true);
    expect(wrapper.find('#baseColorPickerInput').text()).toContain('#7c3aed');

    expect(wrapper.findAll('[type="range"]').length).toBe(5);
    expect(wrapper.findAll('[data-cy$="-value"]').length).toBe(5);
  });
});
