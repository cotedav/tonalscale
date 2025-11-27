/**
 * Normalize whitespace and capitalize the first letter of each word.
 */
export default function toTitleCase(value: string): string {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
