const express = require("express");
const bodyparser = require("body-parser");
const router = express.Router();

const webshareRunner = require("./webshare/websharerunner");
const axleRunner = require("./axle/axlerunner");

const { addHttpsToUrl } = require("./utils/functions");
const getTimeStamp = require("./utils/timestamp");

const app = express();
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));

router.get("/run", async (req, res) => {
  const url = req.query.url;
  const region = req.query.region;
  const randomClicks = req.query.randomClicks;
  const numAdClicks = req.query.numAdClicks;
  const trafficSource = req.query.trafficSource;
  const deviceType = req.query.deviceType;
  const channel = req.query.channel;
  if (channel == "axle") {
    axleRunner(
      addHttpsToUrl(url),
      region,
      randomClicks,
      numAdClicks,
      trafficSource,
      deviceType
    );
  } else {
    webshareRunner(
      addHttpsToUrl(url),
      region,
      randomClicks,
      numAdClicks,
      trafficSource,
      deviceType
    );
  }
  res.send(`Running: ${url} on webshare`);
});

app.use("/", router);

app.listen(8080, () =>
  console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()} Listening on port 8080!`)
);
