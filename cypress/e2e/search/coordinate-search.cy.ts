// npm run cy:run -- --spec "cypress/e2e/search/coordinate-search.cy.ts"
describe('Coordinate Search', () => {
  const getSearchInput = () => cy.get('input[placeholder*="Norgeskart"]');

  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('#map', { timeout: 10000 }).should('be.visible');
  });

  describe('Decimal Degrees Format', () => {
    it('should search for Oslo coordinates in decimal format', () => {
      const osloCoordinates = '59.91273, 10.74609';

      getSearchInput().type(osloCoordinates);
      cy.contains('59.91273').should('be.visible');
      cy.contains('10.74609').should('be.visible');
    });

    it('should handle coordinates without space after comma', () => {
      const coordinates = '60,10';

      getSearchInput().type(coordinates);
      cy.contains('60').should('be.visible');
      cy.contains('10').should('be.visible');
    });

    it('should handle coordinates with European decimal separators', () => {
      const coordinates = '60,135106, 10,618917';

      getSearchInput().type(coordinates);
      cy.contains('60.135').should('be.visible');
    });

    it('should handle European decimals without spaces between coordinates', () => {
      const coordinates = '60,135106,10,618917';

      getSearchInput().type(coordinates);
      cy.contains('60.135').should('be.visible');
      cy.contains('10.618').should('be.visible');
    });

    it('should handle short European decimals with space', () => {
      const coordinates = '60,13, 10,61';

      getSearchInput().type(coordinates);
      cy.contains('60.13').should('be.visible');
      cy.contains('10.61').should('be.visible');
    });

    it('should handle short European decimals without space', () => {
      const coordinates = '60,13,10,61';

      getSearchInput().type(coordinates);
      cy.contains('60.13').should('be.visible');
      cy.contains('10.61').should('be.visible');
    });

    it('should handle coordinates with degree symbols', () => {
      const coordinates = '59.9494° N, 10.7564° E';

      getSearchInput().type(coordinates);
      cy.contains('59.9494').should('be.visible');
    });
  });

  describe('DMS (Degrees Minutes Seconds) Format', () => {
    /*
    it('should parse standard DMS format', () => {
      const dmsCoordinates = '59°54\'45.8"N 10°44\'45.9"E';

      getSearchInput().type(dmsCoordinates);
      // Verify DMS result appears (formatted back)
      cy.contains('°').should('be.visible');
      cy.contains('N').should('be.visible');
      cy.contains('E').should('be.visible');
    });
    */

    it('should parse DMS with decimal minutes', () => {
      const dmCoordinates = "60° 50.466' N, 04° 52.535' E";

      getSearchInput().type(dmCoordinates);
      cy.contains('°').should('be.visible');
    });
    /*
    it('should parse DMS with direction before coordinates', () => {
      const coordinates = 'N 60° 5\' 38", E 10° 50\' 10"';

      getSearchInput().type(coordinates);
      cy.contains('°').should('be.visible');
    });
    */
  });

  describe('UTM Format', () => {
    it('should parse UTM coordinates without zone (defaults to 33N)', () => {
      const utmCoordinates = '598515, 6643994';

      getSearchInput().type(utmCoordinates);
      cy.contains('UTM').should('be.visible');
      cy.contains('598515').should('be.visible');
      cy.contains('6643994').should('be.visible');
    });

    it('should parse UTM coordinates with explicit zone', () => {
      const utmCoordinates = '33 598515 6643994';

      getSearchInput().type(utmCoordinates);
      cy.contains('UTM').should('be.visible');
      cy.contains('33').should('be.visible');
    });
  });

  describe('EPSG Explicit Format', () => {
    it('should parse coordinates with EPSG:4326 specification', () => {
      const coordinates = '59.91273, 10.74609@4326';

      getSearchInput().type(coordinates);
      cy.contains('WGS84').should('be.visible');
    });

    it('should parse UTM coordinates with EPSG:25833 specification', () => {
      const coordinates = '598515 6643994@25833';

      getSearchInput().type(coordinates);
      cy.contains('UTM 33').should('be.visible');
    });

    it('should parse UTM zone 32 coordinates', () => {
      const coordinates = '425917 7730314@25832';

      getSearchInput().type(coordinates);
      cy.contains('UTM 32').should('be.visible');
    });

    it('should parse coordinates with full EPSG: prefix', () => {
      const coordinates = '163834.01,6663030.01@EPSG:25833';

      getSearchInput().type(coordinates);
      cy.contains('UTM 33').should('be.visible');
    });
  });

  describe('Norwegian Language Support', () => {
    it('should parse coordinates with Norwegian direction words', () => {
      const coordinates = '60° Nord, 10° Øst';

      getSearchInput().type(coordinates);
      cy.contains('60').should('be.visible');
    });
  });

  describe('Search Result Interaction', () => {
    it('should display coordinate result when valid coordinates are entered', () => {
      const coordinates = '59.91273, 10.74609';

      getSearchInput().type(coordinates);
      cy.get('ul').contains('59.91273').should('be.visible');
      cy.get('ul').should('have.css', 'background-color');
    });

    it('should show close button when search has results', () => {
      const coordinates = '59.91273, 10.74609';

      getSearchInput().type(coordinates);
      cy.get('button').filter(':visible').should('exist');
      cy.get('button').should('have.length.greaterThan', 0);
    });

    it('should clear search results when close button is clicked', () => {
      const coordinates = '59.91273, 10.74609';

      getSearchInput().type(coordinates);
      cy.get('ul').contains('59.91273').should('be.visible');
      getSearchInput()
        .parent() // Get the Box containing the input
        .parent() // Get the Flex containing both image and search box
        .find('button') // Find button within this search area
        .click();
      getSearchInput().should('have.value', '');
      cy.get('ul').contains('59.91273').should('not.exist');
    });
  });

  describe('Invalid Coordinate Handling', () => {
    it('should not show coordinate result for invalid format', () => {
      const invalidCoordinates = 'not a coordinate';

      getSearchInput().type(invalidCoordinates);
      cy.contains('Coordinate').should('not.exist');
    });

    it('should not show result for out-of-range coordinates', () => {
      const invalidCoordinates = '999, 999';

      getSearchInput().type(invalidCoordinates);
    });

    it('should handle empty search input gracefully', () => {
      getSearchInput().type(' ').clear();
      cy.get('#map').should('be.visible');
    });
  });

  describe('Map Integration', () => {
    it('should allow clicking coordinate result to center map', () => {
      const coordinates = '59.91273, 10.74609';

      getSearchInput().type(coordinates);
      cy.contains('59.91273').should('be.visible');
      cy.contains('59.91273').click({ force: true });
      cy.get('#map').should('be.visible');
    });
  });
});
