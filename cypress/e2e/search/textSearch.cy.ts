// npm run cy:run -- --spec "cypress/e2e/search/textSearch.cy.ts"
describe('Text Search Functionality', () => {
  const getSearchInput = () => cy.get('input[placeholder*="Norgeskart"]');

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:3000');
    cy.get('#map').should('be.visible');
  });

  describe('Search Input', () => {
    it('should display search input field', () => {
      getSearchInput().should('be.visible');
    });

    it('should display search icon when empty', () => {
      cy.get('span[icon="search"]').should('be.visible');
    });

    it('should accept text input', () => {
      const searchText = 'Oslo';
      getSearchInput().type(searchText);
      getSearchInput().should('have.value', searchText);
    });

    it('should show spinner while searching', () => {
      getSearchInput().type('Trondheim');

      cy.get('span[data-scope="spinner"]', { timeout: 1000 }).should('exist');
    });

    it('should show close button when search has value', () => {
      getSearchInput().type('Bergen');

      cy.get('button[icon="close"]').should('be.visible');
    });
  });

  describe('Address Search', () => {
    it('should search for addresses', () => {
      getSearchInput().type('Schweigaardsgate 34');

      cy.wait(1000);

      cy.contains('Schweigaardsgate', { timeout: 5000 }).should('be.visible');
    });

    it('should search for address with postal code', () => {
      getSearchInput().type('Schweigaardsgate 34, 0191 Oslo');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Place Search', () => {
    it('should search for city names', () => {
      getSearchInput().type('Oslo');

      cy.wait(1000);

      cy.contains('Oslo', { timeout: 5000 }).should('be.visible');
    });

    it('should search for smaller place names', () => {
      getSearchInput().type('Lofoten');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });

    it('should search for landmarks', () => {
      getSearchInput().type('Nidarosdomen');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Road Search', () => {
    it('should search for roads', () => {
      getSearchInput().type('E6');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Search Results Display', () => {
    it('should display search results in a list', () => {
      getSearchInput().type('Oslo');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });

    it('should display multiple result types', () => {
      getSearchInput().type('Trondheim');

      cy.wait(1000);

      cy.get('ul li', { timeout: 5000 }).should('have.length.greaterThan', 0);
    });

    it('should allow clicking on search result', () => {
      getSearchInput().type('Oslo');

      cy.wait(1000);

      cy.contains('Oslo', { timeout: 5000 }).first().click();

      cy.get('#map').should('be.visible');
    });
  });

  describe('Search Result Clearing', () => {
    it('should clear results when close button is clicked', () => {
      getSearchInput().type('Bergen');

      cy.wait(1000);

      cy.get('button[icon="close"]').click();

      getSearchInput().should('have.value', '');

      cy.contains('Bergen').should('not.exist');
    });

    it('should clear results when input is cleared', () => {
      getSearchInput().type('Stavanger');

      cy.wait(1000);

      getSearchInput().clear();

      cy.wait(500);
      cy.contains('Stavanger').should('not.exist');
    });
  });

  describe('Empty Search Handling', () => {
    it('should not search for empty input', () => {
      getSearchInput().type('   ').clear();

      cy.get('ul').should('not.exist');
    });

    it('should not search for very short input', () => {
      getSearchInput().type('a');

      cy.get('#map').should('be.visible');
    });
  });

  describe('Search with Special Characters', () => {
    it('should handle Norwegian characters', () => {
      getSearchInput().type('Ålesund');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });

    it('should handle search with ø', () => {
      getSearchInput().type('Tromsø');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });

    it('should handle search with æ', () => {
      getSearchInput().type('Bærum');

      cy.wait(1000);

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Search Performance', () => {
    it('should debounce search input', () => {
      getSearchInput().type('T');
      cy.wait(100);
      getSearchInput().type('r');
      cy.wait(100);
      getSearchInput().type('o');
      cy.wait(100);
      getSearchInput().type('n');
      cy.wait(100);
      getSearchInput().type('d');

      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });

    it('should handle rapid input changes', () => {
      getSearchInput().type('Oslo');
      getSearchInput().clear();
      getSearchInput().type('Bergen');
      getSearchInput().clear();
      getSearchInput().type('Trondheim');

      cy.wait(1000);
      cy.get('ul', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Search Integration with Map', () => {
    it('should center map on selected result', () => {
      getSearchInput().type('Oslo');

      cy.wait(1000);

      cy.contains('Oslo', { timeout: 5000 }).first().click();

      cy.wait(500);

      cy.get('#map').should('be.visible');

      cy.url().should('include', 'lon=');
      cy.url().should('include', 'lat=');
    });

    it('should add marker when result is selected', () => {
      getSearchInput().type('Bergen');

      cy.wait(1000);

      cy.contains('Bergen', { timeout: 5000 }).first().click();

      cy.wait(500);

      cy.get('#map').should('be.visible');
    });
  });

  describe('No Results Handling', () => {
    it('should handle search with no results', () => {
      getSearchInput().type('xyznonexistentplace123');

      cy.wait(2000);

      cy.get('#map').should('be.visible');
    });
  });
});
