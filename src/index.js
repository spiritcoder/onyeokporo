const express = require("express");
const bodyparser = require("body-parser");
const router = express.Router();

const dichvousRunner = require("./runners/dichvous");
const webshareRunner = require("./runners/webshare");
const bingSearcher = require("./runners/bingSearcher");
const googleSearcher = require("./runners/googleSearcher");

const { addHttpsToUrl } = require("./utils/functions");
const getTimeStamp = require("./utils/timestamp");

const app = express();
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));

router.get("/run-dichvous", async (req, res) => {
  const { url } = req.query;

  dichvousRunner(addHttpsToUrl(url));
  res.send(`Running: ${url} on dichvous`);
});

router.get("/run-webshare", async (req, res) => {
  const url = req.query.url;
  const region = req.query.region;
  const randomClicks = req.query.randomClicks;
  const numAdClicks = req.query.numAdClicks;
  const trafficSource = req.query.trafficSource;
  const deviceType = req.query.deviceType;
  webshareRunner(addHttpsToUrl(url), region, randomClicks, numAdClicks, trafficSource, deviceType);
  res.send(`Running: ${url} on webshare`);
});

router.get("/run-bing-searcher", async (req, res) => {
  const url = req.query.url;
  bingSearcher(addHttpsToUrl(url));
  res.send(`Running: ${url} on webshare`);
});

router.get("/run-gooogle-searcher", async (req, res) => {
  const url = req.query.url;
  googleSearcher(addHttpsToUrl(url));
  res.send(`Running: ${url} on webshare`);
});

app.use("/", router);

app.listen(8080, () => console.log("\x1b[32m%s\x1b[0m", `${getTimeStamp()} Listening on port 8080!`));
