describe('map component visible', () => {
  it('passes', () => {
    cy.visit('/');
    cy.get('#map').should('be.visible');
  });
});
