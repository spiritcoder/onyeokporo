const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");


puppeteer.use(StealthPlugin());

const {
    clickAdsterraAd
  } = require("./src/utils/functions");

async function runTest() {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-web-security",
          "--disable-features=IsolateOrigins",
          "--disable-site-isolation-trials",
          "--disable-infobars",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--start-maximized",
        ],
        // executablePath: '/usr/bin/google-chrome',
      });
      const page = await browser.newPage();
    
      const pages = await browser.pages();
      if (pages.length > 1) {
        await pages[0].close();
      }

      await page.setExtraHTTPHeaders({
        waitUntil: "domcontentloaded",
      });
      await page.goto("https://moneywisehacks.com/what-is-a-money-market-fund-how-to-invest-pros-cons-more/");
      await clickAdsterraAd(page);
      await page.waitForTimeout(5000);
}

runTest();
