const { gql } = require('graphql-request');

const allCardsQuery = gql`
  query ($pipeId: ID!) {
    allCards(pipeId: $pipeId) {
      edges {
        node {
          id
          fields {
            name
            value
          }
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

module.exports = { allCardsQuery, cardByIdQuery };
