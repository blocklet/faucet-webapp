const flat = require('flat');

module.exports = flat({
  title: 'ABT 链网水龙头',
  add: '添加通证',
  chainHost: {
    label: '链的 API',
    placeholder: 'https://beta.abtnetwork.io/api',
  },
  tokenAddress: {
    label: '通证 ID',
    placeholder: '如果是添加链的主 token，可以留空',
  },
});
