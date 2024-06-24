const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const proxyChain = require("proxy-chain");
const { parentPort, workerData } = require("worker_threads");

const {
  scrollToBottom,
  scrollToTop,
  performRandomClicks,
  getTimezoneByIP,
} = require("../../utils/functions.js");
const loglogo = require("../../utils/loglogo.js");
const getTimeStamp = require("../../utils/timestamp.js");
const getRandomReferral = require("../../utils/referral.js");
const getProxies = require("./getwebshareproxy.js");
const getRandomAgent = require("../../utils/randomAgent.js");

puppeteer.use(StealthPlugin());

async function run(
  url,
  region,
  randomClicks = 10,
  numAdClicks = 1,
  trafficSource,
  deviceType,
  threadNumber,
  isGoogleAd
) {
  const adType = isGoogleAd == "true" ? "Google Ads" : "Adsterra Ads";
  console.log(
    "\x1b[32m%s\x1b[0m",
    `ThreadNumber: ${threadNumber}
    ${getTimeStamp()} Running traffics for ${region}`
  );
  console.log(
    "\x1b[32m%s\x1b[0m",
    `ThreadNumber: ${threadNumber} ${getTimeStamp()}For ${url} website`
  );
  console.log(
    "\x1b[32m%s\x1b[0m",
    `ThreadNumber: ${threadNumber} ${getTimeStamp()} With ${randomClicks} random clicks`
  );
  console.log(
    "\x1b[32m%s\x1b[0m",
    `ThreadNumber: ${threadNumber} ${getTimeStamp()}, ${numAdClicks} ${adType} clicks`
  );

  console.log(
    "\x1b[32m%s\x1b[0m",
    `ThreadNumber: ${threadNumber} ${getTimeStamp()}, And ${deviceType} devices`
  );

  let regionProxies = await getProxies(region);

  for (const proxy of regionProxies) {
    const parts = proxy.split(':');
    const proxyPort = `${parts[0]}:${parts[1]}`;
    const username = parts[2];
    const password = parts[3];

    const newProxy = await proxyChain.anonymizeProxy(
      "http://" + proxyPort
    );

    // get the timezone of the IP
    // const timezone = await getTimezoneByIP(ip);

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
        ],
        // executablePath: '/usr/bin/google-chrome',
      });
      const page = await browser.newPage();

      const pages = await browser.pages();
      if (pages.length > 1) {
        await pages[0].close();
      }
      page.authenticate({
        username,
        password,
      });

      try {
        for (let i = 1; i <= 2; i++) {
          const referer = getRandomReferral(trafficSource);
          console.log(
            "\x1b[32m%s\x1b[0m",
            `ThreadNumber: ${threadNumber} ${getTimeStamp()} Running the agent with ${referer} as referer`
          );
          const userAgent = getRandomAgent(deviceType);
          await page.setUserAgent(userAgent.agent);
          // await page.emulateTimezone(timezone);

          console.log(
            "\x1b[32m%s\x1b[0m",
            `ThreadNumber: ${threadNumber} ${getTimeStamp()} And ${userAgent.agent} user agent`
          );
          await page.setExtraHTTPHeaders({
            referer,
            waitUntil: "domcontentloaded",
          });
          await page.goto(url);

          await scrollToBottom(page);
          await scrollToTop(page);
          await performRandomClicks(
            page,
            randomClicks,
            numAdClicks,
            isGoogleAd
          );

          console.log(
            "\x1b[32m%s\x1b[0m",
            `ThreadNumber: ${threadNumber} ${getTimeStamp()} Done ${i} times `
          );
        }
      } catch (error) {
        console.error(
          "\x1b[31m%s\x1b[0m",
          `ThreadNumber: ${threadNumber} ${getTimeStamp()} Error Processing new proxy: ${
            error.message
          }`
        );
      }
      console.log(
        "\x1b[32m%s\x1b[0m",
        `ThreadNumber: ${threadNumber} ${getTimeStamp()} Done with Proxy`
      );
      await browser.close();
    } catch (error) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        `ThreadNumber: ${threadNumber} ${getTimeStamp()} Error with browser: ${
          error.message
        }`
      );
    }
  }

  console.log("Done");
}

if (parentPort) {
  const {
    url,
    region,
    randomClicks,
    numAdClicks,
    trafficSource,
    deviceType,
    threadNumber,
    isGoogleAd,
  } = workerData;
  run(
    url,
    region,
    randomClicks,
    numAdClicks,
    trafficSource,
    deviceType,
    threadNumber,
    isGoogleAd
  ).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
