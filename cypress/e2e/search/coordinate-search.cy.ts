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

    it('should handle semicolon separator', () => {
      const coordinates = '59.91273; 10.74609';

      getSearchInput().type(coordinates);
      cy.contains('59.91273').should('be.visible');
      cy.contains('10.74609').should('be.visible');
    });

    it('should handle space-only separator', () => {
      const coordinates = '59.91273 10.74609';

      getSearchInput().type(coordinates);
      cy.contains('59.91273').should('be.visible');
      cy.contains('10.74609').should('be.visible');
    });

    it('should handle Bergen coordinates', () => {
      const coordinates = '60.39299, 5.32415';

      getSearchInput().type(coordinates);
      cy.contains('60.39299').should('be.visible');
      cy.contains('5.32415').should('be.visible');
    });

    it('should handle Tromsø coordinates', () => {
      const coordinates = '69.6496, 18.9560';

      getSearchInput().type(coordinates);
      cy.contains('69.6496').should('be.visible');
    });
  });

  describe('DMS (Degrees Minutes Seconds) Format', () => {
    it('should parse standard DMS format', () => {
      const dmsCoordinates = '59°54\'45.8"N 10°44\'45.9"E';

      getSearchInput().type(dmsCoordinates);
      cy.contains('°').should('be.visible');
      cy.contains('N').should('be.visible');
      cy.contains('E').should('be.visible');
    });

    it('should parse DMS with decimal minutes', () => {
      const dmCoordinates = "60° 50.466' N, 04° 52.535' E";

      getSearchInput().type(dmCoordinates);
      cy.contains('°').should('be.visible');
    });

    it('should parse DMS with direction before coordinates', () => {
      // eslint-disable-next-line
      const coordinates = 'N 60° 5\' 38\'\', E 10° 50\' 10\'\'';

      getSearchInput().type(coordinates);
      cy.contains('°').should('be.visible');
    });

    it('should parse DMS without quotes on seconds', () => {
      const coordinates = "60°10'10,10°10'10";

      getSearchInput().type(coordinates);
      cy.contains('°').should('be.visible');
    });

    it('should parse DMS with spaces', () => {
      const coordinates = '59° 54\' 45.8" N, 10° 44\' 45.9" E';

      getSearchInput().type(coordinates);
      cy.contains('°').should('be.visible');
      cy.contains('N').should('be.visible');
    });
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

    it('should parse UTM with space separator', () => {
      const coordinates = '598515 6643994';

      getSearchInput().type(coordinates);
      cy.contains('UTM').should('be.visible');
      cy.contains('598515').should('be.visible');
    });

    it('should auto-detect northing-first order', () => {
      const coordinates = '6643994, 598515';

      getSearchInput().type(coordinates);
      cy.contains('UTM').should('be.visible');
      cy.contains('598515').should('be.visible');
      cy.contains('6643994').should('be.visible');
    });

    it('should parse UTM with direction letters N/E', () => {
      const coordinates = '6653873.01 N, 227047.11 E';

      getSearchInput().type(coordinates);
      cy.contains('UTM').should('be.visible');
    });

    it('should parse UTM with zone 32', () => {
      const coordinates = '32 425917 7730314';

      getSearchInput().type(coordinates);
      cy.contains('UTM 32').should('be.visible');
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

    it('should parse dot-decimal coordinates with comma separator and EPSG', () => {
      const coordinates = '242366.00,6736146.01@EPSG:25833';

      getSearchInput().type(coordinates);
      cy.contains('UTM 33').should('be.visible');
      cy.contains('242366').should('be.visible');
      cy.contains('6736146').should('be.visible');
    });

    it('should parse EPSG coordinates with European decimal separators (commas)', () => {
      const coordinates = '163834,01 6663030,01@EPSG:25833';

      getSearchInput().type(coordinates);
      cy.contains('UTM 33').should('be.visible');
    });

    it('should parse EPSG:4326 coordinates with European decimal separators', () => {
      const coordinates = '59,91273 10,74609@4326';

      getSearchInput().type(coordinates);
      cy.contains('WGS84').should('be.visible');
    });

    it('should parse EPSG coordinates with European decimals and semicolon separator', () => {
      const coordinates = '163834,01;6663030,01@EPSG:25833';

      getSearchInput().type(coordinates);
      cy.contains('UTM 33').should('be.visible');
    });

    it('should parse EPSG:4258 (ETRS89)', () => {
      const coordinates = '59.91273, 10.74609@4258';

      getSearchInput().type(coordinates);
      cy.contains('ETRS89').should('be.visible');
    });

    it('should parse case-insensitive EPSG prefix', () => {
      const coordinates = '598515 6643994@epsg:25833';

      getSearchInput().type(coordinates);
      cy.contains('UTM 33').should('be.visible');
    });

    it('should parse comma-separated 4326 without spaces', () => {
      const coordinates = '59.91273,10.74609@4326';

      getSearchInput().type(coordinates);
      cy.contains('WGS84').should('be.visible');
    });

    it('should parse integer UTM with comma separator and EPSG', () => {
      const coordinates = '500000,7000000@25833';

      getSearchInput().type(coordinates);
      cy.contains('UTM 33').should('be.visible');
      cy.contains('500000').should('be.visible');
      cy.contains('7000000').should('be.visible');
    });

    it('should parse UTM zone 34 with EPSG', () => {
      const coordinates = '598515 7643994@25834';

      getSearchInput().type(coordinates);
      cy.contains('UTM 34').should('be.visible');
    });

    it('should parse UTM zone 35 with EPSG', () => {
      const coordinates = '498515 7643994@25835';

      getSearchInput().type(coordinates);
      cy.contains('UTM 35').should('be.visible');
    });
  });

  describe('Norwegian Language Support', () => {
    it('should parse coordinates with Norwegian direction words', () => {
      const coordinates = '60° Nord, 10° Øst';

      getSearchInput().type(coordinates);
      cy.contains('60').should('be.visible');
    });

    it('should parse uppercase Norwegian directions', () => {
      const coordinates = '60° NORD, 10° ØST';

      getSearchInput().type(coordinates);
      cy.contains('60').should('be.visible');
    });

    it('should parse English direction words', () => {
      const coordinates = '60° North, 10° East';

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

  describe('NTM (Norwegian Transverse Mercator) - Unsupported', () => {
    it('should not parse NTM zone 10 coordinates (EPSG:5110)', () => {
      const coordinates = '100000,6500000@5110';

      getSearchInput().type(coordinates);
      cy.contains('NTM').should('not.exist');
      cy.contains('UTM').should('not.exist');
    });

    it('should not parse NTM zone 15 coordinates (EPSG:5115)', () => {
      const coordinates = '100000 6600000@5115';

      getSearchInput().type(coordinates);
      cy.contains('NTM').should('not.exist');
      cy.contains('UTM').should('not.exist');
    });

    it('should not parse NTM with full EPSG prefix (EPSG:5120)', () => {
      const coordinates = '100000,6700000@EPSG:5120';

      getSearchInput().type(coordinates);
      cy.contains('NTM').should('not.exist');
      cy.contains('UTM').should('not.exist');
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
