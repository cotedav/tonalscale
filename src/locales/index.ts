import en from './en';
import fr from './fr';

export const messages = { en, fr } as const;

export type SupportedLocale = keyof typeof messages;

export const localeLoaders: Record<
  SupportedLocale,
  () => Promise<{ default: (typeof messages)[SupportedLocale] }>
> = {
  en: () => import('./en'),
  fr: () => import('./fr'),
};

export default messages;
