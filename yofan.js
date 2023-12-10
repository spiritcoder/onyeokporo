const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
var fs = require("fs");
const getTimeStamp = require("./utility");
const loglogo = require("./loglogo");
const proxyChain = require("proxy-chain");

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
    await new Promise((resolve) => setTimeout(resolve, 10000)); // wait for 10 seconds
    if (!page.isClosed()) {
      await page.goto(currentURL); // Navigate back to the previous URL
    }
  } catch (error) {
    console.error("Error clicking the random link:", error);
  }
}

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
      headless: false,
      args: [`--proxy-server=${newProxy}`],
      executablePath:
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    });
    const page = await browser.newPage();
    page.authenticate({
      username: "vfrkigib",
      password: "4uehmxjw6d0h",
    });
    try {
      const referer = referrals[Math.floor(Math.random() * referrals.length)];

      for (let i = 0; i <= 10; i++) {
        await page.setUserAgent(randomUseragent.getRandom());
        await page.setExtraHTTPHeaders({
          referer,
          waitUntil: "domcontentloaded",
        });
        // await page.goto("https://entclassblog.com/");
        // await page.goto("https://moneywisehacks.com/");
        // await page.goto("https://foreviral.com/");
        await page.goto("https://yo.fan/moneywisehacks");
        // await page.goto("https://whoer.com/");
        await scrollToBottom(page);
        await scrollToTop(page);
        // await clickAd(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);
        await clickRandomLink(page);

        await clickRandomLink(page);
        await clickRandomLink(page);
        // await clickRandomLinkAndAd(page);
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

// Call the run function
run();
