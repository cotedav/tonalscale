import { mount } from '@vue/test-utils';
import HomeView from '@/views/HomeView.vue';

describe('HomeView', () => {
  it('renders hero content and toolkit details', () => {
    const wrapper = mount(HomeView);

    expect(wrapper.text()).toContain('Tonal Scale Scaffold');
    expect(wrapper.text()).toContain('Vue 3 • TypeScript • Vite • Vuetify');
    expect(wrapper.text()).toContain('Live timestamp');
    expect(wrapper.find('[data-cy="localization-card"]').exists()).toBe(true);
    expect(wrapper.find('[data-cy="validation-form"]').exists()).toBe(true);
  });
});
