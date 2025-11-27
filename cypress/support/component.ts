import './commands';
import { mount } from 'cypress/vue';
import type { MountingOptions } from 'cypress/vue';
import i18n from '@/plugins/i18n';
import setupValidation from '@/plugins/validation';
import '@/styles/main.css';

Cypress.Commands.add(
  'mount',
  (component: Parameters<typeof mount>[0], options: MountingOptions = {}) => {
    setupValidation();

    return mount(component, {
      ...options,
      global: {
        ...options.global,
        plugins: [i18n, ...(options.global?.plugins ?? [])],
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
