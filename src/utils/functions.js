const fetch = require("node-fetch");
const fs = require("fs");
const axios = require("axios");
const getTimeStamp = require("../utils/timestamp");
const geoip = require("geoip-lite");
const ProxyAgent = require("proxy-agent");
const tz = require("timezone-support");

const getRandomInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      const intervalTime = getRandomInterval(200, 1000);
      var timer = setInterval(async () => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, intervalTime);
      function getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    });
  });
  console.log(
    "\x1b[32m%s\x1b[0m",
    `${getTimeStamp()} Scrolled to the bottom of the page.`
  );
}

async function scrollToTop(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = document.body.scrollHeight;
      var distance = 120;
      const intervalTime = getRandomInterval(100, 1000);

      var timer = setInterval(async () => {
        window.scrollBy(0, -distance);
        totalHeight -= distance;

        if (totalHeight <= 0) {
          clearInterval(timer);
          resolve();
        }
      }, intervalTime);
      function getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    });
  });
  console.log(
    "\x1b[32m%s\x1b[0m",
    `${getTimeStamp()} Scrolled to the top of the page.`
  );
}

async function clickGoogleAd(page) {
  try {
    await page.waitForSelector("iframe");

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
              "\x1b[32m%s\x1b[0m",
              `${getTimeStamp()} 😎😎😎😎 Successfully navigated to the ad link...`
            );
            await scrollToBottom(page);
            await page.waitForTimeout(5000);

            await page.goBack();
          } else {
            console.log(
              "\x1b[31m%s\x1b[0m",
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
          "\x1b[31m%s\x1b[0m",
          `${getTimeStamp()} Error occurred while interacting with the ad link:`,
          clickError.message
        );
      }
    } else {
      console.log(`${getTimeStamp()} No Google Ads frames found.`);
    }
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `${getTimeStamp()} Error occurred:`,
      error.message
    );
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
      !href.includes("javascript") &&
      !href.includes("/author") &&
      isLinkInDomain(href, page.url()) &&
      !href.toLowerCase().includes("contact-us") &&
      !href.toLowerCase().includes("terms-condition") &&
      !href.toLowerCase().includes("/privacy-policy") &&
      !href.toLowerCase().includes(".jpg") &&
      !href.toLowerCase().includes(".png") &&
      !href.toLowerCase().includes("jpeg") &&
      !href.toLowerCase().includes("/author/") &&
      !href.toLowerCase().includes("/category/")
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
        await scrollToTop(page);
        console.log(
          "\x1b[32m%s\x1b[0m",
          `${getTimeStamp()} Clicked on a random link: ${randomLink}`
        );
      } catch (error) {
        console.log(
          "\x1b[31m%s\x1b[0m",
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

async function clickRandomLinkAndGoogleAd(page) {
  await page.waitForSelector("a");

  const links = await page.$$("a");
  const hrefArray = [];
  for (const link of links) {
    const href = await link.evaluate((node) => node.getAttribute("href"));
    if (
      href &&
      !href.toLowerCase().includes("#") &&
      !href.toLowerCase().includes("about:blank") &&
      !href.toLowerCase().includes("javascript") &&
      isLinkInDomain(href, page.url()) &&
      !href.toLowerCase().includes("contact-us") &&
      !href.toLowerCase().includes("terms-condition") &&
      !href.toLowerCase().includes("/privacy-policy") &&
      !href.toLowerCase().includes(".jpg") &&
      !href.toLowerCase().includes(".png") &&
      !href.toLowerCase().includes("jpeg") &&
      !href.toLowerCase().includes("/author/") &&
      !href.toLowerCase().includes("/category/")
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
        await clickGoogleAd(page);
        if (!page.isClosed()) {
          await page.goBack();
        }
        await scrollToTop(page);
        console.log(
          "\x1b[32m%s\x1b[0m",
          `${getTimeStamp()} Clicked on a random link: ${randomLink}`
        );
      } catch (error) {
        console.log(
          "\x1b[31m%s\x1b[0m",
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

async function clickRandomLinkAndAdsterraAd(page) {
  await page.waitForSelector("a");

  const links = await page.$$("a");
  const hrefArray = [];
  for (const link of links) {
    const href = await link.evaluate((node) => node.getAttribute("href"));
    if (
      href &&
      !href.toLowerCase().includes("#") &&
      !href.toLowerCase().includes("about:blank") &&
      !href.toLowerCase().includes("javascript") &&
      isLinkInDomain(href, page.url()) &&
      !href.toLowerCase().includes("contact-us") &&
      !href.toLowerCase().includes("terms-condition") &&
      !href.toLowerCase().includes("/privacy-policy") &&
      !href.toLowerCase().includes(".jpg") &&
      !href.toLowerCase().includes(".png") &&
      !href.toLowerCase().includes("jpeg") &&
      !href.toLowerCase().includes("/author/") &&
      !href.toLowerCase().includes("/category/")
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
        await clickAdsterraAd(page);
        if (!page.isClosed()) {
          await page.goBack();
        }
        await scrollToTop(page);
        console.log(
          "\x1b[32m%s\x1b[0m",
          `${getTimeStamp()} Clicked on a random link: ${randomLink}`
        );
      } catch (error) {
        console.log(
          "\x1b[31m%s\x1b[0m",
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

async function clickAdsterraAd(page) {
  try {
    await page.waitForSelector("iframe");

    const frames = await page.frames();
    const adsterraFrames = frames.filter(
      (frame) => frame.url() == "about:blank"
    );
    
    if (adsterraFrames.length > 0) {
      try {
        const randomIndex = 0;
        const adFrame = adsterraFrames[randomIndex];

        const adLinks = await adFrame.$$("a");

        if (adLinks.length > 0) {
          const randomIndex = Math.floor(Math.random() * adLinks.length);
          const randomAdLink = adLinks[randomIndex];

          const href = await adFrame.evaluate(
            (element) => element.getAttribute("href"),
            randomAdLink
          );

          if (href) {
            await page.goto(href, { waitUntil: "domcontentloaded" });
            console.log(
              "\x1b[32m%s\x1b[0m",
              `${getTimeStamp()} 😎😎😎😎 Successfully navigated to the Adsterra link...`
            );
            await scrollToBottom(page);
            await page.waitForTimeout(5000);

            await page.goBack();
          } else {
            console.log(
              "\x1b[31m%s\x1b[0m",
              `${getTimeStamp()} Failed to extract the href attribute of the adsterra link...`
            );
          }
        } else {
          console.log(
            `${getTimeStamp()} No Adsterra Ads links found inside the iframe.`
          );
        }
      } catch (clickError) {
        console.error(
          "\x1b[31m%s\x1b[0m",
          `${getTimeStamp()} Error occurred while interacting with the Adsterra link:`,
          clickError.message
        );
      }
    } else {
      console.log(`${getTimeStamp()} No Adsterra Ads frames found.`);
    }

  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `${getTimeStamp()} Error occurred:`,
      error.message
    );
  }
}

async function clickAdxAd(page) {
  try {
    await page.waitForSelector("iframe");

    const frames = await page.frames();
    const adsterraFrames = frames.filter(
      (frame) => frame.url() == "about:blank"
    );
    
    if (adsterraFrames.length > 0) {
      try {
        const randomIndex = 0;
        const adFrame = adsterraFrames[randomIndex];

        const adLinks = await adFrame.$$("a");

        if (adLinks.length > 0) {
          const randomIndex = Math.floor(Math.random() * adLinks.length);
          const randomAdLink = adLinks[randomIndex];

          const href = await adFrame.evaluate(
            (element) => element.getAttribute("href"),
            randomAdLink
          );

          if (href) {
            await page.goto(href, { waitUntil: "domcontentloaded" });
            console.log(
              "\x1b[32m%s\x1b[0m",
              `${getTimeStamp()} 😎😎😎😎 Successfully navigated to the Google ADX link...`
            );
            await scrollToBottom(page);
            await page.waitForTimeout(5000);

            await page.goBack();
          } else {
            console.log(
              "\x1b[31m%s\x1b[0m",
              `${getTimeStamp()} Failed to extract the href attribute of the Google ADX link...`
            );
          }
        } else {
          console.log(
            `${getTimeStamp()} No Google ADX Ads links found inside the iframe.`
          );
        }
      } catch (clickError) {
        console.error(
          "\x1b[31m%s\x1b[0m",
          `${getTimeStamp()} Error occurred while interacting with the Google ADX link:`,
          clickError.message
        );
      }
    } else {
      console.log(`${getTimeStamp()} No Google ADX Ads frames found.`);
    }

  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `${getTimeStamp()} Error occurred:`,
      error.message
    );
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
      return console.log(
        "\x1b[31m%s\x1b[0m",
        `${getTimeStamp()} Error saving proxies: ${err}`
      );
    console.log(
      "\x1b[32m%s\x1b[0m",
      `${getTimeStamp()} Saved proxies to http.txt`
    );
  });
}

function addHttpsToUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}

function isLinkInDomain(link, domain) {
  const url = new URL(link);
  const url2 = new URL(domain);
  return url.hostname === url2.hostname;
}

function shuffleArray(array) {
  try {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  } catch (e) {
    console.log(e);
  }
}

async function searchBing(page, searchTerm, url) {
  try {
    await page.goto("https://bing.com");
    await page.waitForSelector("input[name='q']");
    await page.type("input[name='q']", searchTerm, { delay: 100 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);

    let linkFound = await findAndClickBingLink(page, url);

    let currentPage = 1;
    while (!linkFound && currentPage < 11) {
      const nextButton = await page.$('a[title="Next page"]');
      if (nextButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle0" }),
          page.click('a[title="Next page"]'),
        ]);
        linkFound = await findAndClickBingLink(page, url);
        currentPage++;
      } else {
        break; // Exit the loop if "Next" button not found
      }
    }

    if (linkFound) {
      console.log(
        "\x1b[32m%s\x1b[0m",
        `${getTimeStamp()} Clicked on a link containing the specified URL.`
      );
    } else {
      console.log(
        `${getTimeStamp()} Link containing the specified URL not found.`
      );
    }
  } catch (error) {
    console.log(
      "\x1b[31m%s\x1b[0m",
      `${getTimeStamp()} Error clicking the link.`
    );
  }
}

async function findAndClickBingLink(page, url) {
  // Scroll down to load more search results
  await scrollToBottom(page);

  // Wait for the link with the provided URL
  try {
    url = removeProtocolAndWWW(url);

    const link = await page.$(`a[href*='${url}']`);
    const href = await link.evaluate((node) => node.getAttribute("href"));
    console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()} Found a link: ${href}`);
    if (href) {
      await link.click();
      await scrollToBottom(page);

      await page.waitForTimeout(5000);
      return true;
    }
  } catch (error) {
    console.log(
      "\x1b[31m%s\x1b[0m",
      `${getTimeStamp()} Error clicking the link.`
    );
  }
  return false;
}

function removeProtocolAndWWW(url) {
  // Remove protocol (http:// or https://) and www. from the URL
  return url.replace(/(^\w+:|^)\/\/(www\.)?/, "");
}

async function searchGoogle(page, searchTerm, url) {
  try {
    await page.goto("https://www.google.com");
    await page.waitForSelector("textarea[name='q']");
    await page.type("textarea[name='q']", searchTerm); // Replace with your search query
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);

    let linkFound = await findAndClickGoogleLink(page, url);

    let currentPage = 1;
    while (!linkFound) {
      const nextButton = await page.$('a[aria-label="Next page"]');
      if (nextButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle0" }),
          page.click('a[aria-label="Next page"]'),
        ]);
        linkFound = await findAndClickGoogleLink(page, url);
        currentPage++;
      } else {
        break; // Exit the loop if "Next" button not found
      }
    }

    if (linkFound) {
      console.log(
        "\x1b[32m%s\x1b[0m",
        `Clicked on a link containing the specified URL.`
      );
    } else {
      console.log(`Link containing the specified URL not found.`);
    }
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", `Error clicking the link: ${error}`);
  }
}

async function findAndClickGoogleLink(page, url) {
  await scrollToBottom(page);

  url = removeProtocolAndWWW(url);
  const links = await page.$$("a");
  for (const link of links) {
    const href = await link.evaluate((node) => node.getAttribute("href"));
    console.log(href);
    console.log(url);
    if (href && href != nulll && isLinkInDomain(href, url)) {
      console.log(
        "\x1b[32m%s\x1b[0m",
        `${getTimeStamp()} Found a link: ${href}`
      );
      // await link.click();
      // await page.waitForTimeout(5000);
      return true;
    }
  }
  return false;
}

async function performRandomClicks(page, numRandomClicks, numAdClicks, isGoogleAd) {
  const functions = [];

  // Add random click function 'numRandomClicks' times
  for (let i = 0; i < numRandomClicks; i++) {
    functions.push(() => clickRandomLink(page));
  }

  // Add ad click function 'numAdClicks' times
  for (let i = 0; i < numAdClicks; i++) {
    if(isGoogleAd == "true"){
      functions.push(() => clickGoogleAd(page));
      functions.push(() => clickAdxAd(page));
    }else{
      functions.push(() => clickAdsterraAd(page))
    }
  }

  // Shuffle the array of functions
  for (let i = functions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [functions[i], functions[j]] = [functions[j], functions[i]];
  }

  // Iterate over the shuffled array and execute functions
  for (const func of functions) {
    await func();
  }
}

async function getTimezoneByIP(ip) {
  try {
    const response = await axios.get(
      `https://api.findip.net/${ip}/?token=e3825358009f48238b2c721399679f96`
    );
    const timezone = response.data.location.time_zone;
    return timezone;
  } catch (error) {
    console.error("Error fetching timezone:", error);
    return null;
  }
}

async function searchGoogleAndSaveKeywordCookies(page, searchTerm) {
  try {
    await page.goto("https://www.google.com");
    await page.waitForSelector("textarea[name='q']");
    await page.type("textarea[name='q']", searchTerm); // Replace with your search query
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);

    const searchResults = await page.evaluate(() => {
      const results = Array.from(document.querySelectorAll(".tF2Cxc"));
      return results.map((result) => result.querySelector("a").href);
    });

    // Shuffle the search results array
    const shuffledResults = shuffleArray(searchResults);

    // Visit a random selection of the first 6 search result URLs
    const urlsToVisit = shuffledResults.slice(0, 1);

    const allCookies = [];
    for (const url of urlsToVisit) {
      try {
        await page.goto(url);
        await page.waitForTimeout(5000);

        // Gather cookies from each site
        const cookies = await page.cookies();
        allCookies.push(...cookies);
      } catch (error) {
        console.error("\x1b[31m%s\x1b[0m", error);
      }
    }
    console.log(allCookies);
    fs.writeFileSync("./src/cookies/cookies.json", JSON.stringify(allCookies));
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", error);
  }
}

async function getTimezoneFromProxy(proxyUrl) {
  try {
    const match = proxyUrl.match(/([^\/]+)@/);
    let username;
    let password;

    if (match && match.length > 1) {
      const proxyIdentifier = match[1];
      const splitProxy = proxyIdentifier.split(":");
      username = splitProxy[0];
      password = splitProxy[1];
    } else {
      console.log("Proxy identifier not found in the URL.");
    }

    // Set proxy in axios configuration
    const axiosInstance = axios.create({
      proxy: {
        host: "gate.nodemaven.com",
        port: 8080,
      },
      auth: {
        password,
        username,
      },
    });

    // Get the IP address associated with the proxy
    const response = await axiosInstance.get(
      "https://api.ipify.org?format=json"
    );
    console.log(response);
    const ipAddress = response.data.ip;

    // Get geolocation information based on IP address
    const geo = geoip.lookup(ipAddress);
    if (geo && geo.ll) {
      // Determine the timezone using latitude and longitude
      const timezone = tz.findTimeZone(geo.ll[0], geo.ll[1]);
      return timezone.displayName;
    } else {
      throw new Error("Failed to determine geolocation information.");
    }
  } catch (error) {
    console.error("Error getting timezone from proxy:", error);
    throw error;
  }
}

module.exports = {
  clickRandomLink,
  clickRandomLinkAndGoogleAd,
  clickRandomLinkAndAdsterraAd,
  scrollToBottom,
  scrollToTop,
  pullProxies,
  clickGoogleAd,
  clickAdxAd,
  clickAdsterraAd,
  addHttpsToUrl,
  shuffleArray,
  searchBing,
  searchGoogle,
  performRandomClicks,
  getRandomInterval,
  getTimezoneByIP,
  searchGoogleAndSaveKeywordCookies,
  getTimezoneFromProxy,
};
