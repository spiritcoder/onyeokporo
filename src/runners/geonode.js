const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
const proxyChain = require("proxy-chain");

const {
  scrollToBottom,
  scrollToTop,
  performRandomClicks,
  getTimezoneByIP,
} = require("../utils/functions");
const loglogo = require("../utils/loglogo");
const getTimeStamp = require("../utils/timestamp");
const getRandomReferral = require("../utils/referral");
const getProxies = require("../utils/proxies.js");

puppeteer.use(StealthPlugin());

async function run(
  url,
  region,
  randomClicks = 10,
  numAdClicks = 1,
  trafficSource
) {
  loglogo();

  console.log(
    "\x1b[32m%s\x1b[0m",
    `${getTimeStamp()} Running traffics for ${region}`
  );
  console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()}For ${url} website`);
  console.log(
    "\x1b[32m%s\x1b[0m",
    `${getTimeStamp()} With ${randomClicks} random clicks`
  );
  console.log(
    "\x1b[32m%s\x1b[0m",
    `${getTimeStamp()} And ${numAdClicks} ad clicks`
  );
  let regionProxies = await getProxies(region);

  for (const proxy of regionProxies) {
    const ip = proxy.split(":")[0];
    const port = proxy.split(":")[1];

    const newProxy = await proxyChain.anonymizeProxy(
      "http://" + ip + ":" + port
    );

    // get the timezone of the IP
    const timezone = await getTimezoneByIP(ip);
    console.log(
      "\x1b[32m%s\x1b[0m",
      `${getTimeStamp()} Got timezone ${timezone}`
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
        "--start-maximized",
        `--timezone=${timezone}`,
      ],
    });
    const page = await browser.newPage();
    page.authenticate({
      username: "vfrkigib",
      password: "4uehmxjw6d0h",
    });

    try {
      for (let i = 1; i < 5; i++) {
        const referer = getRandomReferral(trafficSource);
        console.log(
          "\x1b[32m%s\x1b[0m",
          `${getTimeStamp()} Running the agent with ${referer} as referer`
        );
        const userAgent = randomUseragent.getRandom();
        await page.setUserAgent(userAgent);
        await page.emulateTimezone(timezone);

        console.log(
          "\x1b[32m%s\x1b[0m",
          `${getTimeStamp()} And ${userAgent} user agent`
        );
        await page.setExtraHTTPHeaders({
          referer,
          waitUntil: "domcontentloaded",
        });
        await page.goto(url);

        await scrollToBottom(page);
        await scrollToTop(page);
        await performRandomClicks(page, randomClicks, numAdClicks);

        console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()} Done ${i} times `);
      }
    } catch (error) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        `${getTimeStamp()} Error Processing new proxy: ${error.message}`
      );
    }
    console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()} ${proxy} done`);
    await browser.close();
  }

  console.log("Done");
}

module.exports = run;
