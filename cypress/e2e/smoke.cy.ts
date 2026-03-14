// npm run cy:run -- --spec "cypress/e2e/smoke.cy.ts"
describe('Smoke tests', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('hideDebug', 'true');
      },
    });
    cy.get('#map', { timeout: 15000 }).should('be.visible');
  });

  it('map renders on load', () => {
    cy.get('#map').should('be.visible');
  });

  it('search result click moves the map', () => {
    cy.get('input[placeholder*="Norgeskart"]').type('Oslo');
    cy.get('ul', { timeout: 10000 }).should('be.visible');
    cy.contains('Oslo', { timeout: 5000 }).first().click();

    cy.url().should('include', 'lon=');
    cy.url().should('include', 'lat=');
  });

  it('print dialog opens and closes', () => {
    cy.get('button[aria-label="print"]').click();
    cy.get('[id="print-dialog"]').should('be.visible');

    cy.get('button[aria-label="close-print"]').click();
    cy.get('[id="print-dialog"]').should('not.exist');
  });
});
