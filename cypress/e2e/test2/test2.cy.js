describe('Test 2', () => {
  it('Test 2', () => {
    cy.visit('https://example.cypress.io');
    cy.wait(4000);
    cy.screenshot('test2-screenshot');
  })
})
