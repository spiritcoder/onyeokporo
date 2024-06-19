const { shuffleArray } = require("../utils/functions");
const proxies = require("./packetstreamproxies");

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
  regionProxies = regionProxies.map((proxy) => "http://" + proxy);
  console.log(regionProxies)

  return shuffleArray(regionProxies);
}

module.exports = getProxies;
