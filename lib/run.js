const launchChrome = require('@serverless-chrome/lambda');
const lh4uSubmit = require('lighthouse4u/src/lighthouse/submit');
const lh4uStorage = require('lighthouse4u/src/store');

module.exports = async function run (config, event/*, context*/) {
  if (!event || !Array.isArray(event.Records) || event.Records.length !== 1) {
    throw new Error('event.Records.length !== 1');
  }

  const storage = new lh4uStorage(config);

  const job = JSON.parse(event.Records[0].body);

  // apply our lambda-based chrome launcher
  const launcher = ({ chromeFlags, ...others }) => {
    return launchChrome({ flags: chromeFlags, ...others })
  };

  const results = await lh4uSubmit(job.requestedUrl, { lighthouse: config.lighthouse, launcher }, job);

  const finalResult = Object.assign({}, results, job);
  finalResult.state = 'processed';
  delete finalResult.headers; // no longer needed

  // after success, return the original results regardless of result provided by `store`
  return storage.write(finalResult).then(() => finalResult);
}
