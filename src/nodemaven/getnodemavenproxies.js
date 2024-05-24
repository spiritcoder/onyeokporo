const { shuffleArray } = require("../utils/functions");
const proxies = require("./nodemavenproxies");

async function getProxies(region) {
  let regionProxies = [];

  if (region === "all") {
    regionProxies = proxies.flatMap((region) => Object.values(region).flat());
  } else {

    if (proxies[0][region]) {
      regionProxies = proxies[0][region];
    }

    if (regionProxies.length < 1) {
      regionProxies = proxies.flatMap((region) => Object.values(region).flat());
    }
  }

  return shuffleArray(regionProxies);
}

module.exports = getProxies;
