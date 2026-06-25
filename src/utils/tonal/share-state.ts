import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

const HASH_PREFIX = '#v2=';

export const encodeShareState = (serializedState: string): string =>
  `${HASH_PREFIX}${compressToEncodedURIComponent(serializedState)}`;

export const decodeShareState = (hash: string): string | null => {
  if (!hash.startsWith(HASH_PREFIX)) return null;

  const encoded = hash.slice(HASH_PREFIX.length);
  if (!encoded) return null;

  return decompressFromEncodedURIComponent(encoded) || null;
};
