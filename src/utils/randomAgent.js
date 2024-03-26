const userAgent = require("user-agents");

function getRandomAgent(type = "mobile") {

   const agent = new userAgent({
      deviceCategory: type
   });
   
    return agent.toString();
}


module.exports = getRandomAgent;