import chunk from 'lodash/chunk';
import uniq from 'lodash/uniq';

/**
 * Break an array into evenly sized rows for grid-style rendering.
 *
 * Uses direct lodash path imports to keep bundles tree-shakeable.
 */
export const chunkIntoRows = <T>(items: readonly T[], rowSize = 1): T[][] => {
  if (rowSize < 1) {
    return [items.slice()];
  }

  return chunk(items, rowSize);
};

/**
 * Remove falsy entries and de-duplicate values while preserving order.
 */
export const uniqueTruthy = <T>(items: readonly (T | undefined | null | false | '')[]): T[] =>
  uniq(items.filter(Boolean) as T[]);
