const Client = require('@ocap/client');
const { BN } = require('@ocap/util');

const Token = require('../states/token');
const History = require('../states/history');

const logger = require('../libs/logger');
const { wallet } = require('../libs/auth');

const types = {
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
};

module.exports = {
  action: 'acquire-asset',
  claims: {
    profile: async ({ extraParams: { id, type } }) => {
      const token = await Token.findOne({ _id: id });
      if (!token) {
        throw new Error('Can not faucet on none existing token');
      }
      if (!types[type]) {
        throw new Error('Unsupported faucet period type');
      }

      return {
        fields: ['fullName'],
        description: 'Please provide your profile to complete faucet',
      };
    },
  },

  onAuth: async ({ userDid, extraParams: { id, type } }) => {
    const now = Date.now();
    const token = await Token.findOne({ _id: id });
    const client = new Client(token.chainHost);

    // Rate limit
    const [history] = await History.find({ userDid, tokenId: id }).sort({ createdAt: -1 }).limit(1);
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
    logger.info('faucet done', item);
    await History.insert(item);

    // Update faucet stats
    const tokenNew = await Token.findOne({ _id: id });
    await Token.update({ _id: id }, { faucetAmount: tokenNew.faucetAmount + types[type].amount });

    // return the tx hash
    return { hash };
  },
};
