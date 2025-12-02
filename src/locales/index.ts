import en from './en';
import fr from './fr';

export const messages = { en, fr } as const;

export type SupportedLocale = keyof typeof messages;

export default messages;
