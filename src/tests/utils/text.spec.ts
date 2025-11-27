import toTitleCase from '@/utils/text';

describe('toTitleCase', () => {
  it('capitalizes each word and collapses whitespace', () => {
    expect(toTitleCase('  hello   world ')).toBe('Hello World');
  });

  it('returns an empty string when input is falsy', () => {
    expect(toTitleCase('')).toBe('');
  });
});
