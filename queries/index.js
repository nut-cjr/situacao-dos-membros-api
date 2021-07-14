const { gql } = require('graphql-request');

const allCardsQuery = gql`
  {
    allCards(pipeId: 301706847) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const cardByIdQuery = gql`
  query ($cardId: ID!) {
    card(id: $cardId) {
      fields {
        name
        value
        report_value
      }
    }
  }
`;

const cardByTitleQuery = gql`
  query ($title: String!) {
    cards(pipe_id: 301706843, first: 1, search: { title: $title }) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

module.exports = { allCardsQuery, cardByIdQuery, cardByTitleQuery };
