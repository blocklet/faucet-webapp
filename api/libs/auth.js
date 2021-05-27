const path = require('path');
const AuthStorage = require('@arcblock/did-auth-storage-nedb');
const { types } = require('@ocap/mcrypto');
const { fromSecretKey, WalletType } = require('@ocap/wallet');
const { WalletAuthenticator, WalletHandlers } = require('@arcblock/did-auth');

const Token = require('../states/token');

const wallet = fromSecretKey(process.env.BLOCKLET_APP_SK, WalletType({ role: types.RoleType.ROLE_APPLICATION }));

const authenticator = new WalletAuthenticator({
  wallet: wallet.toJSON(),
  appInfo: ({ baseUrl }) => ({
    name: process.env.BLOCKLET_APP_NAME,
    description: process.env.BLOCKLET_APP_DESCRIPTION,
    icon: `${baseUrl}/images/logo.png`,
    link: baseUrl,
  }),
  chainInfo: async ({ id }) => {
    const token = await Token.findOne({ _id: id });
    return { host: token.chainHost, id: token.chainId };
  },
});

const handlers = new WalletHandlers({
  authenticator,
  tokenGenerator: () => Date.now().toString(),
  tokenStorage: new AuthStorage({
    dbPath: path.join(process.env.BLOCKLET_DATA_DIR, 'auth.db'),
    onload: (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(`Failed to load database from ${path.join(process.env.BLOCKLET_DATA_DIR, 'auth.db')}`, err);
      }
    },
  }),
});

module.exports = {
  authenticator,
  handlers,
  wallet,
  types: {
    hour: {
      duration: 60 * 60 * 1000,
      amount: 10,
    },
    day: {
      duration: 24 * 60 * 60 * 1000,
      amount: 100,
    },
    week: {
      duration: 7 * 24 * 60 * 60 * 1000,
      amount: 300,
    },
  },
};
