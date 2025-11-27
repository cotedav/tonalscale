import './commands';
import { mount } from 'cypress/vue';
import { createVuetify } from 'vuetify';
import { md3 } from 'vuetify/blueprints';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import '@/styles/main.scss';
import type { MountingOptions } from 'cypress/vue';

Cypress.Commands.add(
  'mount',
  (component: Parameters<typeof mount>[0], options: MountingOptions = {}) => {
    const vuetify = createVuetify({ blueprint: md3 });

    return mount(component, {
      ...options,
      global: {
        ...options.global,
        plugins: [vuetify, ...(options.global?.plugins ?? [])],
      },
    });
  },
);

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      mount: (
        component: Parameters<typeof mount>[0],
        options?: MountingOptions,
      ) => ReturnType<typeof mount>;
      getBySel<E extends Node = HTMLElement>(
        testId: string,
        options?: Partial<
          Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow
        >,
      ): Chainable<JQuery<E>>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
