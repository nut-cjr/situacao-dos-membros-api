require('dotenv').config()
const express = require('express')
const cors = require('cors')

const {
    deleteAllCards,
    deleteCard,
    moveCardToPhase,
    getCardIdByEmail,
    getCardData,
    updateFieldsValues,
    getPipeLabels,
    updateLabels,
} = require('./requests')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.set('trust proxy', 1)

const PHASES_ID = {
    Folga: 310223785,
    Férias: 310223778,
    'Só para projetos': 310223771,
    Afastamento: 310223786,
    'Sair da empresa': 310547859,
}

const PIPE_ID = 301538945

app.post('/solicitation', async (req, res) => {
    try {
        const solicitationCardId = req.body.data.card.id
        const { fields } = await getCardData(solicitationCardId)

        const email = fields.find((field) => field.name === 'Email CJR').value
        const intention = fields.find(
            (field) => field.name === 'Qual sua intenção?'
        ).value
        const intentionPhaseId = PHASES_ID[intention]

        let labelsIds = []

        if (intention === 'Atualizar informações sobre núcleo') {
            const labels = await getPipeLabels(PIPE_ID)
            const { value } = fields.find((field) => field.name === 'Núcleo(s)')
            labelsIds = labels
                .filter((label) => value.includes(label.name))
                .map((label) => Number(label.id))
        }

        const cardId = await getCardIdByEmail(PIPE_ID, email)

        if (intention === 'Só para projetos' || intention === 'Afastamento') {
            await moveCardToPhase(cardId, intentionPhaseId)
        }

        if (intention !== 'Sair da empresa' && intention !== 'Só para projetos')
            await updateFieldsValues(cardId, intention, fields, labelsIds)

        if (intention === 'Atualizar informações sobre núcleo');
        await updateLabels(cardId, labelsIds)
    } catch (error) {
        console.error(error)
    }

    return res.status(200).json({ success: 'success' })
})

app.get('/test', async (req, res) => {
    console.log('teste')
    return res.status(200).json({ success: 'success' })
})

app.listen(process.env.PORT || 4000, () => {
    console.log('app listening on port 4000')
})
