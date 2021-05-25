const flat = require('flat');

module.exports = flat({
  title: 'ABT Network Faucet',
  add: 'Add Token',
  chainHost: {
    label: 'Chain Endpoint',
    placeholder: 'https://beta.abtnetwork.io/api',
  },
  tokenAddress: {
    label: 'Token ID',
    placeholder: 'Leave empty to add primary token',
  },
});
