const awsServerlessExpress = require('aws-serverless-express');
const lh4uExpress = require('lighthouse4u/src/express');
const express = require('express');

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy
const binaryMimeTypes = [
  //'application/javascript',
  //'application/json',
  'application/octet-stream',
  //'application/xml',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/png',
  //'image/svg+xml',
  //'text/comma-separated-values',
  //'text/css',
  //'text/html',
  //'text/javascript',
  //'text/plain',
  //'text/text',
  //'text/xml'
];

let gServer;

module.exports = async function(config, event, context) {
  const server = getServer(config);

  // AWS Lambda to NodeJS HTTP+Express interface. pretty good bridge that should be sufficient.
  return awsServerlessExpress.proxy(server, event, context);
};

function getServer(config) {
  if (gServer) return gServer;

  // create app & server once
  const app = lh4uExpress(config);

  let mount;
  if (config.lambda && config.lambda.mount) {
    // use mount if provided
    mount = express();
    mount.use(config.lambda.mount, app);
  } 

  gServer = awsServerlessExpress.createServer(mount || app, null, binaryMimeTypes);

  return gServer;
}
