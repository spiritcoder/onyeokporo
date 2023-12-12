const fetch = require("node-fetch");
const fs = require("fs");
const getTimeStamp = require("../utils/timestamp");

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(async () => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
  console.log(`${getTimeStamp()} Scrolled to the bottom of the page.`);
}

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
      }, 250);
    });
  });
  console.log(`${getTimeStamp()} Scrolled to the top of the page.`);
}

async function clickAd(page) {
  try {
    const frames = await page.frames();
    const googleAdsFrames = frames.filter(
      (frame) =>
        frame.url().includes("googleads") &&
        frame.url() !==
          "https://googleads.g.doubleclick.net/pagead/drt/si?st=NO_DATA"
    );

    if (googleAdsFrames.length > 0) {
      try {
        const randomIndex = Math.floor(Math.random() * googleAdsFrames.length);
        const adFrame = googleAdsFrames[randomIndex];

        const adLinks = await adFrame.$$("a");

        if (adLinks.length > 0) {
          const randomIndex = Math.floor(Math.random() * adLinks.length);
          const randomAdLink = adLinks[randomIndex];

          const href = await adFrame.evaluate(
            (element) => element.getAttribute("href"),
            randomAdLink
          );

          if (href && !href.includes("https://adssettings.google.com")) {
            await page.goto(href, { waitUntil: "domcontentloaded" });
            console.log(
              `${getTimeStamp()} 😎😎😎😎 Successfully navigated to the ad link...`
            );
            await scrollToBottom(page);
            await page.waitForTimeout(5000);

            await page.goBack();
          } else {
            console.log(
              `${getTimeStamp()} Failed to extract the href attribute of the ad link...`
            );
          }
        } else {
          console.log(
            `${getTimeStamp()} No Google Ads links found inside the iframe.`
          );
        }
      } catch (clickError) {
        console.error(
          `${getTimeStamp()} Error occurred while interacting with the ad link:`,
          clickError.message
        );
      }
    } else {
      console.log(`${getTimeStamp()} No Google Ads frames found.`);
    }
  } catch (error) {
    console.error(`${getTimeStamp()} Error occurred:`, error.message);
  }
}

async function clickRandomLink(page) {
  await page.waitForSelector("a");

  const links = await page.$$("a");
  const hrefArray = [];
  for (const link of links) {
    const href = await link.evaluate((node) => node.getAttribute("href"));
    if (
      href &&
      !href.includes("#") &&
      !href.includes("about:blank") &&
      !href.includes("javascript")
    ) {
      hrefArray.push(href);
    }
  }

  if (hrefArray.length > 0) {
    const filteredLinks = hrefArray.filter((href) => !href.includes("#"));

    if (filteredLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredLinks.length);
      const randomLink = filteredLinks[randomIndex];

      try {
        await Promise.all([
          page.waitForNavigation(),
          page.evaluate((href) => {
            window.location.href = href;
          }, randomLink),
        ]);
        await page.waitForTimeout(10000);
        await scrollToBottom(page);
        if (!page.isClosed()) {
          await page.goBack();
        }
        console.log(
          `${getTimeStamp()} Clicked on a random link: ${randomLink}`
        );
      } catch (error) {
        console.log(
          `${getTimeStamp()} Error clicking the random link: ${randomLink}`
        );
      }
    } else {
      console.log(`${getTimeStamp()} no links without '#' found on the page.`);
    }
  } else {
    console.log(`${getTimeStamp()} no links found on the page.`);
  }
}

async function clickRandomLinkAndAd(page) {
  await page.waitForSelector("a");

  const links = await page.$$("a");
  const hrefArray = [];
  for (const link of links) {
    const href = await link.evaluate((node) => node.getAttribute("href"));
    if (
      href &&
      !href.includes("#") &&
      !href.includes("about:blank") &&
      !href.includes("javascript")
    ) {
      hrefArray.push(href);
    }
  }

  if (hrefArray.length > 0) {
    const filteredLinks = hrefArray.filter((href) => !href.includes("#"));

    if (filteredLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredLinks.length);
      const randomLink = filteredLinks[randomIndex];

      try {
        await Promise.all([
          page.waitForNavigation(),
          page.evaluate((href) => {
            window.location.href = href;
          }, randomLink),
        ]);
        await page.waitForTimeout(10000);
        await scrollToBottom(page);
        await clickAd(page);
        if (!page.isClosed()) {
          await page.goBack();
        }
        console.log(
          `${getTimeStamp()} Clicked on a random link: ${randomLink}`
        );
      } catch (error) {
        console.log(
          `${getTimeStamp()} Error clicking the random link: ${randomLink}`
        );
      }
    } else {
      console.log(`${getTimeStamp()} no links without '#' found on the page.`);
    }
  } else {
    console.log(`${getTimeStamp()} no links found on the page.`);
  }
}

async function pullProxies() {
  const result = await fetch(
    "https://proxy.webshare.io/api/v2/proxy/list/download/jbfgpfizydmoybwscihvvdcdonmkjkukkdowtthk/-/any/username/direct/-/",
    { headers: { "Content-Type": "text/plain" } }
  );

  const body = await result.text();

  const bodyArray = body.split("\n");
  let proxies = [];
  for (const proxy of bodyArray) {
    const ip = proxy.split(":")[0];
    const port = proxy.split(":")[1];
    proxies.push(ip + ":" + port);
  }

  fs.writeFileSync("./http.txt", proxies.join("\n"), function (err) {
    if (err)
      return console.log(`${getTimeStamp()} Error saving proxies: ${err}`);
    console.log(`${getTimeStamp()} Saved proxies to http.txt`);
  });
}

function addHttpsToUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}

module.exports = {
  clickRandomLink,
  clickRandomLinkAndAd,
  scrollToBottom,
  scrollToTop,
  pullProxies,
  clickAd,
  addHttpsToUrl,
};
