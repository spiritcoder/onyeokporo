function getTimeStamp() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, " ").replace(/\..+/, "");
  return `[${timestamp}]`;
}

module.exports = getTimeStamp;
