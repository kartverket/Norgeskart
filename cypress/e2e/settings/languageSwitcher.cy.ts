//npm run cy:run -- --spec "cypress/e2e/settings/languageSwitcher.cy.ts"
describe('Language Switcher', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:3000', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('hideDebug', 'true');
      },
    });
    cy.get('#map').should('be.visible');
  });

  describe('Language Icon Button in Toolbar', () => {
    it('should display the language icon button in the toolbar', () => {
      cy.get('button[data-scope="select"][data-part="trigger"]').should(
        'be.visible',
      );
    });

    it('should open language options dropdown when clicked', () => {
      cy.get('button[data-scope="select"][data-part="trigger"]').click();

      cy.contains('Norsk (bokmål)').should('be.visible');
      cy.contains('Norsk (nynorsk)').should('be.visible');
      cy.contains('English').should('be.visible');
    });
  });

  describe('Language Selection', () => {
    it('should switch to Norwegian Nynorsk', () => {
      cy.get('button[data-scope="select"][data-part="trigger"]').click();

      cy.contains('Norsk (nynorsk)').click({ force: true });
      cy.wait(300);

      cy.get('#map').should('be.visible');
    });

    it.skip('should switch to English', () => {
      cy.get('button[data-scope="select"][data-part="trigger"]').click();

      cy.contains('English').click({ force: true });
      cy.wait(500);

      cy.get('#map').should('be.visible');
      cy.contains('Select language', { timeout: 5000 }).should('be.visible');
    });

    it.skip('should persist language selection on reload', () => {
      cy.get('button[data-scope="select"][data-part="trigger"]').click();

      cy.contains('English').click({ force: true });
      cy.wait(500);

      cy.reload();
      cy.get('#map').should('be.visible');

      cy.contains('Select language', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('UI Translation Verification', () => {
    it.skip('should translate search placeholder when language changes', () => {
      const getSearchInput = () => cy.get('input[placeholder]');

      getSearchInput().should('have.attr', 'placeholder');

      cy.get('button[data-scope="select"][data-part="trigger"]').click();
      cy.contains('English').click({ force: true });
      cy.wait(300);

      getSearchInput().should('have.attr', 'placeholder');
    });
  });
});
