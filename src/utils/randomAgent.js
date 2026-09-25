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
  const agent = new userAgent(device).toString();

  // Set corresponding viewport based on user agent
  const viewports = {
    Windows: { width: 1366, height: 768 },
    Macintosh: { width: 1440, height: 900 },
    Linux: { width: 1366, height: 768 },
    Android: { width: 360, height: 640 },
    iPhone: { width: 375, height: 667 },
  };

  let viewport = { width: 1366, height: 768 }; // Default viewport

  if (agent.includes("Windows")) {
    viewport = viewports.Windows;
  } else if (agent.includes("Macintosh")) {
    viewport = viewports.Macintosh;
  } else if (agent.includes("Linux")) {
    viewport = viewports.Linux;
  } else if (agent.includes("Android")) {
    viewport = viewports.Android;
  } else if (agent.includes("iPhone")) {
    viewport = viewports.iPhone;
  }

  return { agent, viewport };
}

module.exports = getRandomAgent;
