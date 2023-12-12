const express = require("express");
const bodyparser = require("body-parser")
const router = express.Router();

const dichvousRunner = require("./runners/dichvous");
const webshareRunner = require("./runners/webshare");
const { addHttpsToUrl } = require("./utils/functions");


const app = express();
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));

router.get("/run-dichvous", async (req, res) => {
  const {url} = req.query;

  dichvousRunner(addHttpsToUrl(url));
  res.send(`Running: ${url} on dichvous`);
});

router.get("/run-webshare", async (req, res) => {
  const url = req.query.url;
  webshareRunner(addHttpsToUrl(url));
  res.send(`Running: ${url} on webshare`);
});



app.use("/", router);

app.listen(8080, () => console.log("Listening on port 8080!"));
