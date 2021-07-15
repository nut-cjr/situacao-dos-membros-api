require('dotenv').config();
const express = require('express');
const cors = require('cors');

const {
  deleteAllCards,
  deleteCard,
  moveCardToPhase,
  getCardId,
  getCardData,
  updateFieldsValues,
} = require('./requests');
const {
  updateSpreadsheet,
  getReportUrl,
  getReportData,
} = require('./spreadsheet');
const { sendReportToEmail } = require('./puppeteer');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const phasesId = {
  Folga: 311317647,
  Férias: 311317648,
  'Só para projetos': 311317653,
  Afastamento: 311317654,
  'Sair da empresa': 311317662,
};

app.post('/solicitation', async (req, res) => {
  try {
    const solicitationCardId = req.body.data.card.id;
    const { fields } = await getCardData(solicitationCardId);

    const name = fields.find((field) => field.name === 'Nome').report_value;
    const intention = fields.find(
      (field) => field.name === 'Qual sua intenção?'
    ).value;
    const intentionPhaseId = phasesId[intention];

    const cardId = await getCardId(name);

    if (intention !== 'Atualizar informações sobre estágio')
      await moveCardToPhase(cardId, intentionPhaseId);

    if (intention !== 'Sair da empresa')
      await updateFieldsValues(cardId, intention, fields);

    await deleteCard(solicitationCardId);
  } catch (error) {
    console.error(error);
  }

  return res.status(200).json({ success: 'success' });
});

app.post('/report_updated', async (req, res) => {
  res.status(200).send();
  await sendReportToEmail(process.env.REPORT_ID);
});

app.post('/new_email_received', async (req, res) => {

  const url = getReportUrl(req.body.htmlEmail);
  const reportData = await getReportData(url);

  res.status(200).send();

  try {
    updateSpreadsheet(reportData);
  } catch (error) {
    console.log(error);
  }
});

app.get('/test', async (req, res) => {
  console.log('get teste');
  res.status(200).end();

  await sendReportToEmail(process.env.REPORT_ID);
});

app.listen(process.env.PORT || 4000, function () {
  console.log('app listening on port 4000');
});
