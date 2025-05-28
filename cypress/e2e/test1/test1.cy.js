describe('Test 1', () => {
  it('Test 1', () => {
    cy.visit('https://example.cypress.io');
    cy.wait(3000);
    cy.screenshot('test1-screenshot');
  })
})
