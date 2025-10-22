import { flatten } from 'flat';

export default flatten({
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
      title: 'DID Wallet Required',
      scan: 'Scan following QRCode to claim {amount} {symbol}',
      confirm: 'Review the operation on your DID Wallet',
      success: '{amount} {symbol} sent to your wallet',
    },
  },
});
