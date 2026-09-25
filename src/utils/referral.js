const referrals = require("../referrals/referrals");
const { shuffleArray } = require("./functions");

function getRandomReferral(trafficSource) {
  let source = [];

  if (trafficSource == "all") {
    source = referrals.flatMap((aSource) => Object.values(aSource).flat());
  } else {
    // region exists
    source = referrals[0][trafficSource];

    if (source.length < 1) {
      source = referrals.flatMap((aSource) => Object.values(aSource).flat());
    }
  }

  // shuffle proxies
  source = shuffleArray(source);

  const referer = source[Math.floor(Math.random() * referrals.length)];

  return referer;
}

module.exports = getRandomReferral;