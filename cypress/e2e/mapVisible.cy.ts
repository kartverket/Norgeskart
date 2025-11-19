describe('map component visible', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000');
    cy.get('#map').should('be.visible');
  });
});
