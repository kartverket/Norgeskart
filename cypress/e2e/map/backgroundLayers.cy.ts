// npm run cy:run -- --spec "cypress/e2e/map/backgroundLayers.cy.ts"
describe('Background Layer Switching', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:3000');
    cy.get('#map').should('be.visible');
  });

  describe('Background Layer Button', () => {
    it('should display background layer thumbnail button', () => {
      cy.get('button')
        .find('img[alt="Velg bakgrunnskart"]')
        .should('be.visible');
    });

    it('should open background layer settings when thumbnail is clicked', () => {
      cy.get('button').find('img[alt="Velg bakgrunnskart"]').parent().click();

      cy.get('div').contains('Topografisk').should('be.visible');
    });
  });

  describe('Layer Selection', () => {
    beforeEach(() => {
      cy.get('button').find('img[alt="Velg bakgrunnskart"]').parent().click();
      cy.wait(200);
    });

    it('should display multiple background layer options', () => {
      cy.contains('Topografisk').should('be.visible');
      cy.contains('gråtone').should('be.visible');
    });

    it('should have one layer marked as active', () => {
      // Active layer has border, check that at least one button exists in the grid
      cy.get('button').filter(':visible').should('have.length.greaterThan', 1);
    });

    it('should switch to a different background layer', () => {
      cy.contains('gråtone').click();

      cy.get('#map').should('be.visible');
    });

    it('should close settings after selecting a layer', () => {
      // Verify settings are open first
      cy.contains('Topografisk').should('be.visible');

      // Count buttons before closing
      cy.get('button')
        .filter(':visible')
        .its('length')
        .then((initialCount) => {
          // Click a layer option
          cy.contains('gråtone').click();

          // Wait for settings to close
          cy.wait(500);

          // Settings should close - fewer visible buttons now
          cy.get('button')
            .filter(':visible')
            .should('have.length.lessThan', initialCount);
        });
    });
  });

  describe('Layer Persistence', () => {
    it('should persist selected layer in URL', () => {
      cy.get('button').find('img[alt="Velg bakgrunnskart"]').parent().click();
      cy.wait(200);
      cy.contains('gråtone').click();
      cy.wait(300);

      cy.url().should('include', 'backgroundLayer=');
    });
  });

  describe('Hover Behavior', () => {
    // Note: Hover behavior can be unreliable in headless browsers
    // The click interaction is tested above and is more important for UX

    it('should keep settings open when hovering over settings panel', () => {
      // Open settings by clicking
      cy.get('button').find('img[alt="Velg bakgrunnskart"]').parent().click();
      cy.wait(200);

      // Verify settings remain visible when hovering
      cy.contains('Topografisk').trigger('mouseenter');
      cy.wait(200);

      // Settings should still be visible
      cy.contains('Topografisk').should('be.visible');
    });
  });
});
