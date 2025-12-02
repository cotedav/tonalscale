import { createI18n } from 'vue-i18n';
import { messages, type SupportedLocale } from '@/locales';

export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const LOCALE_STORAGE_KEY = 'pp_locale';

const SUPPORTED_LOCALES = Object.keys(messages) as SupportedLocale[];

const normalizeLocale = (candidate?: string | null): SupportedLocale | null => {
  if (!candidate) return null;
  const lowered = candidate.toLowerCase();
  const exactMatch = SUPPORTED_LOCALES.find((locale) => locale === lowered);
  if (exactMatch) return exactMatch;

  const base = lowered.split('-')[0];
  return SUPPORTED_LOCALES.find((locale) => locale === base) ?? null;
};

export const resolveInitialLocale = ({
  storage = typeof window !== 'undefined' ? window.localStorage : undefined,
  navigatorLanguages = typeof navigator !== 'undefined' ? navigator.languages : undefined,
}: {
  storage?: Pick<Storage, 'getItem'>;
  navigatorLanguages?: readonly string[];
} = {}): SupportedLocale => {
  const storedLocale = normalizeLocale(storage?.getItem(LOCALE_STORAGE_KEY));
  if (storedLocale) return storedLocale;

  const navigatorLocale = normalizeLocale(
    navigatorLanguages?.find((language) => normalizeLocale(language)) ?? null,
  );
  if (navigatorLocale) return navigatorLocale;

  return DEFAULT_LOCALE;
};

export const buildI18n = (locale: SupportedLocale = resolveInitialLocale()) =>
  createI18n<(typeof messages)[SupportedLocale], SupportedLocale, false>({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
  });

export type AppI18n = ReturnType<typeof buildI18n>;

export const loadLocaleMessages = async (instance: AppI18n, locale: SupportedLocale) => {
  if (instance.global.availableLocales.includes(locale)) return;

  const messageSet = messages[locale];
  if (!messageSet) return;

  instance.global.setLocaleMessage(locale, messageSet);
};

export const setLocale = async (
  instance: AppI18n,
  locale: SupportedLocale,
  storage: Pick<Storage, 'setItem'> | undefined = typeof window !== 'undefined'
    ? window.localStorage
    : undefined,
) => {
  await loadLocaleMessages(instance, locale);

  const { global } = instance;
  global.locale.value = locale;
  storage?.setItem(LOCALE_STORAGE_KEY, locale);
  return locale;
};

const i18n = buildI18n();

export default i18n;
