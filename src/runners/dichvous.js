const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
var fs = require("fs");

const {
  scrollToBottom,
  scrollToTop,
  clickRandomLink,
  clickAd,
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
  var text = fs.readFileSync(__dirname + "/../proxies/httpsocks.txt", "utf-8");

  var proxies = text.split("\n");

  for (const proxy of proxies) {
    const ip = proxy.split(":")[0];
    const port = proxy.split(":")[1];
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--proxy-server=socks5://${ip}:${port}`,  "--no-sandbox"],
      executablePath: '/usr/bin/google-chrome',
    });
    const page = await browser.newPage();
    try {
      await page.setUserAgent(randomUseragent.getRandom());
      await page.setExtraHTTPHeaders({
        referer: getRandomReferral(),
        waitUntil: "domcontentloaded",
      });
      await page.goto(url);

      for (let i = 0; i <= 5; i++) {
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

        await clickRandomLink(page);
        await clickRandomLinkAndAd(page);
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
