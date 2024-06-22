const { Worker } = require('worker_threads');
const path = require('path');
const loglogo = require("../../utils/loglogo.js");



// Main logic to manage worker threads
async function main(url, region, randomClicks, numAdClicks, trafficSource, deviceType, numThreads, isGoogleAd) {
  loglogo();


  const promises = [];

  // Create worker threads
  for (let i = 0; i < numThreads; i++) {

    const workerPath = path.join(__dirname, 'nodemavenworker.js');

    const worker = new Worker(workerPath, {
      workerData: {
        url,
        region,
        randomClicks,
        numAdClicks,
        trafficSource,
        deviceType,
        threadNumber: i+1,
        isGoogleAd
      }
    });

    // Listen for messages from worker threads
    worker.on('message', message => {
      console.log(`Thread ${i + 1} finished with message: ${message}`);
    });

    // Handle errors from worker threads
    worker.on('error', err => {
      console.error(`Worker error: ${err}`);
    });

    // Handle exit event from worker threads
    worker.on('exit', code => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });

    promises.push(worker);
  }

  // Wait for all threads to complete
  await Promise.all(promises.map(worker => {
    return new Promise((resolve, reject) => {
      worker.on('exit', resolve);
      worker.on('error', reject);
    });
  }));

  console.log('All threads have finished execution');
}

module.exports = main;