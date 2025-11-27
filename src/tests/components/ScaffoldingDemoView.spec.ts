import { mount } from '@vue/test-utils';
import ScaffoldingDemoView from '@/views/demo/ScaffoldingDemoView.vue';

describe('ScaffoldingDemoView', () => {
  it('renders hero content and toolkit details', () => {
    const wrapper = mount(ScaffoldingDemoView);

    expect(wrapper.text()).toContain('Tonal Scale Scaffold');
    expect(wrapper.text()).toContain('Vue 3 • TypeScript • Vite • Tailwind CSS');
    expect(wrapper.text()).toContain('Live timestamp');
    expect(wrapper.find('[data-cy="localization-card"]').exists()).toBe(true);
    expect(wrapper.find('[data-cy="validation-form"]').exists()).toBe(true);
  });
});
