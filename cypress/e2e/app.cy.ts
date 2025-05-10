import boroughChart from '../fixtures/borough/chart.json';
import boroughTimeframe from '../fixtures/borough/timeframe.json';
import boroughTopline from '../fixtures/borough/topline.json';

describe('Render', () => {
  it('should render the home page', () => {
    cy.visit('http://localhost:3000/');

    cy.get('h1').contains('Citi Bike Station Data');
  })

  it('should show the FAQ', () => {
    cy.visit('http://localhost:3000/');

    // open it
    cy.get('button').contains('FAQ').click();

    cy.get('h2').contains('Frequently Asked Questions');

    // and close it
    cy.get('button').contains('Back').click();

    cy.contains('h2', 'Frequently Asked Questions').should('not.exist');
  });

  describe('borough', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/timeframe*', {
        statusCode: 200,
        body: boroughTimeframe,
      }).as('timeframe');

      cy.intercept('GET', '/api/chart*', {
        statusCode: 200,
        body: boroughChart,
      }).as('chart');

      cy.intercept('GET', '/api/topline*', {
        statusCode: 200,
        body: boroughTopline,
      }).as('topline');
    });

    it('should render borough data', () => {
      cy.visit('http://localhost:3000/');

      cy.get("button[value='borough']").click();
      cy.get('#borough-options')
        .parent()
        .click()
        .get("ul > li[data-value='Brooklyn']")
        .click();

      // nuqs
      cy.url().should('include', '?view=borough&borough=Bronx');

      // topline
      cy.contains('Stations in Brooklyn have been used 8,729,291 times between May 2020 and April 2025.');

      cy.contains('145,488'); // uses per month
      cy.contains('4,796'); // uses per day
      cy.contains('82%'); // on ebikes
    });

    it('should render the advanced data', () => {
      cy.visit('http://localhost:3000/');

      cy.get("button[value='borough']").click();
      cy.get('#borough-options')
        .parent()
        .click()
        .get("ul > li[data-value='Brooklyn']")
        .click();


      // expand the advanced data
      cy.get('button').contains('Show more data').click();

      // test that the chart at least rendered
      cy.get('.recharts-cartesian-grid'); // not sure how to test better than this

      // click over to the table
      cy.get('button').contains('Table').click();

      // just one of the cells
      cy.contains('24,529');
    });
  })

  describe('with params', () => {
    cy.visit('https://www.citibikedata.nyc/?view=borough&borough=Bronx');

    cy.contains('145,488'); // uses per month
    cy.contains('4,796'); // uses per day
    cy.contains('82%'); // on ebikes
  });
});
