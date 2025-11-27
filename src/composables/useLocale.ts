import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import i18n, { LOCALE_STORAGE_KEY, setLocale } from '@/plugins/i18n';
import type { SupportedLocale } from '@/locales';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const resolveStorage = (storage?: StorageLike) => {
  if (storage) return storage;
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
};

export const persistLocale = (
  locale: SupportedLocale,
  storage: StorageLike | undefined = resolveStorage(),
): SupportedLocale => {
  storage?.setItem(LOCALE_STORAGE_KEY, locale);
  return locale;
};

export const useLocale = (storage: StorageLike | undefined = resolveStorage()) => {
  const { locale, availableLocales } = useI18n();

  const currentLocale = computed(() => locale.value as SupportedLocale);
  const options = computed(() => availableLocales as SupportedLocale[]);

  const switchLocale = async (nextLocale: SupportedLocale) => {
    if (nextLocale === locale.value) return nextLocale;
    await setLocale(i18n, nextLocale, storage);
    return nextLocale;
  };

  return {
    currentLocale,
    availableLocales: options,
    switchLocale,
  };
};

export default useLocale;
