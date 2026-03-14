describe('print dialog shows up on button click', () => {
  it('opens and closes print dialog', () => {
    cy.visit('/');
    cy.get('[aria-label="print"]').click();
    cy.get('[id="print-dialog"]').should('be.visible');
    cy.get('button[aria-label="close-print"]').click();
    cy.get('[id="print-dialog"]').should('not.exist');
  });
});
