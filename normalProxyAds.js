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
  pullProxies,
  clickRandomLinkAndAd,
} = require("./functions");
const loglogo = require("./loglogo");
const getTimeStamp = require("./utility");

puppeteer.use(StealthPlugin());

async function run() {
  loglogo();
  // await Promise.all([pullProxies()]);

  const referrals = fs.readFileSync("./referrals.txt", "utf-8").split("\n");

  var text = fs.readFileSync("./http.txt").toString("utf-8");
  var proxies = text.split("\n");

  for (const proxy of proxies) {
    const ip = proxy.split(":")[0];
    const port = proxy.split(":")[1];

    const newProxy = await proxyChain.anonymizeProxy(
      "http://" + ip + ":" + port
    );
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--proxy-server=${newProxy}`],
      executablePath:
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    });
    const page = await browser.newPage();
    // page.authenticate({
    //   username: "vfrkigib",
    //   password: "4uehmxjw6d0h",
    // });
    try {
      const referer = referrals[Math.floor(Math.random() * referrals.length)];



      for (let i = 1; i < 5; i++) {
        await page.setUserAgent(randomUseragent.getRandom());
        await page.setExtraHTTPHeaders({
          referer,
          waitUntil: "domcontentloaded",
        });
        // await page.goto("https://entclassblog.com/");
        // await page.goto("https://moneywisehacks.com/");
        await page.goto("https://foreviral.com/");
        // await page.goto("https://whoer.com/");
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

  // console.log done
  console.log("Done");
}
module.exports = run;
