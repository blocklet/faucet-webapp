const flat = require('flat');

module.exports = flat({
  title: 'ABT Network Faucet',
  add: 'Add Token',
  added: 'Token added successfully!',
  claimed: 'Token claimed successfully!',
  cancel: 'Cancel',
  submit: 'Submit',
  donate: 'Donate',
  claim: 'Claim',
  available: 'Available Tokens',
  search: 'Search',
  chain: 'Chain',
  name: 'Name',
  symbol: 'Symbol',
  address: 'DID',
  actions: 'Actions',
  noData: 'No Tokens listed yet',
  amount: 'Claimed',
  donateDesc: 'Scan with DID Wallet to Donate',
  chainHost: {
    label: 'Chain Endpoint',
    placeholder: 'https://beta.abtnetwork.io/api',
  },
  tokenAddress: {
    label: 'Token ID',
    placeholder: 'Leave empty to add primary token',
  },
  type: {
    hour: '{amount} {symbol} / hour',
    day: '{amount} {symbol} / day',
    week: '{amount} {symbol} / week',
  },
  dialog: {
    claim: {
      title: '需要扫码',
      scan: '用你的 DID 钱包扫描下面的二维码以领取 {amount} {symbol}',
      confirm: '请在 DID 钱包上确认',
      success: '{amount} {symbol} 已经发送到你钱包',
    },
  },
});
