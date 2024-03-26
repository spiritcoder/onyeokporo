const axios = require("axios");
const { HttpProxyAgent, HttpsProxyAgent } = require("hpagent");

async function testProxy(countryCode) {
  try {
    const proxy = `http://geonode_7FyjPJTYJQ:9e13f84f-6c39-4e9f-b4f4-710c44fb5658@premium-residential.geonode.com:${countryCode}`;

    let agentConfig = {
      proxy: proxy,
      keepAlive: false,
    };

    axios.defaults.httpAgent = new HttpProxyAgent(agentConfig);
    axios.defaults.httpsAgent = new HttpsProxyAgent(agentConfig);
    let res = await axios.get("https://jsonip.com/");
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = testProxy;
