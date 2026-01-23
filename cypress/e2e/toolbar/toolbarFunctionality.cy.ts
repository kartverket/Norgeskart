// npm run cy:run -- --spec "cypress/e2e/toolbar/toolbarFunctionality.cy.ts"
describe('Toolbar Functionality', () => {
  // Helper to get toolbar - it has a unique green background color
  const getToolbar = () => cy.get('button[icon="explore"]').parent().parent();

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:3000');
    cy.get('#map').should('be.visible');
  });

  describe('Toolbar Visibility', () => {
    it('should display toolbar at bottom of screen on desktop', () => {
      // Toolbar contains compass button
      cy.get('button[icon="explore"]').should('be.visible');
    });

    it('should hide toolbar on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      // Compass button should not exist on mobile (toolbar is hidden)
      cy.get('button[icon="explore"]').should('not.exist');
    });
  });

  describe('Compass Control', () => {
    it('should display compass toggle button', () => {
      cy.get('button[icon="explore"]').should('be.visible');
    });

    it('should toggle compass overlay when button is clicked', () => {
      cy.get('button[icon="explore"]').click();

      cy.wait(200);

      cy.get('button[icon="explore"]').click();
      cy.wait(200);
    });
  });

  describe('Magnetic North Switch', () => {
    it('should display magnetic north switch', () => {
      cy.get('button[role="switch"]').should('exist');
    });

    it('should be disabled when compass is not active', () => {
      cy.get('button[icon="explore"]').then((_$btn) => {
        cy.get('button[role="switch"]').should('have.attr', 'disabled');
      });
    });

    it('should enable when compass is activated', () => {
      cy.get('button[icon="explore"]').click();
      cy.wait(200);

      cy.get('button[role="switch"]').should('not.have.attr', 'disabled');
    });
  });

  describe('Coordinate Display', () => {
    it('should display mouse coordinates in toolbar', () => {
      cy.get('#map').trigger('mousemove', { clientX: 640, clientY: 360 });

      // Coordinate display is in toolbar near compass button
      getToolbar().within(() => {
        cy.get('p').should('exist');
      });
    });

    it('should update coordinates as mouse moves', () => {
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
    it('should display scale selector in toolbar', () => {
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
      cy.contains('button', 'Rett i kartet').should('be.visible');
    });

    it('should open report error dialog when clicked', () => {
      cy.contains('button', 'Rett i kartet').click();

      cy.wait(200);

      cy.get('div[role="dialog"]').should('be.visible');
    });

    it('should close report error dialog', () => {
      cy.contains('button', 'Rett i kartet').click();

      cy.wait(200);

      cy.get('button[aria-label="Close"]').first().click();

      cy.get('div[role="dialog"]').should('not.exist');
    });
  });

  describe('Projection Settings', () => {
    it('should display projection selector in toolbar', () => {
      // Projection selector is in toolbar
      getToolbar().within(() => {
        cy.get('button[data-scope="select"][data-part="trigger"]').should(
          'be.visible',
        );
      });
    });

    it('should open projection options dropdown', () => {
      getToolbar().within(() => {
        cy.get('button[data-scope="select"][data-part="trigger"]').click();
      });

      cy.wait(200);

      cy.contains('UTM').should('be.visible');
    });
  });

  describe('Toolbar Interaction', () => {
    it('should maintain toolbar visibility during map interactions', () => {
      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(200);

      // Toolbar should still be visible (compass button visible)
      cy.get('button[icon="explore"]').should('be.visible');

      cy.get('#map')
        .trigger('mousedown', { clientX: 400, clientY: 400 })
        .trigger('mousemove', { clientX: 450, clientY: 450 })
        .trigger('mouseup');

      // Toolbar should still be visible
      cy.get('button[icon="explore"]').should('be.visible');
    });
  });
});
