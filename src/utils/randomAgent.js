const userAgent = require("user-agents");

function getRandomAgent(type = "mobile") {
  let device;
  if (type == "all") {
    device = {};
  } else {
    device = {
      deviceCategory: type,
    };
  }
  const agent = new userAgent(device);
  return agent.toString();
}

module.exports = getRandomAgent;
