import { config } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import i18n from '@/plugins/i18n';
import setupValidation from '@/plugins/validation';

const vuetify = createVuetify({
  components,
  directives,
});

config.global.plugins = [vuetify, i18n];

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
