const puppeteer = require('puppeteer');

async function login(page) {
  const loginInputSelector = '[name="username"]';
  const passwordInputSelector = '[name="password"]';

  await page.waitForSelector(loginInputSelector, { visible: true });
  await page.waitForSelector(passwordInputSelector, { visible: true });

  await page.type(loginInputSelector, process.env.PIPEFY_EMAIL);
  await page.type(passwordInputSelector, process.env.PIPEFY_PASSWORD);

  await Promise.all([
    page.click('[type="submit"'),
    page.waitForNavigation({
      waitUntil: 'networkidle2',
    }),
  ]);

  const pipeCardSelector = '.pp-grid-cell.span-1.pp-pipe-box-toggler';
  await page.waitForSelector(pipeCardSelector, { visible: true });
}


async function sendToEmail(page, reportId) {
  const exportReportButtonSelector = '[data-testid="report-export"]';
  const sendReportToEmailButtonSelector = '[title="Email"]';

  await page.goto(
    `https://app.pipefy.com/pipes/301706843/reports_v2/${reportId}`
  );
  console.log(`Accessing https://app.pipefy.com/pipes/301706843/reports_v2/${reportId}`);

  await page.waitForSelector(exportReportButtonSelector, { visible: true });
  await page.click(exportReportButtonSelector);

  await page.waitForSelector(sendReportToEmailButtonSelector, {
    visible: true,
  });

  await page.click(sendReportToEmailButtonSelector);
  console.log('Email sended');

  await page.waitForTimeout(3000);

  await Promise.all([
    page.click('#header-logo'),
    page.waitForNavigation({
      waitUntil: 'networkidle2',
    }),
  ]);
}


async function sendReportToEmail(reportId) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1366, height: 728 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log('Accessing https://app.pipefy.com/organizations/160282');
  await page.goto('https://app.pipefy.com/organizations/160282');

  await login(page);
  console.log('Logged in');

  await sendToEmail(page, reportId);
  
  await browser.close();
}


module.exports = { sendReportToEmail };
