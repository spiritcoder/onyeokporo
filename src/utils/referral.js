const fs = require("fs");

function getRandomReferral() {
  const referrals = fs
    .readFileSync(__dirname + "/../referrals/referrals.txt", "utf-8")
    .split("\n");

  const referer = referrals[Math.floor(Math.random() * referrals.length)];

  return referer;
}

module.exports = getRandomReferral