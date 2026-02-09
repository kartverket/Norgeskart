// npm run cy:run -- --spec "cypress/e2e/toolbar/toolbarFunctionality.cy.ts"
describe('Toolbar Functionality', () => {
  // Helper to get toolbar using the always-present "Feil i kartet?" button
  const getToolbar = () => cy.contains('button', 'Feil i kartet?').parent();

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:3000', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('hideDebug', 'true');
      },
    });
    cy.get('#map').should('be.visible');
  });

  describe('Toolbar Visibility', () => {
    it('should display toolbar at bottom of screen on desktop', () => {
      cy.contains('button', 'Feil i kartet?').should('be.visible');
    });

    it('should hide toolbar on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.visit('http://localhost:3000', {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('hideDebug', 'true');
        },
      });
      cy.get('#map').should('be.visible');

      cy.contains('button', 'Feil i kartet?').should('not.exist');
    });
  });

  describe('Compass Control', () => {
    it('should display compass toggle button', () => {
      getToolbar().find('button').first().should('be.visible');
    });

    it.skip('should toggle compass overlay when button is clicked', () => {
      getToolbar().find('button').first().click({ force: true });

      cy.wait(200);

      getToolbar().find('button').first().click({ force: true });
      cy.wait(200);
    });
  });

  describe('Magnetic North Switch', () => {
    it.skip('should display magnetic north switch', () => {
      cy.get('button[role="switch"]').should('exist');
    });

    it.skip('should be disabled when compass is not active', () => {
      cy.get('button[role="switch"]').should('have.attr', 'disabled');
    });

    it.skip('should enable when compass is activated', () => {
      getToolbar().find('button').first().click({ force: true });
      cy.wait(200);

      cy.get('button[role="switch"]').should('not.have.attr', 'disabled');
    });
  });

  describe('Coordinate Display', () => {
    it.skip('should display mouse coordinates in toolbar', () => {
      cy.get('#map').trigger('mousemove', { clientX: 640, clientY: 360 });

      // Coordinate display is in toolbar near compass button
      getToolbar().within(() => {
        cy.get('p').should('exist');
      });
    });

    it.skip('should update coordinates as mouse moves', () => {
      cy.get('#map').trigger('mousemove', { clientX: 300, clientY: 300 });
      cy.wait(100);

      cy.get('#map').trigger('mousemove', { clientX: 700, clientY: 400 });
      cy.wait(100);

      getToolbar().within(() => {
        cy.get('p').should('exist');
      });
    });
  });

  describe('Scale Selector', () => {
    it.skip('should display scale selector in toolbar', () => {
      // Scale selector shows "1:" followed by scale number
      getToolbar().should('contain', '1:');
    });
  });

  describe('Map Legend Button', () => {
    it('should not display legend button when no theme layers are active', () => {
      // Legend button only appears when theme layers are active
      cy.contains('button', 'Tegnforklaring').should('not.exist');
    });
  });

  describe('Report Error Button', () => {
    it('should display "Rett i kartet" button', () => {
      cy.contains('button', 'Feil i kartet?').should('be.visible');
    });

    it('should open report error dialog when clicked', () => {
      cy.contains('button', 'Feil i kartet?').click();

      cy.wait(200);

      cy.get('div[role="dialog"]').should('be.visible');
    });

    it.skip('should close report error dialog', () => {
      cy.contains('button', 'Feil i kartet?').click();

      cy.wait(200);

      cy.get('button[aria-label="Close"]').first().click({ force: true });

      cy.get('div[role="dialog"]').should('not.exist');
    });
  });

  describe('Projection Settings', () => {
    it.skip('should display projection selector in toolbar', () => {
      // Projection selector is in toolbar
      getToolbar().within(() => {
        cy.get('button[data-scope="select"][data-part="trigger"]').should(
          'be.visible',
        );
      });
    });

    it.skip('should open projection options dropdown', () => {
      getToolbar().within(() => {
        cy.get('button[data-scope="select"][data-part="trigger"]').click();
      });

      cy.wait(200);

      cy.contains('UTM').should('be.visible');
    });
  });

  describe('Toolbar Interaction', () => {
    it.skip('should maintain toolbar visibility during map interactions', () => {
      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(200);

      // Toolbar should still be visible (compass button visible)
      cy.contains('button', 'Feil i kartet?').should('be.visible');

      cy.get('#map')
        .trigger('mousedown', { clientX: 400, clientY: 400 })
        .trigger('mousemove', { clientX: 450, clientY: 450 })
        .trigger('mouseup');

      // Toolbar should still be visible
      cy.contains('button', 'Feil i kartet?').should('be.visible');
    });
  });
});
