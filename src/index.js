const express = require("express");
const bodyparser = require("body-parser");
const router = express.Router();

const webshareRunner = require("./providers/webshare/websharerunner");
const webshareResRunner = require("./providers/webshareRes/websharerunner");
const axleRunner = require("./providers/axle/axlerunner");
const nodemavenRunner = require("./providers/nodemaven/nodemavenrunner");
const packetstreamRunner = require("./providers/packetstream/packetstreamrunner")
const packetstreamRun = require("./providers/packetstream/packetstreamworker")
const ip2worldrunner = require("./providers/ip2world/ip2worldrunner")

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
  const numThreads = req.query.numThreads;
  const isGoogleAd = req.query.isGoogleAd;
  if (channel == "axle") {
    axleRunner(
      addHttpsToUrl(url),
      region,
      randomClicks,
      numAdClicks,
      trafficSource,
      deviceType,
      numThreads,
      isGoogleAd
    );
  } else if (channel == "webshare") {
    webshareRunner(
      addHttpsToUrl(url),
      region,
      randomClicks,
      numAdClicks,
      trafficSource,
      deviceType,
      numThreads,
      isGoogleAd
    );
  } else if (channel == "webshareRes") {
    webshareResRunner(
      addHttpsToUrl(url),
      region,
      randomClicks,
      numAdClicks,
      trafficSource,
      deviceType,
      numThreads,
      isGoogleAd
    );
  } else if (channel == "nodemaven"){
    nodemavenRunner(
      addHttpsToUrl(url),
      region,
      randomClicks,
      numAdClicks,
      trafficSource,
      deviceType,
      numThreads,
      isGoogleAd
    );
  }else if (channel == "ip2world"){
    ip2worldrunner(
      addHttpsToUrl(url),
      region,
      randomClicks,
      numAdClicks,
      trafficSource,
      deviceType,
      numThreads,
      isGoogleAd
    );
  }else {
    if(numThreads == 1){
      packetstreamRun(
        addHttpsToUrl(url),
        region,
        randomClicks,
        numAdClicks,
        trafficSource,
        deviceType,
        0,
        isGoogleAd
      );
    }
    else{
      packetstreamRunner(
        addHttpsToUrl(url),
        region,
        randomClicks,
        numAdClicks,
        trafficSource,
        deviceType,
        numThreads,
        isGoogleAd
      );
    }
  }
  res.send(`Running: ${url} on ${channel}`);
});

app.use("/", router);

app.listen(8081, () =>
  console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()} Listening on port 8081!`)
);
