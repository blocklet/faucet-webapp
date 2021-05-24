const { types } = require('@ocap/mcrypto');
const { fromSecretKey, WalletType } = require('@ocap/wallet');

const wallet = fromSecretKey(process.env.BLOCKLET_APP_SK, WalletType({ role: types.RoleType.ROLE_APPLICATION }));

module.exports = Object.freeze({
  wallet,
});
