const flat = require('flat');

module.exports = flat({
  title: 'ABT Network Faucet',
  add: 'Add Token',
  added: 'Token added successfully!',
  cancel: 'Cancel',
  submit: 'Submit',
  donate: 'Donate',
  claim: 'Claim',
  available: 'Available Tokens',
  search: 'Search',
  name: 'Name',
  symbol: 'Symbol',
  address: 'Address',
  actions: 'Actions',
  noData: 'No Tokens listed yet',
  chainHost: {
    label: 'Chain Endpoint',
    placeholder: 'https://beta.abtnetwork.io/api',
  },
  tokenAddress: {
    label: 'Token ID',
    placeholder: 'Leave empty to add primary token',
  },
});
