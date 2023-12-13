const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
var fs = require("fs");
const proxyChain = require("proxy-chain");
const getTimeStamp = require("../utils/timestamp");
const loglogo = require("../utils/loglogo");
const getRandomReferral = require("../utils/referral");

puppeteer.use(StealthPlugin());

async function scrollToTop(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = document.body.scrollHeight;
      var distance = 120;
      var timer = setInterval(async () => {
        window.scrollBy(0, -distance);
        totalHeight -= distance;

        if (totalHeight <= 0) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
  console.log(`${getTimeStamp()} Scrolled to the top of the page.`);
}

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = document.body.scrollHeight;
      var distance = 120;
      var timer = setInterval(async () => {
        window.scrollBy(0, -distance);
        totalHeight -= distance;

        if (totalHeight <= 0) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
  console.log(`${getTimeStamp()} Scrolled to the bottom of the page.`);
}

async function clickRandomLink(page) {
  await page.waitForSelector(".media");

  const links = await page.$$(".media");

  const randomIndex = Math.floor(Math.random() * links.length);
  const randomLink = links[randomIndex];
  const currentURL = page.url();
  try {
    await Promise.all([page.waitForNavigation(), randomLink.click()]);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    if (!page.isClosed()) {
      await page.goto(currentURL);
    }
  } catch (error) {
    console.error("Error clicking the random link:", error);
  }
}

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
      headless: false,
      args: [`--proxy-server=${newProxy}`, "--no-sandbox"],
      executablePath: "/usr/bin/google-chrome",
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

run();
