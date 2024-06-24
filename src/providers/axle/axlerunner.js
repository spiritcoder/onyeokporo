const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
const proxyChain = require("proxy-chain");

const {
  scrollToBottom,
  scrollToTop,
  performRandomClicks,
  getTimezoneByIP,
} = require("../../utils/functions.js");
const loglogo = require("../../utils/loglogo.js");
const getTimeStamp = require("../../utils/timestamp.js");
const getRandomReferral = require("../../utils/referral.js");
const getProxies = require("./getaxleproxies.js");
const getRandomAgent = require("../../utils/randomAgent.js");

puppeteer.use(StealthPlugin());

async function run(
  url,
  region,
  randomClicks = 10,
  numAdClicks = 1,
  trafficSource,
  deviceType,
  isGoogleAd
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
    `${getTimeStamp()}, ${numAdClicks} ad clicks`
  );

  console.log(
    "\x1b[32m%s\x1b[0m",
    `${getTimeStamp()}, And ${deviceType} devices`
  );
  let regionProxies = await getProxies(region);

  for (const proxy of regionProxies) {
    const splitProxy = proxy.split(":");
    const ip = splitProxy[0];
    const port = splitProxy[1];
    const username = splitProxy[2];
    const password = splitProxy[3];

    const newProxy = await proxyChain.anonymizeProxy(
      "http://" + ip + ":" + port
    );

    // get the timezone of the IP
    const timezone = await getTimezoneByIP(ip);
    console.log(
      "\x1b[32m%s\x1b[0m",
      `${getTimeStamp()} Got timezone ${timezone}`
    );

    try {
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
        // executablePath: '/usr/bin/google-chrome',
      });
      const page = await browser.newPage();
      page.authenticate({
        username,
        password,
      });

      try {
        for (let i = 1; i <= 2; i++) {
          const referer = getRandomReferral(trafficSource);
          console.log(
            "\x1b[32m%s\x1b[0m",
            `${getTimeStamp()} Running the agent with ${referer} as referer`
          );
          const userAgent = getRandomAgent(deviceType);
          await page.setUserAgent(userAgent.agent);
          await page.emulateTimezone(timezone);

          console.log(
            "\x1b[32m%s\x1b[0m",
            `${getTimeStamp()} And ${userAgent.agent} user agent`
          );
          await page.setExtraHTTPHeaders({
            referer,
            waitUntil: "domcontentloaded",
          });
          await page.goto(url);

          await scrollToBottom(page);
          await scrollToTop(page);
          await performRandomClicks(page, randomClicks, numAdClicks,isGoogleAd);

          console.log(
            "\x1b[32m%s\x1b[0m",
            `${getTimeStamp()} Done ${i} times `
          );
        }
      } catch (error) {
        console.error(
          "\x1b[31m%s\x1b[0m",
          `${getTimeStamp()} Error Processing new proxy: ${error.message}`
        );
      }
      console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()} ${proxy} done`);
      await browser.close();
    } catch (error) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        `${getTimeStamp()} Error with browser: ${error.message}`
      );
    }
  }

  console.log("Done");
}

module.exports = run;
