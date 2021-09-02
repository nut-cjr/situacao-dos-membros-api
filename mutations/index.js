const { gql } = require('graphql-request');

const deleteCardMutation = gql`
  mutation ($cardId: ID!) {
    deleteCard(input: { id: $cardId }) {
      clientMutationId
      success
    }
  }
`;

const moveCardToPhaseMutation = gql`
  mutation ($cardId: ID!, $destinationPhaseId: ID!) {
    moveCardToPhase(
      input: { card_id: $cardId, destination_phase_id: $destinationPhaseId }
    ) {
      clientMutationId
    }
  }
`;

function generateUpdateFieldsValuesMutation(values) {
  return gql`
  mutation ($cardId: ID!) {
    updateFieldsValues(input: { nodeId: $cardId, values: ${values} }) {
      clientMutationId
    }
  }
  `;
}

const updateLabelsMutation = gql`
  mutation ($cardId: ID!, $labelsIds: [ID!]) {
    updateCard(input: {
      id: $cardId
      label_ids: $labelsIds
    }) {
      clientMutationId
    }
  }
`;

module.exports = {
  deleteCardMutation,
  moveCardToPhaseMutation,
  generateUpdateFieldsValuesMutation,
  updateLabelsMutation
};
