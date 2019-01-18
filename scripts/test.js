const path = require('path')
const fs = require('fs');
const getConfig = require('../lib/get-config');
const run = require('../lib/run');

module.exports = async function (event, context) {
  const config = await getConfig();
  const result = await run(config, event, context);

  console.log('Test Results:', Object.keys(result));

  const filename = result.lighthouseVersion.split('-')[0]
  fs.writeFileSync(path.join(__dirname, `results/${filename}.json`), `${JSON.stringify(result, null, 2)}\n`)

  return result;
}
