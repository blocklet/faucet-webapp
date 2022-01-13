const sortBy = require('lodash/sortBy');
const Client = require('@ocap/client');
const { BN } = require('@ocap/util');

const Token = require('../../states/token');
const History = require('../../states/history');

const logger = require('../../libs/logger');
const { wallet, types } = require('../../libs/auth');

const fund = async ({ userDid, id, type = 'day' }) => {
  const now = Date.now();
  const token = await Token.findOne({ $or: [{ _id: id }, { address: id }] });
  const client = new Client(token.chainHost);

  // Rate limit
  const list = await History.find({ userDid, tokenId: id });
  const [history] = sortBy(list, 'createdAt').reverse();
  if (history && history.nextTimeMs > now) {
    throw new Error('Too many request, please come back later');
  }

  // Check balance
  const {
    tokens: [holding],
  } = await client.getAccountTokens({ address: wallet.address, token: token.address });
  if (!holding) {
    throw new Error('No token to complete your request');
  }

  const requiredBalance = types[type].amount;
  if (new BN(requiredBalance, holding.decimal).gt(new BN(holding.balance))) {
    throw new Error('Insufficient token to complete your request');
  }

  // Transfer
  let hash = '';
  hash = await client.transfer({
    to: userDid,
    tokens: [{ address: token.address, value: types[type].amount }],
    wallet,
  });

  const item = {
    tokenId: id,
    userDid,
    type,
    amount: types[type].amount,
    nextTimeMs: now + types[type].duration,
    hash,
  };

  // Save history
  logger.info('claim done', item);
  await History.insert(item);

  // Update faucet stats
  const tokenNew = await Token.findOne({ $or: [{ _id: id }, { address: id }] });
  await Token.update({ _id: id }, { ...tokenNew, faucetAmount: tokenNew.faucetAmount + types[type].amount });

  // return the tx hash
  return { hash };
};

module.exports = {
  action: 'claim',
  claims: {
    profile: async ({ extraParams: { id, type } }) => {
      const token = await Token.findOne({ _id: id });
      if (!token) {
        throw new Error('Can not claim none existing token');
      }
      if (!types[type]) {
        throw new Error('Unsupported claim period type');
      }

      return {
        fields: ['fullName'],
        description: 'Please provide your profile to complete claim',
      };
    },
  },

  onAuth: ({ userDid, extraParams: { id, type } }) => fund({ userDid, id, type }),
};

module.exports.fund = fund;
