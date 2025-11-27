/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
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

Cypress.Commands.add('getBySel', (testId, options) => cy.get(`[data-cy="${testId}"]`, options));
