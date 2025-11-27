import { DateTime } from 'luxon';

const DEFAULT_LOCALE = 'en';

export type IsoDateInput = string | Date;

/**
 * Format a date string into a short, localized label.
 * Accepts ISO strings or Date objects to make callers flexible.
 */
export const formatDateLabel = (value: IsoDateInput, locale = DEFAULT_LOCALE): string =>
  DateTime.fromJSDate(value instanceof Date ? value : new Date(value))
    .setLocale(locale)
    .toLocaleString(DateTime.DATE_MED);

/**
 * Create a stable ISO timestamp for logging or telemetry.
 */
export const toUtcIsoString = (value: IsoDateInput): string =>
  DateTime.fromJSDate(value instanceof Date ? value : new Date(value))
    .toUTC()
    .toISO() ?? '';
