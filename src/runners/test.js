const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
const proxyChain = require("proxy-chain");
const fs = require("fs");

const { searchGoogleAndSaveKeywordCookies } = require("../utils/functions");

puppeteer.use(StealthPlugin());

async function run(url, countryCode) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
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
  searchGoogleAndSaveKeywordCookies(page, "scholarship");
}

run("https://google.com", "ng");
