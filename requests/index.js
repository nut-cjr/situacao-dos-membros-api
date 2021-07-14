const { GraphQLClient } = require('graphql-request');

const {
  allCardsQuery,
  cardByIdQuery,
  cardByTitleQuery,
} = require('../queries');

const {
  deleteCardMutation,
  moveCardToPhaseMutation,
  generateUpdateFieldsValuesMutation,
} = require('../mutations');

const client = new GraphQLClient('https://api.pipefy.com/graphql', {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + process.env.PIPEFY_API_TOKEN,
  },
});

function deleteAllCards() {
  const query = allCardsQuery;

  client.request(query).then((data) => {
    const cards = data.allCards.edges;

    cards.forEach((card) => {
      const mutation = deleteCardMutation;
      const variables = { cardId: card.node.id };
      client.request(mutation, variables);
    });
  });
}

async function deleteCard(cardId) {
  const mutation = deleteCardMutation;
  const variables = { cardId };

  try {
    await client.request(mutation, variables);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function moveCardToPhase(cardId, destinationPhaseId) {
  const mutation = moveCardToPhaseMutation;
  const variables = { cardId, destinationPhaseId };

  try {
    await client.request(mutation, variables);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getCardId(title) {
  const query = cardByTitleQuery;
  const variables = { title };
  let data;

  try {
    data = await client.request(query, variables);
  } catch (error) {
    throw new Error(error.message);
  }

  return data.cards.edges[0].node.id;
}

async function getCardData(cardId) {
  const query = cardByIdQuery;
  const variables = { cardId };
  let data;

  try {
    data = await client.request(query, variables);
  } catch (error) {
    throw new Error(error.message);
  }

  return data.card;
}

function feriasOrFolgaValues(intention, fields) {
  const numberInId = intention == 'Férias' ? 1 : 2;

  const values = `[{
        fieldId: "data_de_in_cio_${numberInId}",
        value: "${
          fields.filter((field) => field.name === 'Data de início')[0].value
        }"
    }, {
        fieldId: "data_de_retorno_${numberInId}",
        value: "${
          fields.filter((field) => field.name === 'Data de retorno')[0].value
        }"
    }, {
        fieldId: "voc_falou_com_seu_gerente_e_ou_l_der_${numberInId}",
        value: "${
          fields.filter(
            (field) => field.name === 'Você falou com seu gerente e/ou líder?'
          )[0].value
        }"
    }]`;

  return values;
}

async function updateFieldsValues(cardId, intention, fields) {
  let values;
  switch (intention) {
    case 'Folga':
      values = feriasOrFolgaValues('Folga', fields);
      break;
    case 'Férias':
      values = feriasOrFolgaValues('Férias', fields);
      break;
    case 'Só para projetos':
      values = `[{
                fieldId: "motivo_1",
                value: "${
                  fields.filter((field) => field.name === 'Justifique')[0].value
                }"
            }]`;
      break;
    case 'Afastamento':
      values = `[{
                fieldId: "motivo",
                value: "${
                  fields.filter((field) => field.name === 'Justifique')[0].value
                }"
            }, {
                fieldId: "data_de_in_cio_3",
                value: "${new Date().toLocaleDateString('pt-BR')}"
            }]`;
      break;

    default:
      break;
  }

  const mutation = generateUpdateFieldsValuesMutation(values);
  const variables = { cardId };

  try {
    await client.request(mutation, variables);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  deleteAllCards,
  deleteCard,
  moveCardToPhase,
  getCardId,
  getCardData,
  updateFieldsValues,
};
