const flat = require('flat');

module.exports = flat({
  title: 'ABT 链网水龙头',
  add: '添加通证',
  added: '添加通证成功',
  claimed: '通证领取成功',
  cancel: '取消',
  submit: '提交',
  donate: '捐赠',
  claim: '领取',
  available: '所有通证',
  search: '搜索',
  name: '名称',
  symbol: '符号',
  address: 'DID',
  actions: '动作',
  noData: '还没有任何通证',
  chainHost: {
    label: '链的 API',
    placeholder: 'https://beta.abtnetwork.io/api',
  },
  tokenAddress: {
    label: '通证 ID',
    placeholder: '如果是添加链的主 token，可以留空',
  },
  type: {
    hour: '{amount} {symbol} / 小时',
    day: '{amount} {symbol} / 天',
    week: '{amount} {symbol} / 周',
  },
  dialog: {
    claim: {
      title: 'DID Wallet Required',
      scan: 'Scan following QRCode to claim tokens',
      confirm: 'Review the operation on your DID Wallet',
      success: 'Token claimed successfully',
    },
  },
});
