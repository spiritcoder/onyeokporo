// add express router boilerplate
const express = require("express");
const router = express.Router();

const dichvousRunner = require("./dichvous");
const webshareRunner = require("./webshare");

// add route
router.get("/run-dichvous", async (req, res) => {
  // run dichvous.js
  dichvousRunner();
  res.send("Hello World!");
});

router.get("/run-webshare", async (req, res) => {
  // run webshare.js
  webshareRunner();
  res.send("Hello World!");
});

// init express app
const app = express();

// add router to express app
app.use("/", router);

// listen on port 3000
app.listen(8080, () => console.log("Listening on port 3000!"));
