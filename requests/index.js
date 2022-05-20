const { GraphQLClient } = require('graphql-request')

const { allCardsQuery, cardByIdQuery, getLabelsQuery } = require('../queries')

const {
    deleteCardMutation,
    moveCardToPhaseMutation,
    generateUpdateFieldsValuesMutation,
    updateLabelsMutation,
} = require('../mutations')

const client = new GraphQLClient('https://api.pipefy.com/graphql', {
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.PIPEFY_API_TOKEN,
    },
})

function deleteAllCards() {
    const query = allCardsQuery
    let variables = { pipeId: 301706843 }

    client.request(query, variables).then((data) => {
        const cards = data.allCards.edges

        cards.forEach((card) => {
            const mutation = deleteCardMutation
            variables = { cardId: card.node.id }
            client.request(mutation, variables)
        })
    })
}

async function deleteCard(cardId) {
    const mutation = deleteCardMutation
    const variables = { cardId }

    await client.request(mutation, variables)
}

async function moveCardToPhase(cardId, destinationPhaseId) {
    const mutation = moveCardToPhaseMutation
    const variables = { cardId, destinationPhaseId }

    await client.request(mutation, variables)
}

async function getAllCards(pipeId) {
    const query = allCardsQuery
    const variables = { pipeId }

    const data = await client.request(query, variables)

    return data.allCards.edges
}

async function getCardIdByEmail(pipeId, email) {
    const getEmailField = (fields) =>
        fields.filter((field) => field.name === 'Email da CJR')[0]

    const cards = await getAllCards(pipeId)
    const card = cards.filter(
        (card) => getEmailField(card.node.fields)?.value === email
    )[0]
    const cardId = card.node.id
    return cardId
}

async function getCardData(cardId) {
    const query = cardByIdQuery
    const variables = { cardId }

    const data = await client.request(query, variables)

    return data.card
}

async function getPipeLabels(pipeId) {
    const query = getLabelsQuery
    const variables = { pipeId }

    const data = await client.request(query, variables)

    return data.pipe.labels
}

async function updateLabels(cardId, labelsIds) {
    const mutation = updateLabelsMutation
    const variables = { cardId, labelsIds }

    await client.request(mutation, variables)
}

async function updateFieldsValues(cardId, intention, fields, labelsIds) {
    let values
    switch (intention) {
        case 'Folga':
            values = `[{
        fieldId: "data_de_in_cio_2",
        value: "${
            fields.filter((field) => field.name === 'Data de início')[0].value
        }"
    }, {
        fieldId: "data_de_retorno_2",
        value: "${
            fields.filter((field) => field.name === 'Data de retorno')[0].value
        }"
    }, {
        fieldId: "voc_falou_com_seu_gerente_e_ou_l_der_1",
        value: "${
            fields.filter(
                (field) =>
                    field.name === 'Você falou com seu gerente e/ou líder?'
            )[0].value
        }"
    }]`
            break
        case 'Férias':
            values = `[{
        fieldId: "data_de_in_cio",
        value: "${
            fields.filter((field) => field.name === 'Data de início')[0].value
        }"
    }, {
        fieldId: "data_de_retorno",
        value: "${
            fields.filter((field) => field.name === 'Data de retorno')[0].value
        }"
    }, {
        fieldId: "voc_falou_com_seu_gerente_e_ou_l_der",
        value: "${
            fields.filter(
                (field) =>
                    field.name === 'Você falou com seu gerente e/ou líder?'
            )[0].value
        }"
    }]`
            break
        case 'Afastamento':
            values = `[{
                fieldId: "data_de_in_cio_1",
                value: "${new Date().toLocaleDateString('pt-BR')}"
            }]`
            break
        case 'Atualizar informações sobre estágio':
            values = `[{
                fieldId: "faz_est_gio",
                value: "${
                    fields.filter((field) => field.name === 'Faz estágio?')[0]
                        .value
                }"
            }]`
            break
        case 'Atualizar informações sobre núcleo':
            values = `[{
        fieldId: "n_cleo",
        value: [${labelsIds}]
      }]`
            break
        default:
            break
    }

    const mutation = generateUpdateFieldsValuesMutation(values)
    const variables = { cardId }

    await client.request(mutation, variables)
}

module.exports = {
    deleteAllCards,
    deleteCard,
    moveCardToPhase,
    getCardIdByEmail,
    getCardData,
    updateFieldsValues,
    getPipeLabels,
    updateLabels,
}
