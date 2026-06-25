import { decodeShareState, encodeShareState } from '@/utils/tonal/share-state';

describe('share state codec', () => {
  it('round-trips JSON through a URI-safe compressed hash', () => {
    const serialized = JSON.stringify({
      version: 2,
      activeRole: 'surface',
      roles: {
        surface: {
          baseHex: '#123456',
          blendHex: '#000032',
          blendMode: 'colordodge',
          controls: { strength: 0, middle: 0, spread: 50, satDarker: 0, satLighter: 0 },
        },
        primary: {
          baseHex: '#abcdef',
          blendHex: '#000032',
          blendMode: 'multiply',
          controls: { strength: 20, middle: 5, spread: 60, satDarker: 10, satLighter: 15 },
        },
      },
      preview: {
        darkMode: false,
        surfaceContrast: 'low',
        lightSurfaceTone: 100,
        darkSurfaceTone: 0,
      },
    });

    const hash = encodeShareState(serialized);

    expect(hash).toMatch(/^#v2=[A-Za-z0-9+_-]+$/);
    expect(hash.length).toBeLessThan(encodeURIComponent(serialized).length);
    expect(decodeShareState(hash)).toBe(serialized);
  });

  it('rejects unsupported, empty, and malformed hashes', () => {
    expect(decodeShareState('#v1=abc')).toBeNull();
    expect(decodeShareState('#v2=')).toBeNull();
    expect(decodeShareState('#v2=%')).toBeNull();
  });
});
