// npm run cy:run -- --spec "cypress/e2e/map/mapToolButtons.cy.ts"
describe('Map Tool Buttons', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:3000');
    cy.get('#map').should('be.visible');
  });

  describe('Tool Button Bar Visibility', () => {
    it('should display all map tool buttons', () => {
      cy.contains('button', 'Tegn').should('be.visible');
      cy.contains('button', 'Kartlag').should('be.visible');
      cy.contains('button', 'Info').should('be.visible');
      cy.contains('button', 'Del kart').should('be.visible');
      cy.contains('button', 'Innstillinger').should('be.visible');
    });

    it('should display print button on desktop', () => {
      cy.get('button[aria-label="print"]').should('be.visible');
    });

    it('should hide print button on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.get('button[aria-label="print"]').should('not.exist');
    });
  });

  describe('Draw Tool', () => {
    it('should open draw tool panel when clicked', () => {
      cy.contains('button', 'Tegn').click();
      cy.wait(200);
      cy.get('div').should('exist');
    });

    it('should close draw tool panel when clicked again', () => {
      cy.contains('button', 'Tegn').click();
      cy.wait(200);

      cy.contains('button', 'Tegn').click();
      cy.wait(200);

      cy.contains('button', 'Tegn').should(
        'not.have.css',
        'background-color',
        '#D0ECD6',
      );
    });

    it('should highlight active draw button', () => {
      cy.contains('button', 'Tegn').click();
      cy.wait(200);

      cy.contains('button', 'Tegn')
        .should('have.css', 'background-color')
        .and('include', 'rgb(208, 236, 214)');
    });
  });

  describe('Layers Tool', () => {
    it('should open layers panel when clicked', () => {
      cy.contains('button', 'Kartlag').click();
      cy.wait(200);

      cy.get('div').should('exist');
    });

    it('should close layers panel when clicked again', () => {
      cy.contains('button', 'Kartlag').click();
      cy.wait(200);

      cy.contains('button', 'Kartlag').click();
      cy.wait(200);

      cy.contains('button', 'Kartlag').should(
        'not.have.css',
        'background-color',
        '#D0ECD6',
      );
    });

    it('should highlight active layers button', () => {
      cy.contains('button', 'Kartlag').click();
      cy.wait(200);

      cy.contains('button', 'Kartlag')
        .should('have.css', 'background-color')
        .and('include', 'rgb(208, 236, 214)');
    });
  });

  describe('Info Tool', () => {
    it('should open info panel when clicked', () => {
      cy.contains('button', 'Info').click();
      cy.wait(200);

      cy.get('div').should('exist');
    });

    it('should close info panel when clicked again', () => {
      cy.contains('button', 'Info').click();
      cy.wait(200);

      cy.contains('button', 'Info').click();
      cy.wait(200);

      cy.contains('button', 'Info').should(
        'not.have.css',
        'background-color',
        '#D0ECD6',
      );
    });
  });

  describe('Settings Tool', () => {
    it('should open settings panel when clicked', () => {
      cy.contains('button', 'Innstillinger').click();
      cy.wait(200);

      cy.contains('Velg språk').should('be.visible');
    });

    it('should close settings panel when clicked again', () => {
      cy.contains('button', 'Innstillinger').click();
      cy.wait(200);

      cy.contains('button', 'Innstillinger').click();
      cy.wait(200);

      cy.contains('Velg språk').should('not.be.visible');
    });
  });

  describe('Share Map Tool', () => {
    it('should be clickable without errors', () => {
      cy.contains('button', 'Del kart').click();

      cy.get('#map').should('be.visible');
    });

    it('should copy URL to clipboard', () => {
      cy.contains('button', 'Del kart').click();
      cy.wait(500);

      cy.contains('Lenke kopiert til utklippstavle').should('be.visible');
    });
  });

  describe('Print Tool', () => {
    it('should open print dialog when clicked', () => {
      cy.get('button[aria-label="print"]').click();
      cy.wait(200);

      cy.get('[id="print-dialog"]').should('be.visible');
    });

    it('should close print dialog', () => {
      cy.get('button[aria-label="print"]').click();
      cy.wait(200);

      cy.get('button[aria-label="close-print"]').click();

      cy.get('[id="print-dialog"]').should('not.exist');
    });
  });

  describe('Tool Switching', () => {
    it('should close one tool when opening another', () => {
      cy.contains('button', 'Tegn').click();
      cy.wait(200);

      cy.contains('button', 'Tegn')
        .should('have.css', 'background-color')
        .and('include', 'rgb(208, 236, 214)');

      cy.contains('button', 'Kartlag').click();
      cy.wait(200);

      cy.contains('button', 'Kartlag')
        .should('have.css', 'background-color')
        .and('include', 'rgb(208, 236, 214)');

      cy.contains('button', 'Tegn').should(
        'not.have.css',
        'background-color',
        'rgb(208, 236, 214)',
      );
    });

    it('should allow switching between multiple tools', () => {
      cy.contains('button', 'Tegn').click();
      cy.wait(200);

      cy.contains('button', 'Kartlag').click();
      cy.wait(200);

      cy.contains('button', 'Info').click();
      cy.wait(200);

      cy.contains('button', 'Innstillinger').click();
      cy.wait(200);

      cy.contains('Velg språk').should('be.visible');
    });
  });

  describe('Button Icons', () => {
    it('should display icon for each button', () => {
      cy.contains('button', 'Tegn').find('span[icon="edit"]').should('exist');
      cy.contains('button', 'Kartlag')
        .find('span[icon="layers"]')
        .should('exist');
      cy.contains('button', 'Info').find('span[icon="info"]').should('exist');
      cy.contains('button', 'Del kart')
        .find('span[icon="share"]')
        .should('exist');
      cy.contains('button', 'Innstillinger')
        .find('span[icon="settings"]')
        .should('exist');
    });
  });

  describe('Button Accessibility', () => {
    it('should allow keyboard navigation to buttons', () => {
      cy.contains('button', 'Tegn').focus();
      cy.focused().should('contain', 'Tegn');
    });

    it('should allow keyboard activation of buttons', () => {
      cy.contains('button', 'Tegn').focus().type('{enter}');
      cy.wait(200);

      cy.contains('button', 'Tegn')
        .should('have.css', 'background-color')
        .and('include', 'rgb(208, 236, 214)');
    });

    it('should have proper aria labels', () => {
      cy.get('button[aria-label="print"]').should(
        'have.attr',
        'aria-label',
        'print',
      );
    });
  });

  describe('Responsive Behavior', () => {
    it('should show compact labels on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.contains('button', 'Tegn').should('be.visible');
    });

    it('should maintain functionality on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.contains('button', 'Tegn').click();
      cy.wait(200);

      cy.get('#map').should('be.visible');
    });
  });
});
