const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const getProxies = require("./src/packetstream/getpacketstreamproxies");
const proxyChain = require("proxy-chain");


puppeteer.use(StealthPlugin());

const { clickAdsterraAd } = require("./src/utils/functions");

async function runTest() {
  let regionProxies = await getProxies("all");
  const proxy = regionProxies[0];
  const [username, password, host, port] = proxy.split(":");

  const newProxy = await proxyChain.anonymizeProxy(`http://${host}:${port}`);
  console.log(newProxy)
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--proxy-server=${newProxy}`,
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

  await page.authenticate({ username, password });

  await page.setExtraHTTPHeaders({
    waitUntil: "domcontentloaded",
  });
  await page.goto(
    "https://toplistranker.com/university-of-london-goldsmiths-scholarships-2024-uk/"
  );
  await clickAdsterraAd(page);
  await page.waitForTimeout(5000);
}

runTest();
