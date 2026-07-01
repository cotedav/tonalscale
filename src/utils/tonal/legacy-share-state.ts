import { decompressFromEncodedURIComponent } from 'lz-string';

const LEGACY_HASH_PREFIX = '#v2=';

const decodeLegacyShareState = (hash: string): string | null => {
  if (!hash.startsWith(LEGACY_HASH_PREFIX)) return null;

  const encoded = hash.slice(LEGACY_HASH_PREFIX.length);
  if (!encoded) return null;

  return decompressFromEncodedURIComponent(encoded) || null;
};

export default decodeLegacyShareState;
