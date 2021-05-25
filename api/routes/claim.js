const sortBy = require('lodash/sortBy');
const Client = require('@ocap/client');
const { BN } = require('@ocap/util');

const Token = require('../states/token');
const History = require('../states/history');

const logger = require('../libs/logger');
const { wallet, types } = require('../libs/auth');

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

  onAuth: async ({ userDid, extraParams: { id, type } }) => {
    const now = Date.now();
    const token = await Token.findOne({ _id: id });
    const client = new Client(token.chainHost);

    // Rate limit
    const list = await History.find({ userDid, tokenId: id });
    const [history] = sortBy(list, 'createdAt').reverse();
    if (history && history.nextTimeMs < now) {
      throw new Error('Too many request, please come back later');
    }

    // Check balance
    if (token.address) {
      const {
        tokens: [{ balance: actualBalance }],
      } = await client.getAccountToken({ address: wallet.toAddress(), token: token.address });
      const requiredBalance = types[type].amount;
      if (new BN(requiredBalance).gt(new BN(actualBalance))) {
        throw new Error('Insufficient token to complete your request');
      }
    } else {
      const { balance: actualBalance } = await client.getAccountState({ address: wallet.toAddress() });
      const requiredBalance = types[type].amount;
      if (new BN(requiredBalance).gt(new BN(actualBalance))) {
        throw new Error('Insufficient fund to complete your request');
      }
    }

    // Transfer
    let hash = '';
    if (token.address) {
      hash = await client.transfer({
        to: userDid,
        tokens: [{ address: token.address, value: types[type].amount }],
        wallet,
      });
    } else {
      hash = await client.transfer({
        to: userDid,
        token: types[type].amount,
        wallet,
      });
    }

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
    const tokenNew = await Token.findOne({ _id: id });
    await Token.update({ _id: id }, { faucetAmount: tokenNew.faucetAmount + types[type].amount });

    // return the tx hash
    return { hash };
  },
};
