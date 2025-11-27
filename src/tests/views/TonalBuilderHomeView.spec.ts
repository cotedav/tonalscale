import { mount } from '@vue/test-utils';
import TonalBuilderHomeView from '@/views/tonal-builder/TonalBuilderHomeView.vue';

describe('TonalBuilderHomeView', () => {
  it('renders tonal builder shell placeholders', () => {
    const wrapper = mount(TonalBuilderHomeView);

    expect(wrapper.find('[data-cy="tonal-builder-title"]').text()).toContain(
      'Tonal builder workspace',
    );

    [
      'base-picker-placeholder',
      'blend-picker-placeholder',
      'control-panel-placeholder',
      'scale-strips-placeholder',
      'interactive-overlays-placeholder',
      'accessibility-placeholder',
      'modal-stack-placeholder',
    ].forEach((selector) => {
      expect(wrapper.find(`[data-cy="${selector}"]`).exists()).toBe(true);
    });
  });

  it('exposes ARIA labels for supporting rails', () => {
    const wrapper = mount(TonalBuilderHomeView);
    const ariaLabels = wrapper.findAll('aside').map((aside) => aside.attributes('aria-label'));

    expect(ariaLabels.filter(Boolean).length).toBeGreaterThanOrEqual(2);
  });
});
