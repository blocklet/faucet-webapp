/* eslint-disable no-console */
// HACK: this is required for this blocklet to work when bundled by abtnode
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
require('dotenv-flow').config();

const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment && process.env.ABT_NODE) {
  process.env.BLOCKLET_PORT = 3030;
}

const { server } = require('./functions/app');

const port = parseInt(process.env.BLOCKLET_PORT || process.env.APP_PORT, 10) || 3000;
server.listen(port, (err) => {
  if (err) throw err;

  console.log(`> faucet webapp ready on ${port}`);
});
