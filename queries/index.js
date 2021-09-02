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

const getLabelsQuery = gql`
  query ($pipeId: ID!){
    pipe(id: $pipeId) {
      labels {
        id
        name
      }
    }
  }
`;


module.exports = { allCardsQuery, cardByIdQuery, getLabelsQuery };
