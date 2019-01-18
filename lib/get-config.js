const argv = require('lighthouse4u');
const { getConfigs } = require('lighthouse4u/src/config');
const path = require('path');

const configPromise = getConfigs({
  ...argv,
  config: process.env.NODE_ENV || 'production',
  configDir: path.resolve(__dirname, '..', 'config'),
  configBase: 'defaults'
});

module.exports = async function getConfig() {
  const [config] = await configPromise;

  return config;
};
