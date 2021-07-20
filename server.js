require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
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
app.set('trust proxy', 1);

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

    const email = fields.find((field) => field.name === 'Email CJR').value;
    const intention = fields.find(
      (field) => field.name === 'Qual sua intenção?'
    ).value;
    const intentionPhaseId = phasesId[intention];

    const pipeId = 301706843;
    const cardId = await getCardId(pipeId, email);

    if (intention !== 'Atualizar informações sobre estágio')
      await moveCardToPhase(cardId, intentionPhaseId);

    if (intention !== 'Sair da empresa' && intention !== 'Só para projetos')
      await updateFieldsValues(cardId, intention, fields);
    //await deleteCard(solicitationCardId);
  } catch (error) {
    console.error(error);
  }

  return res.status(200).json({ success: 'success' });
});

const reportUpdatedLimiter = rateLimit({
  windowMs: 60000, // 60 seconds
  max: 1, // 1 request per minute
  message: 'More than 1 request per minute',
});

app.post('/report_updated', reportUpdatedLimiter, async (req, res) => {
  res.status(200).send();
  await sendReportToEmail(process.env.REPORT_ID);
  console.log('send report to email finished');
  return;
});

app.post('/new_email_received', async (req, res) => {
  res.status(200).send();

  try {
    const url = getReportUrl(req.body.htmlEmail);
    const reportData = await getReportData(url);

    updateSpreadsheet(reportData);
  } catch (error) {
    console.log(error);
  }

  console.log('update spreadsheet finished');
  return;
});

app.get('/test', async (req, res) => {
  console.log('teste');
  return res.status(200).json({ success: 'success' });
});

app.listen(process.env.PORT || 4000, () => {
  console.log('app listening on port 4000');
});
