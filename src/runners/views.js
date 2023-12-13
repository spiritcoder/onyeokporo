const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
const proxyChain = require("proxy-chain");
var fs = require("fs");
const getTimeStamp = require("../utils/timestamp");
const loglogo = require("../utils/loglogo");
const { scrollToTop, scrollToBottom, clickRandomLink } = require("../utils/functions");
const getRandomReferral = require("../utils/referral");

puppeteer.use(StealthPlugin());

async function run(url) {
  loglogo();
  // await Promise.all([pullProxies()]);

  var text = fs.readFileSync(__dirname + "/../proxies/http.txt", "utf-8");

  var proxies = text.split("\n");

  for (const proxy of proxies) {
    const ip = proxy.split(":")[0];
    const port = proxy.split(":")[1];

    const newProxy = await proxyChain.anonymizeProxy(
      "http://" + ip + ":" + port
    );
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--proxy-server=${newProxy}`, "--no-sandbox"],
       executablePath: '/usr/bin/google-chrome',
    });
    const page = await browser.newPage();
    page.authenticate({
      username: "vfrkigib",
      password: "4uehmxjw6d0h",
    });
    try {

      for (let i = 0; i <= 10; i++) {
        await page.setUserAgent(randomUseragent.getRandom());
        await page.setExtraHTTPHeaders({
          referer: getRandomReferral(),
          waitUntil: "domcontentloaded",
        });
        await page.goto(url);

        await scrollToBottom(page);
        await scrollToTop(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
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

