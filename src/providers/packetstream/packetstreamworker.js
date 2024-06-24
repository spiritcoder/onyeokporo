const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const proxyChain = require("proxy-chain");
const { parentPort, workerData } = require("worker_threads");

const {
  scrollToBottom,
  scrollToTop,
  performRandomClicks,
  searchGoogleAndNavigate,
  searchBingAndNavigate,
} = require("../../utils/functions.js");
const getTimeStamp = require("../../utils/timestamp.js");
const getRandomReferral = require("../../utils/referral.js");
const getProxies = require("./getpacketstreamproxies.js");
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
    `ThreadNumber: ${threadNumber} ${getTimeStamp()} For ${url} website`
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
    try {
      const [username, password, host, port] = proxy.split(":");
      const newProxy = await proxyChain.anonymizeProxy(
        `http://${host}:${port}`
      );

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
        executablePath: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
      });

      const page = await browser.newPage();
      const pages = await browser.pages();
      if (pages.length > 1) {
        await pages[0].close();
      }
      await page.authenticate({ username, password });

      try {
        for (let i = 1; i < 2; i++) {
          const referer = getRandomReferral(trafficSource);
          console.log(
            "\x1b[32m%s\x1b[0m",
            `ThreadNumber: ${threadNumber} ${getTimeStamp()} Running the agent with ${referer} as referer`
          );
          const userAgent = getRandomAgent(deviceType);
          await page.setUserAgent(userAgent.agent);
          // await page.emulateTimezone(timezone);


          await page.setViewport(userAgent.viewport);

          console.log(
            "\x1b[32m%s\x1b[0m",
            `ThreadNumber: ${threadNumber} ${getTimeStamp()} And ${userAgent.agent} user agent`
          );
          await page.setExtraHTTPHeaders({
            referer,
            waitUntil: "domcontentloaded",
          });

          await page.goto(url);

          const cookies = await page.cookies();
          console.log(cookies);

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
        `ThreadNumber: ${threadNumber} ${getTimeStamp()} Done with proxy`
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
