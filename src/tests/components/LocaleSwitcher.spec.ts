import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher.vue';
import i18n, { LOCALE_STORAGE_KEY, setLocale } from '@/plugins/i18n';

describe('LocaleSwitcher', () => {
  beforeEach(async () => {
    await setLocale(i18n, 'en', { setItem: vi.fn() });
  });

  afterEach(() => {
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
  });

  it('renders the switcher label and updates the active locale', async () => {
    const wrapper = mount(LocaleSwitcher);

    expect(wrapper.text()).toContain('Language');

    const select = wrapper.getComponent({ name: 'VSelect' });
    await select.vm.$emit('update:modelValue', 'fr');
    await flushPromises();

    expect(i18n.global.locale.value).toBe('fr');
    expect(wrapper.get('[data-cy="current-locale"]').text()).toContain('Français');
  });
});
