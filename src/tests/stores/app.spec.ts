import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAppStore, type AppPreferences } from '@/stores/app';

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with default state', () => {
    const store = useAppStore();

    expect(store.appName).toBe('Tonal Scale');
    expect(store.isReady).toBe(false);
    expect(store.preferences).toEqual({
      locale: 'en',
      theme: 'light',
    });
  });

  it('marks the app as ready', () => {
    const store = useAppStore();

    store.setReady(true);

    expect(store.isReady).toBe(true);
  });

  it('merges preference updates safely', () => {
    const store = useAppStore();
    const updates: Partial<AppPreferences> = { locale: 'fr' };

    store.updatePreferences(updates);

    expect(store.preferences).toEqual({
      locale: 'fr',
      theme: 'light',
    });
    expect(store.preferredLocale).toBe('fr');
  });
});
