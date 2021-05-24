const { types } = require('@ocap/mcrypto');
const { fromSecretKey, WalletType } = require('@ocap/wallet');

const wallet = fromSecretKey(process.env.BLOCKLET_APP_SK, WalletType({ role: types.RoleType.ROLE_APPLICATION }));

module.exports = Object.freeze({
  wallet,
  chainHost: process.env.CHAIN_HOST || '',
  cdnUrl: process.env.CDN_URL || '',
  serverUrl: process.env.SERVER_URL || '',
  shareRequirement: Number(process.env.SHARE_REQUIREMENT || 0.3),
  blockletDataDir: process.env.BLOCKLET_DATA_DIR,
  registryName: process.env.REGISTRY_NAME || '',
  registryDesc: process.env.REGISTRY_DESC || '',
  registryLogoUrl: process.env.REGISTRY_LOGO || '/logo.png',
  registryMaintainer: process.env.REGISTRY_MAINTAINER || '',
});
