const axios = require('axios').default;
const HTMLParser = require('node-html-parser');
const ExcelJS = require('exceljs');
const { google } = require('googleapis');


function authenticate() {
  const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  auth.authorize((error) => {
    if (error) throw error;
  });

  return auth;
}

async function updateSpreadsheet(newData) {
  const auth = authenticate();
  const googleAPI = google.sheets({ version: 'v4', auth });

  const clearOptions = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'Situação!A1:E100',
  };

  await googleAPI.spreadsheets.values.clear(clearOptions);
  console.log('Speadsheet cleared');

  const updateOptions = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'Situação!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: newData },
  };

  await googleAPI.spreadsheets.values.update(updateOptions);
  console.log('Spreadsheets updated');
}

function getReportUrl(htmlEmail) {
  const root = HTMLParser.parse(htmlEmail);

  const url = root
    .querySelectorAll('a')
    .filter((element) => element.text === 'Download report')[0]
    .getAttribute('href');

  console.log('Report URL: ' + url);
  return url;
}

async function getReportData(url) {
  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer',
    });

    var data = new Uint8Array(response.data);

    let workbook = new ExcelJS.Workbook();
    workbook = await workbook.xlsx.load(data);

    const worksheet = workbook.worksheets[0];

    let sheetValues = worksheet.getSheetValues();
    sheetValues = sheetValues.slice(1);
    sheetValues = sheetValues.map((row) => row.slice(1));

    return sheetValues;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { updateSpreadsheet, getReportUrl, getReportData };
