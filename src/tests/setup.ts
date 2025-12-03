import { config } from '@vue/test-utils';
import { vi } from 'vitest';

import i18n from '@/plugins/i18n';
import setupValidation from '@/plugins/validation';

vi.mock('plotly.js-dist-min', () => {
  const react = vi.fn();
  const purge = vi.fn();

  return { default: { react, purge }, react, purge };
});

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
