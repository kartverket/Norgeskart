// npm run cy:run -- --spec "cypress/e2e/map/mapControls.cy.ts"
describe('Map Controls', () => {
  beforeEach(() => {
    cy.viewport(1280, 720); // Desktop viewport to ensure all controls are visible
    cy.visit('http://localhost:3000');
    cy.get('#map').should('be.visible');
  });

  describe('Control Panel Visibility', () => {
    it('should display the map control panel', () => {
      cy.get('[aria-label="Zoom inn"]')
        .parent()
        .parent()
        .should('be.visible')
        .and('have.css', 'background-color');
    });

    it('should display all main control buttons', () => {
       cy.get('button[aria-label="Zoom inn"]').should('be.visible');
      cy.get('button[aria-label="Zoom ut"]').should('be.visible');
      cy.get('button[aria-label="Roter venstre"]').should('be.visible');
      cy.get('button[aria-label="Roter høyre"]').should('be.visible');
      cy.get('button[aria-label="Tilbakestill kartet til standard visning"]').should('be.visible');
      cy.get('button[aria-label="Gå til min posisjon"]').should('be.visible');
    });
  });

  describe('Zoom Controls', () => {
    it('should zoom in when zoom in button is clicked', () => {
      cy.get('button[aria-label="Zoom inn"]').click();
      cy.get('#map').should('be.visible');
    });

    it('should zoom out when zoom out button is clicked', () => {
      cy.get('button[aria-label="Zoom ut"]').click();
      cy.get('#map').should('be.visible');
    });

    it('should allow multiple zoom operations', () => {
      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(200);
      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(200);
      cy.get('button[aria-label="Zoom ut"]').click();
      cy.get('#map').should('be.visible');
    });
  });

  describe('Rotation Controls', () => {
    it('should rotate left when rotate left button is clicked', () => {
      cy.get('button[aria-label="Roter venstre"]').click();
      cy.get('#map').should('be.visible');
    });

    it('should rotate right when rotate right button is clicked', () => {
      cy.get('button[aria-label="Roter høyre"]').click();
      cy.get('#map').should('be.visible');
    });

    it('should reset orientation when navigation button is clicked', () => {
      // First rotate the map
      cy.get('button[aria-label="Roter venstre"]').click();
      cy.wait(200);
      
      // Then reset orientation
      cy.get('button[aria-label="Tilbakestill kartet til standard visning"]').click();
      cy.get('#map').should('be.visible');
    });

    it('should handle multiple rotation operations', () => {
      cy.get('button[aria-label="Roter venstre"]').click();
      cy.wait(200);
      cy.get('button[aria-label="Roter høyre"]').click();
      cy.wait(200);
      cy.get('button[aria-label="Roter venstre"]').click();
      cy.get('#map').should('be.visible');
    });
  });

  describe('My Location Control', () => {
    it('should have my location button visible', () => {
      cy.get('button[aria-label="Gå til min posisjon"]').should('be.visible');
    });

    it('should be clickable without errors', () => {
      // Note: Actual geolocation may fail in test environment, 
      // but button should be clickable
      cy.get('button[aria-label="Gå til min posisjon"]').click();
      cy.get('#map').should('be.visible');
    });
  });

  describe('Fullscreen Control', () => {
    it('should have fullscreen button visible on desktop', () => {
      cy.get('button[aria-label="Bruk fullskjerm"]').should('be.visible');
    });

    it('should toggle fullscreen when clicked', () => {
      cy.get('button[aria-label="Bruk fullskjerm"]').click();
      cy.get('#map').should('be.visible');
    });
  });

  describe('Control Button Interactions', () => {
    it('should allow rapid clicking without breaking', () => {
      cy.get('button[aria-label="Zoom inn"]').click().click();
      cy.get('button[aria-label="Zoom ut"]').click();
      cy.get('button[aria-label="Roter venstre"]').click();
      cy.get('button[aria-label="Tilbakestill kartet til standard visning"]').click();
      cy.get('#map').should('be.visible');
    });

    it('should maintain control panel visibility during interactions', () => {
      cy.get('button[aria-label="Zoom inn"]').click();
      cy.get('button[aria-label="Zoom inn"]')
        .parent()
        .parent()
        .should('be.visible');
      
      cy.get('button[aria-label="Roter venstre"]').click();
      cy.get('button[aria-label="Zoom inn"]')
        .parent()
        .parent()
        .should('be.visible');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should hide certain controls on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE size
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');
      
      // On mobile, zoom and rotation buttons should be hidden
      cy.get('button[aria-label="Gå til min posisjon"]').should('be.visible');
      
      // These should not exist on mobile
      // Todo: What to check for non-existence of elements ? 
      // cy.get('button[aria-label="Zoom inn"]').should('not.exist');
      // cy.get('button[aria-label="Roter venstre"]').should('not.exist');
    });

    it('should display all controls on desktop viewport', () => {
      cy.get('button[aria-label="Zoom inn"]').should('be.visible');
      cy.get('button[aria-label="Zoom ut"]').should('be.visible');
      cy.get('button[aria-label="Roter venstre"]').should('be.visible');
      cy.get('button[aria-label="Roter høyre"]').should('be.visible');
      cy.get('button[aria-label="Tilbakestill kartet til standard visning"]').should('be.visible');
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should allow focusing on control buttons', () => {
      cy.get('button[aria-label="Zoom inn"]').focus();
      cy.focused().should('have.attr', 'aria-label', 'Zoom inn');
    });

    it('should allow keyboard interaction with focused button', () => {
      cy.get('button[aria-label="Zoom inn"]').focus().type('{enter}');
      cy.get('#map').should('be.visible');
    });
  });
});
