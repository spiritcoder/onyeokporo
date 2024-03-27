const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
const proxyChain = require("proxy-chain");
const fs = require('fs');

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
const getGeonodeIP = require("../utils/geonode.js");
const axios = require("axios");
const fetch = require("node-fetch");
const HttpsProxyAgent = require("https-proxy-agent");

const dns = require('dns')

puppeteer.use(StealthPlugin());

async function run(url, countryCode) {
  let proxy = await getProxies('dataimpulse_uk')
  proxy = proxy[0]
  console.log(proxy)

  const newProxy = await proxyChain.anonymizeProxy( "http://" + proxy + ":80");

  // // get the timezone of the IP
  const timezone = await getTimezoneByIP(proxy);
  console.log(
    "\x1b[32m%s\x1b[0m",
    `${getTimeStamp()} Got timezone ${timezone}`
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
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();
  await page.emulateTimezone(timezone);
  page.authenticate({
    username: "4516faeb7e74162df3fa",
    password: "e51d88e825cd0fea",
  });
  await page.goto(url);
}

run("https://google.com", "ng");