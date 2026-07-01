import { compressToEncodedURIComponent } from 'lz-string';

import decodeLegacyShareState from '@/utils/tonal/legacy-share-state';

describe('legacy share state codec', () => {
  it('decodes previous compressed hash payloads for migration', () => {
    const serialized = JSON.stringify({
      version: 2,
      activeRole: 'surface',
      roles: {
        surface: {
          baseHex: '#123456',
        },
      },
    });
    const hash = `#v2=${compressToEncodedURIComponent(serialized)}`;

    expect(decodeLegacyShareState(hash)).toBe(serialized);
  });

  it('rejects unsupported, empty, and malformed hashes', () => {
    expect(decodeLegacyShareState('#v1=abc')).toBeNull();
    expect(decodeLegacyShareState('#v2=')).toBeNull();
    expect(decodeLegacyShareState('#v2=%')).toBeNull();
  });
});
