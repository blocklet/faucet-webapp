const express = require('express');
const pick = require('lodash/pick');
const Client = require('@ocap/client');

const Token = require('../states/token');
// const { wallet } = require('../libs/auth');

const router = express.Router();

const isValidChainEndpoint = async (endpoint) => {
  if (!endpoint) {
    return [false, null];
  }

  const client = new Client(endpoint);
  try {
    const { info } = await client.getChainInfo();
    if (info.consensusVersion.split(' ').length === 2) {
      return [client, info];
    }

    return [false, null];
  } catch (err) {
    return [false, null];
  }
};

// create new token in the list
router.post('/tokens', async (req, res) => {
  const { chainHost, tokenAddress } = req.body;
  if (!chainHost) {
    return res.json({ error: 'chainHost is required to list new token' });
  }
  if (!tokenAddress) {
    return res.json({ error: 'tokenAddress is required to list new token' });
  }

  const [client, info] = await isValidChainEndpoint(chainHost);

  if (!client) {
    return res.json({ error: `${chainHost} is not valid chain endpoint` });
  }

  const { state } = await client.getTokenState({ address: tokenAddress });
  if (!state) {
    return res.json({ error: `token ${tokenAddress} not found on chain ${chainHost}` });
  }

  const exist = await Token.exists({ chainId: info.network, address: tokenAddress });
  if (exist) {
    return res.json({ error: `token ${tokenAddress} from ${chainHost} is already listed` });
  }

  const item = await Token.insert({
    chainHost,
    chainId: info.network,
    ...pick(state, ['name', 'symbol', 'decimal']),
  });

  return res.json(item);
});

// fetch token list
router.get('/tokens', async (req, res) => {
  const tokens = await Token.find();
  return res.json(tokens);
});

module.exports = router;
