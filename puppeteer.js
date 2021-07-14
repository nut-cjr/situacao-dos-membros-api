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

async function downloadReport(page, reportId) {
  const exportReportButtonSelector = '[data-testid="report-export"]';
  const downloadReportButtonSelector = '[title="Download"]';

  await page.goto(
    `https://app.pipefy.com/pipes/301706843/reports_v2/${reportId}`
  );

  await page.waitForSelector(exportReportButtonSelector, { visible: true });
  await page.click(exportReportButtonSelector);

  await page.waitForSelector(downloadReportButtonSelector, { visible: true });
  await page.click(downloadReportButtonSelector);

  await page.waitForResponse(async (response) => {
    let downloaded;
    try {
      const response1 = await response.json();
      downloaded = response1.data.pipeReportExport.state === 'done';
      console.log(response1.data.pipeReportExport.state);
      console.log(downloaded);
    } catch {
      downloaded = false;
    }
    return (
      response.url() === 'https://app.pipefy.com/internal_api' &&
      response.status() === 200 &&
      downloaded
    );
  });

  await Promise.all([
    page.click('#header-logo'),
    page.waitForNavigation({
      waitUntil: 'networkidle2',
    }),
  ]);
}

async function downloadReports(reportsIds) {
  const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1366, height: 728 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
     });

  const page = await browser.newPage();

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: './',
  });

  await page.goto('https://app.pipefy.com/organizations/160282');

  await login(page);

  for (let index = 0; index < reportsIds.length; index++) {
    const reportId = reportsIds[index];
    await downloadReport(page, reportId);
  }

    await browser.close();

//   await page.goto('https://rafa2903.requestcatcher.com/test');

  // const fs = require('fs'); 

  // delete a file
  /*
try {
    fs.unlinkSync('[último_mês]_leads_qualificados_07-03-2021.xlsx');
    console.log("File is deleted.");
} catch (error) {
    console.log(error);
}*/




  /*
  const reportsSelector = '.sc-pZlBu';
  const links = await page.evaluate(reportsSelector => {
    const anchors = Array.from(document.querySelectorAll(reportsSelector));
    return anchors.map(anchor => {
      return anchor.href;
    });
  }, reportsSelector);
  await page.goto(links[1]);
    
  await page.waitForSelector(exportReportButtonSelector,{ visible: true});
  await page.click(exportReportButtonSelector);
  await page.waitForSelector(downloadReportButtonSelector,{ visible: true});
  await page.click(downloadReportButtonSelector);
  
  
  await page.waitForResponse(
    async (response) => {
      let downloaded;
      try {
        const response1 = await response.json();
        downloaded = response1.data.pipeReportExport.state === 'done';
        console.log(response1.data.pipeReportExport.state);
        console.log(downloaded);
      } catch {
        downloaded = false;
      }
      return response.url() === 'https://app.pipefy.com/internal_api' && response.status() === 200 && downloaded;
    }
    );
    await Promise.all([
      page.click('[slug="reports"]'),
      page.waitForNavigation({
        waitUntil: 'networkidle2',
      }),
    ]);
  
    await page.goto(links[2]);
    
    await page.waitForSelector(exportReportButtonSelector,{ visible: true});
    await page.click(exportReportButtonSelector);
  
    await page.waitForSelector(downloadReportButtonSelector,{ visible: true});
    await page.click(downloadReportButtonSelector);
    
    
    await page.waitForResponse(
      async (response) => {
        let downloaded;
        try {
          const response1 = await response.json();
          downloaded = response1.data.pipeReportExport.state === 'done';
          console.log(response1.data.pipeReportExport.state);
          console.log(downloaded);
        } catch {
          downloaded = false;
        }
        return response.url() === 'https://app.pipefy.com/internal_api' && response.status() === 200 && downloaded;
      }
      );
      await Promise.all([
        page.click('[slug="reports"]'),
        page.waitForNavigation({
          waitUntil: 'networkidle2',
        }),
      ]);
    
      await page.goto(links[3]);
    
      await page.waitForSelector(exportReportButtonSelector,{ visible: true});
      await page.click(exportReportButtonSelector);
    
      await page.waitForSelector(downloadReportButtonSelector,{ visible: true});
      await page.click(downloadReportButtonSelector);
      
      
      await page.waitForResponse(
        async (response) => {
          let downloaded;
          try {
            const response1 = await response.json();
            downloaded = response1.data.pipeReportExport.state === 'done';
            console.log(response1.data.pipeReportExport.state);
            console.log(downloaded);
          } catch {
            downloaded = false;
          }
          return response.url() === 'https://app.pipefy.com/internal_api' && response.status() === 200 && downloaded;
        }
        );
  
        await Promise.all([
          page.click('[slug="reports"]'),
          page.waitForNavigation({
            waitUntil: 'networkidle2',
          }),
        ]);
        await page.goto(links[4]);
    
        await page.waitForSelector(exportReportButtonSelector,{ visible: true});
        await page.click(exportReportButtonSelector);
      
        await page.waitForSelector(downloadReportButtonSelector,{ visible: true});
        await page.click(downloadReportButtonSelector);
        
        
        await page.waitForResponse(
          async (response) => {
            let downloaded;
            try {
              const response1 = await response.json();
              downloaded = response1.data.pipeReportExport.state === 'done';
              console.log(response1.data.pipeReportExport.state);
              console.log(downloaded);
            } catch {
              downloaded = false;
            }
            return response.url() === 'https://app.pipefy.com/internal_api' && response.status() === 200 && downloaded;
          }
          );
    
          await Promise.all([
            page.click('[slug="reports"]'),
            page.waitForNavigation({
              waitUntil: 'networkidle2',
            }),
          ]);*/

  //await page.goto('https://app.pipefy.com/pipes/581467/reports_v2/124979');

  // await page.waitForNavigation();

  /*
  await page.waitForSelector(exportReportButtonSelector,{ visible: true});
  await page.click(exportReportButtonSelector);
  await page.waitForSelector(downloadReportButtonSelector,{ visible: true});
  await page.click(downloadReportButtonSelector);
  await page.goto('https://app.pipefy.com/pipes/581467/reports_v2/124984');
  
  await page.waitForSelector(exportReportButtonSelector,{ visible: true});
  await page.click(exportReportButtonSelector);
  await page.waitForSelector(downloadReportButtonSelector,{ visible: true});
  await page.click(downloadReportButtonSelector);*/

  /*
  await page.goto('https://app.pipefy.com/pipes/581467/reports_v2/124985');
  await page.goto('https://app.pipefy.com/pipes/581467/reports_v2/133951');*/
  
  

}

module.exports = { downloadReports };