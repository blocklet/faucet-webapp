/* eslint-disable no-console */
require('dotenv-flow').config({ silent: true });

const { server: app } = require('./functions/app');

const port = Number.parseInt(process.env.BLOCKLET_PORT, 10);
const server = app.listen(port, (err) => {
  if (err) throw err;

  console.log(`> faucet webapp ready on ${port}`);
});

module.exports = {
  server,
  app,
};
