import { config } from '@vue/test-utils';
import { vi } from 'vitest';

import i18n from '@/plugins/i18n';
import setupValidation from '@/plugins/validation';

vi.mock('plotly.js-dist-min', () => {
  const react = vi.fn();
  const purge = vi.fn();

  return { default: { react, purge }, react, purge };
});

if (typeof globalThis.localStorage?.clear !== 'function') {
  const storage = new Map<string, string>();
  const localStorage = {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => {
      storage.clear();
    }),
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorage,
    configurable: true,
  });
  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    configurable: true,
  });
}

if (!globalThis.URL.createObjectURL) {
  Object.defineProperty(globalThis.URL, 'createObjectURL', {
    value: vi.fn(),
    writable: true,
  });
}

config.global.plugins = [i18n];

setupValidation();

/* eslint-disable class-methods-use-this */
class ResizeObserverPolyfill {
  observe = () => {};

  unobserve = () => {};

  disconnect = () => {};
}
/* eslint-enable class-methods-use-this */

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverPolyfill;
}
