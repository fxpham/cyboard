describe('Test 3', () => {
  it('Test 3', () => {
    cy.visit('https://example.cypress.io');
    cy.wait(6000);
    cy.screenshot('test3-screenshot');
  })
})
