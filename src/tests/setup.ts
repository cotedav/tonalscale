import { config } from '@vue/test-utils';
import i18n from '@/plugins/i18n';
import setupValidation from '@/plugins/validation';

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
