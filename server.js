require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const {
  deleteAllCards,
  deleteCard,
  moveCardToPhase,
  getCardId,
  getCardData,
  updateFieldsValues,
} = require('./requests');
const { downloadReports } = require('./puppeteer');

const app = express();
app.use(express.json());
app.use(cors());

const phasesId = {
  Folga: 311317647,
  Férias: 311317648,
  'Só para projetos': 311317653,
  Afastamento: 311317654,
  'Sair da empresa': 311317662
};

const reportsIds = {
  dados_membros: 300215708,
  situacao_dos_membros: 300215709,
  aniversarios: 300215710,
};

// console.log(path.dirname(process.cwd()));
// console.log(path.resolve('./'));
// console.log(__dirname);
// console.log(__filename);

// deleteAllCards();
 
// downloadReports([
//   reportsIds.aniversarios,
//   reportsIds.situacao_dos_membros,
//   reportsIds.dados_membros,
// ]);

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

    await updateFieldsValues(cardId, intention, fields);
    await deleteCard(solicitationCardId);
  } catch (error) {
    console.error(error);
  }

  return res.status(200).json({ success: 'success' });
});

app.post('/card_moved', async (req, res) => {
  await downloadReports([reportsIds.aniversarios, reportsIds.situacao_dos_membros]);

  fs.readdir(__dirname, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory:' + err);
    } 
    files.forEach(function (file) {
        console.log(file); 
    });
});

  return res.status(200).json({ success: 'success' });
});

app.post('/card_create', async (req, res) => {
  await downloadReports([
    reportsIds.aniversarios,
    reportsIds.situacao_dos_membros,
    reportsIds.dados_membros,
  ]);

  fs.readdir(__dirname, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory:' + err);
    } 
    files.forEach(function (file) {
        console.log(file); 
    });
});

  return res.status(200).json({ success: 'success' });
});

app.post('/card_field_update', async (req, res) => {
  await downloadReports([ 
    reportsIds.aniversarios,
    reportsIds.situacao_dos_membros,
    reportsIds.dados_membros,
  ]);

  fs.readdir(__dirname, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        console.log(file); 
    });
});

  return res.status(200).json({ success: 'success' });
});

app.get('/test', function (req, res) {
  console.log('get teste');
  return res.status(200).json({ success: 'success' });
});

app.listen(process.env.PORT || 4000, function () {
  console.log('app listening on port 4000');
});