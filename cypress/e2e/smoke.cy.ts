/// <reference types="cypress" />

describe('PWA shell smoke test', () => {
  beforeEach(() => {
    cy.fixture('app-shell').as('shell');
  });

  it('renders the scaffolding demo shell with primary content', function testHomeShell() {
    cy.visit('/scaffolding-demo');

    cy.getBySel('home-shell').should('exist');
    cy.getBySel('home-title').should('have.text', this.shell.title);
    cy.getBySel('home-description').should('contain.text', this.shell.description);
    cy.getBySel('toolkit-alert').within(() => {
      cy.contains('Vue 3').should('be.visible');
      cy.contains('Tailwind CSS').should('be.visible');
      cy.contains('Headless UI').should('be.visible');
      cy.getBySel('toolkit-stack-item').should('have.length', 12);
    });

    cy.getBySel('toolkit-stack').should('be.visible');
    cy.getBySel('toolkit-toggle').click();
    cy.getBySel('toolkit-stack').should('not.exist');
    cy.getBySel('toolkit-toggle').click();
    cy.getBySel('toolkit-stack-item').first().should('contain.text', 'Vue 3');
  });
});
