const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
var fs = require("fs");
const proxyChain = require("proxy-chain");

const {
  scrollToBottom,
  scrollToTop,
  clickRandomLink,
  clickAd,
  shuffleIPs,
  pullProxies,
  clickRandomLinkAndAd,
} = require("../utils/functions");
const loglogo = require("../utils/loglogo");
const getTimeStamp = require("../utils/timestamp");
const getRandomReferral = require("../utils/referral");

puppeteer.use(StealthPlugin());

async function run(url) {
  loglogo();
  // await Promise.all([pullProxies()]);

  var text = fs.readFileSync(__dirname + "/../proxies/http.txt", "utf-8");

  var proxies = text.split("\n");

  // shuffle proxies
  proxies = shuffleIPs(proxies);

  for (const proxy of proxies) {
    const ip = proxy.split(":")[0];
    const port = proxy.split(":")[1];

    const newProxy = await proxyChain.anonymizeProxy(
      "http://" + ip + ":" + port
    );
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        `--proxy-server=${newProxy}`,
        "--no-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
        "--disable-infobars",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
      executablePath: "/usr/bin/google-chrome",
    });
    const page = await browser.newPage();

    try {
      for (let i = 1; i < 5; i++) {
        const referer = getRandomReferral();
        await page.setUserAgent(randomUseragent.getRandom());
        await page.setExtraHTTPHeaders({
          referer,
          waitUntil: "domcontentloaded",
        });
        await page.goto(url);

        await scrollToBottom(page);
        await scrollToTop(page);
        await clickAd(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLinkAndAd(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        console.log(`${getTimeStamp()} Done ${i} times `);
      }
    } catch (error) {
      console.error(
        `${getTimeStamp()} Error Processing new proxy: ${error.message}`
      );
    }
    console.log(`${getTimeStamp()} ${proxy} done`);
    await browser.close();
  }

  console.log("Done");
}
module.exports = run;
