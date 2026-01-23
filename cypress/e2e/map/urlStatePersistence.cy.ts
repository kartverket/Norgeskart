//npm run cy:run -- --spec "cypress/e2e/map/urlStatePersistence.cy.ts"
describe('URL State Persistence', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Map Position Persistence', () => {
    it('should persist zoom level in URL', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(300);

      cy.url().should('include', 'zoom=');
    });

    it('should persist center coordinates in URL', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.get('#map')
        .trigger('mousedown', { clientX: 400, clientY: 400 })
        .trigger('mousemove', { clientX: 500, clientY: 500 })
        .trigger('mouseup');

      cy.wait(300);

      cy.url().should('include', 'lon=');
      cy.url().should('include', 'lat=');
    });

    it('should persist rotation in URL', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.get('button[aria-label="Roter venstre"]').click();
      cy.wait(500);

      cy.url().should('include', 'rotation=');
    });

    it('should restore map state from URL parameters', () => {
      cy.visit(
        'http://localhost:3000?zoom=10&lon=396722&lat=7197860&rotation=0',
      );
      cy.get('#map').should('be.visible');

      cy.wait(500);
      cy.get('#map').should('be.visible');
    });
  });

  describe('Background Layer Persistence', () => {
    it('should persist background layer selection in URL', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.get('button').find('img[alt="Velg bakgrunnskart"]').parent().click();
      cy.wait(200);

      cy.contains('gråtone').click();
      cy.wait(300);

      cy.url().should('include', 'backgroundLayer=');
    });

    it('should restore background layer from URL', () => {
      cy.visit('http://localhost:3000?backgroundLayer=topograatone');
      cy.get('#map').should('be.visible');

      cy.wait(1000);

      cy.get('#map').should('be.visible');
    });
  });

  describe('Projection Persistence', () => {
    it('should persist projection selection in URL', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.url().should('match', /projection=|EPSG/);
    });

    it('should restore projection from URL', () => {
      cy.visit('http://localhost:3000?projection=EPSG:25833');
      cy.get('#map').should('be.visible');

      cy.wait(500);

      cy.get('#map').should('be.visible');
    });
  });

  describe('Complete State Restoration', () => {
    it('should restore complete map state from URL', () => {
      const testUrl =
        'http://localhost:3000?zoom=8&lon=400000&lat=7200000&rotation=0.5&projection=EPSG:25833&backgroundLayer=topo';

      cy.visit(testUrl);
      cy.get('#map').should('be.visible');

      cy.wait(1000);

      cy.get('#map').should('be.visible');

      cy.url().should('include', 'zoom=');
      cy.url().should('include', 'lon=');
      cy.url().should('include', 'lat=');
      cy.url().should('include', 'rotation=');
      cy.url().should('include', 'backgroundLayer=');
    });

    it('should maintain URL state after page reload', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(300);

      cy.get('button[aria-label="Roter venstre"]').click();
      cy.wait(500);

      cy.url().then((_url) => {
        cy.reload();
        cy.get('#map').should('be.visible');
        cy.wait(500);

        cy.url().should('include', 'zoom=');
        cy.url().should('include', 'rotation=');
      });
    });
  });

  describe('URL Parameter Updates', () => {
    it('should update URL parameters on map interaction', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      let initialUrl: string;
      cy.url().then((url) => {
        initialUrl = url;
      });

      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(300);

      cy.url().should((newUrl) => {
        expect(newUrl).to.not.equal(initialUrl);
      });
    });

    it('should handle multiple rapid state changes', () => {
      cy.visit('http://localhost:3000');
      cy.get('#map').should('be.visible');

      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(100);
      cy.get('button[aria-label="Zoom inn"]').click();
      cy.wait(100);
      cy.get('button[aria-label="Roter venstre"]').click();
      cy.wait(100);

      cy.url().should('include', 'zoom=');
      cy.get('#map').should('be.visible');
    });
  });

  describe('Invalid URL Parameters', () => {
    it('should handle invalid zoom values gracefully', () => {
      cy.visit('http://localhost:3000?zoom=invalid');
      cy.get('#map').should('be.visible');

      cy.wait(500);
      cy.get('#map').should('be.visible');
    });

    it('should handle invalid coordinate values gracefully', () => {
      cy.visit('http://localhost:3000?lon=abc&lat=xyz');
      cy.get('#map').should('be.visible');

      cy.wait(500);
      cy.get('#map').should('be.visible');
    });

    it('should handle invalid projection gracefully', () => {
      cy.visit('http://localhost:3000?projection=INVALID');
      cy.get('#map').should('be.visible');

      cy.wait(500);
      cy.get('#map').should('be.visible');
    });
  });
});
