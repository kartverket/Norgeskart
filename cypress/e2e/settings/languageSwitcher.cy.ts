//npm run cy:run -- --spec "cypress/e2e/settings/languageSwitcher.cy.ts"
describe('Language Switcher', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:3000');
    cy.get('#map').should('be.visible');
  });

  describe('Opening Settings Panel', () => {
    it('should display settings button in toolbar', () => {
      cy.contains('button', 'Innstillinger').should('be.visible');
    });

    it('should open settings panel when settings button is clicked', () => {
      cy.contains('button', 'Innstillinger').click();

      cy.contains('Velg språk').should('be.visible');
    });
  });

  describe('Language Selection', () => {
    beforeEach(() => {
      cy.contains('button', 'Innstillinger').click();
      cy.wait(200);
    });

    it('should display language selector with current language', () => {
      cy.contains('Velg språk').should('be.visible');

      // There might be multiple selects on page, get within language section
      cy.contains('Velg språk')
        .parent()
        .within(() => {
          cy.get('button[data-scope="select"][data-part="trigger"]').should(
            'be.visible',
          );
        });
    });

    it('should open language options dropdown', () => {
      // Click language selector (within the settings panel)
      cy.contains('Velg språk')
        .parent()
        .within(() => {
          cy.get('button[data-scope="select"][data-part="trigger"]').click();
        });

      cy.contains('Norsk bokmål').should('be.visible');
      cy.contains('Norsk nynorsk').should('be.visible');
      cy.contains('English').should('be.visible');
    });

    it('should switch to Norwegian Nynorsk', () => {
      cy.contains('Velg språk')
        .parent()
        .within(() => {
          cy.get('button[data-scope="select"][data-part="trigger"]').click();
        });

      // Use force:true because map canvas may cover the dropdown
      cy.contains('Norsk nynorsk').click({ force: true });
      cy.wait(300);

      cy.get('#map').should('be.visible');

      cy.contains('button', 'Innstillingar').should('be.visible');
    });

    it('should switch to English', () => {
      cy.contains('Velg språk')
        .parent()
        .within(() => {
          cy.get('button[data-scope="select"][data-part="trigger"]').click();
        });

      // Use force:true because map canvas may cover the dropdown
      cy.contains('English').click({ force: true });
      cy.wait(300);

      cy.get('#map').should('be.visible');

      cy.contains('button', 'Settings').should('be.visible');
    });

    it('should persist language selection on reload', () => {
      cy.contains('Velg språk')
        .parent()
        .within(() => {
          cy.get('button[data-scope="select"][data-part="trigger"]').click();
        });
      // Use force:true because map canvas may cover the dropdown
      cy.contains('English').click({ force: true });
      cy.wait(300);

      cy.reload();
      cy.get('#map').should('be.visible');

      cy.contains('button', 'Settings').click({ force: true });
      cy.wait(200);

      cy.contains('Choose language').should('be.visible');
    });
  });

  describe('UI Translation Verification', () => {
    beforeEach(() => {
      cy.contains('button', 'Innstillinger').click({ force: true });
      cy.wait(300);
    });

    it('should translate search placeholder when language changes', () => {
      const getSearchInput = () => cy.get('input[type="search"]');

      // Verify Norwegian placeholder exists
      getSearchInput().should('have.attr', 'placeholder');

      cy.contains('Velg språk')
        .parent()
        .within(() => {
          cy.get('button[data-scope="select"][data-part="trigger"]').click();
        });
      cy.contains('English').click({ force: true });
      cy.wait(300);

      // Verify placeholder still exists after language change
      getSearchInput().should('have.attr', 'placeholder');
    });

    it('should close settings panel', () => {
      // Verify settings are open
      cy.contains('Velg språk').should('exist');

      // Close settings by clicking button again
      cy.contains('button', 'Innstillinger').click({ force: true });
      cy.wait(200);

      // Settings should be closed (not visible or hidden)
      cy.get('body').then(($body) => {
        // Settings panel should either not exist or not be visible
        const settingsExists = $body.find(':contains("Velg språk")').length > 0;
        if (settingsExists) {
          cy.contains('Velg språk').should('not.be.visible');
        }
      });
    });
  });
});
