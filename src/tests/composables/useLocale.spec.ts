import { describe, expect, it, vi, afterEach } from 'vitest';
import i18n, { LOCALE_STORAGE_KEY, resolveInitialLocale, setLocale } from '@/plugins/i18n';

const resetLocale = async () => {
  await setLocale(i18n, 'en', { setItem: vi.fn() });
};

describe('i18n helpers', () => {
  afterEach(async () => {
    await resetLocale();
  });

  it('prefers a stored locale before navigator languages', () => {
    const storage = { getItem: vi.fn().mockReturnValue('fr') } as const;

    const locale = resolveInitialLocale({ storage, navigatorLanguages: ['en-CA'] });

    expect(storage.getItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY);
    expect(locale).toBe('fr');
  });

  it('falls back to navigator languages when nothing is persisted', () => {
    const locale = resolveInitialLocale({ navigatorLanguages: ['fr-CA'] });

    expect(locale).toBe('fr');
  });

  it('persists locale changes', async () => {
    const storage = { setItem: vi.fn() } as const;

    await setLocale(i18n, 'fr', storage);

    expect(i18n.global.locale.value).toBe('fr');
    expect(storage.setItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, 'fr');
  });
});
