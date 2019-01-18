const getConfig = require('./lib/get-config');
const run = require('./lib/run');
const api = require('./lib/api');

// our lambda is a dual-mode handler to support both Lighthouse4u workstreams, the Google Lighthouse runner and the API
module.exports.handler = function handler (event, context) {
  if (event.Records) { // simple (but reliable) check for SQS Events
    return processEvents(event, context);
  } else if (event.path) { // simple (but reliable) check for HTTP API Gateway Events
    getConfig().then(config => {
      api(config, event, context).then(apiRes => {
        // response is handled by the serverless proxy. no further action required
      });
    });
  } else {
    throw new Error('unsupported request');
  }
}

async function processEvents(event, context) {
  const config = await getConfig();
  
  const result = await run(config, event, context);

  const response = Object.keys(result).reduce((state, k) => {
    const v = result[k];
    if (typeof v !== 'string' && typeof v !== 'number') return state; // only copy primitives
    state[k] = v;
    return state;
  }, {});

  response.categories = Object.keys(result.categories).reduce((state, c) => {
    state[c] = { score: result.categories[c].score };
    return state;
  }, {});

  return response;
}