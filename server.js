require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios').default;
const XLSX = require('xlsx');
const HTMLParser = require('node-html-parser');
const ExcelJS = require('exceljs');
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
  'Sair da empresa': 311317662,
};

const reportsIds = {
  dados_membros: 300215708,
  situacao_dos_membros: 300215709,
  aniversarios: 300215710,
};

const html = `<div dir="ltr"><br><br><div class="gmail_quote"><div dir="ltr" class="gmail_attr">---------- Forwarded message ---------<br>De: <strong class="gmail_sendername" dir="auto">Pipefy</strong> <span dir="auto">&lt;<a href="mailto:messages@email.pipefy.com">messages@email.pipefy.com</a>&gt;</span><br>Date: qua., 14 de jul. de 2021 às 16:42<br>Subject: Your report was successfully exported<br>To:  &lt;<a href="mailto:nut@cjr.org.br">nut@cjr.org.br</a>&gt;<br></div><br><br>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:17px;line-height:24px;color:#293e52;background:#e6ecf5;font-family:helvetica,arial,sans-serif">
  <tbody>
    <tr>
      <td valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tbody>
            <tr>
              <td valign="bottom" style="padding:32px 0 21px">
                <div style="max-width:600px;margin:0 auto;text-align:center">
                  <a href="https://link.pipefy.com/ls/click?upn=-2FwZ-2Fb-2BlSHVJp-2B1ZBg98sbbG1SjPSbIvdYjsn6R4YMSQ-3DsvLJ_41z2n5pLlONFJZnpDhPbndzj-2Bqc-2FbMn4rPIXyy8LiIyYLHtUnIeHwvMgEDGmySaXeuySrAKEfThw14RdQVNtV6acj-2FazpSvjJXhGEA0rf8BTB-2FB69zm7-2FK2kMWNC7M8NsHYzgFRP-2FRWXuSLclRRkb1nuPpZZY1ror2Yo1IHvbL-2BdQH3s916Uq9FjJC2SM1TQEgy2VwIE33RxYDalsPSxFw-3D-3D" target="_blank">
                    <img src="https://pipestyle.staticpipefy.com/default/images/logo-black.png" style="width:110px">
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
          <tbody>
            <tr>
              <td valign="top">
                <div style="max-width:600px;margin:0 auto;padding:0 12px">
                  <div style="background:#fff;border-radius:5px;padding:32px;margin-bottom:16px">

                    <h2 style="color:#21c5ed;margin:0 0 12px;line-height:30px;text-align:center">
  Your XLSX export of NUT - Membros CJR is ready to be downloaded
</h2>

<hr style="margin:1.5rem 0;width:100%;border:none;border-bottom:1px solid #ececec">

<a style="font-weight:bold;color:white;background:#00c5ef;padding:10px 15px;border-radius:4px;text-align:center;text-decoration:none;display:block;margin:0 auto;width:106px" href="https://link.pipefy.com/ls/click?upn=TgWePD8ytSjAIHg98O4xmeslu7xsILFL-2BovvNLsWVjdq9Xsw-2Fs0QwNDluaXxy2uzoFIMOiXRyYW63uBD-2FxbnBR5Wxf1n97r4s9csfy96fIJa9FJorp0iD9nVkaaTwvCdt14n4ZoT4OWjBB8dux-2BUPR1AwpChrCh5YWnyBtEBbfOqKMGNMT7ODp9-2BS-2FACexwwFVrO8v-2BrnhU0KiBP34l18spvaK1wDEew1hvQ8BmS9KEtMopNFTEufAWcbqLmXrlUHFR4GhAyBp3iKfGUUjWwsj4QS5HsbJl9p2-2FqUd2CX6sxVBUS-2FeJPqCRXp8OAXqVkEqZtFqe5MGKBkzQ8eYfMfw-2FjX3zZrXrtQv14SGyJqTc-3D-2N0_41z2n5pLlONFJZnpDhPbndzj-2Bqc-2FbMn4rPIXyy8LiIyYLHtUnIeHwvMgEDGmySaXpRmZDs29xbWM962bfH-2BX1ev-2F2tMqARR-2F-2FOGFPuGdZtpgfEfN1uUpPxLK5W7JbEAqBQ5dCxfIGo-2FmFsySsegHZ2gYBGLgTwK38P90lZbv2hMwZu0fRO6ZCTCmc7-2BW0eR-2FI2ATH3BwVGRbtsSB0vOQHQ-3D-3D" target="_blank">Download report</a>


                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:16px;background:#fff;color:#9aaabe">
          <tbody>
            <tr>
              <td valign="top" align="center">
                <div style="max-width:600px;margin:0 auto">
                  <p style="margin-top:16px;font-size:12px;line-height:20px">
                    Powered by <a href="https://link.pipefy.com/ls/click?upn=TgWePD8ytSjAIHg98O4xmQN0Udsu4-2FxKbsmBIFa1jFGKwVhA-2FhjmwndxURGKt6Nqw1ql5Dyt1wnk6g4z6j6Wvw-3D-3DDaKR_41z2n5pLlONFJZnpDhPbndzj-2Bqc-2FbMn4rPIXyy8LiIyYLHtUnIeHwvMgEDGmySaXJFs3u7KTuUb51VuWtv3hoVJPbQB7LWfqgwdWeYxgcpkdwXLBMI-2BZTlKLHValJruLajvigkjD5yn2snJmNOH5qyY-2B2gOpHo4wV70veBmdshhT7xugsF3Wavsd-2BlzAocL9xFzfgIY17Hd3vKHWI2spfA-3D-3D" style="font-weight:bold;color:#3b5bfd;text-decoration:none" target="_blank"><span>Pipefy</span></a>
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
<img src="https://link.pipefy.com/wf/open?upn=DmBnUM0glMtBA1zXBKAP7qfR3D6iiuUQzWZ8KLRd8QXbaH-2BK6icvg82Kq-2F4lItbWivUkHot3x11QKsH-2FOw1sovIr7wFghlhR1mMcHP6S3ah8z-2FMAyKHLgYvdh29mxAtS9FepeQHIfxQ2uiYO65ukwWcZiIAyGrULSPlg2UxduCjqcAV9qn3LcntPB-2Bs83Ivr6-2FMMSI-2BijEekKoQb9EwK9r-2FMl-2F5-2FMSnn-2B-2FsQoI6A-2BnA-3D" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important">
</div></div>`;

var root = HTMLParser.parse(html);

const url = root
  .querySelectorAll('a')
  .filter((element) => element.text === 'Download report')[0]
  .getAttribute('href');

axios({
  method: 'get',
  url,
  responseType: 'arraybuffer',
})
  .then(async (response) => {
    var data = new Uint8Array(response.data);

    let workbook = new ExcelJS.Workbook();
    workbook = await workbook.xlsx.load(data);

    const worksheet = workbook.worksheets[0];

    let sheetValues = worksheet.getSheetValues();
    sheetValues = sheetValues.slice(1);
    sheetValues = sheetValues.map((row) => row.slice(1));
    console.log(sheetValues);
  })
  .catch((error) => {
    console.log(error);
  });

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

    if (intention !== 'Sair da empresa')
      await updateFieldsValues(cardId, intention, fields);

    await deleteCard(solicitationCardId);
  } catch (error) {
    console.error(error);
  }

  return res.status(200).json({ success: 'success' });
});

app.post('/card_moved', async (req, res) => {
  await downloadReports([
    reportsIds.aniversarios,
    reportsIds.situacao_dos_membros,
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

app.get('/test', async (req, res) => {
  console.log('get teste');
  res.status(200).end();

  await downloadReports([reportsIds.situacao_dos_membros]);
});

app.listen(process.env.PORT || 4000, function () {
  console.log('app listening on port 4000');
});
