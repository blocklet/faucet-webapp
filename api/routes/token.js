const express = require('express');
const pick = require('lodash/pick');
const sortBy = require('lodash/sortBy');
const Client = require('@ocap/client');

const Token = require('../states/token');
const { wallet } = require('../libs/auth');

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
  const { chainHost, tokenAddress = '' } = req.body;
  if (!chainHost) {
    return res.status(400).json({ error: 'chainHost is required to list new token' });
  }

  const [client, info] = await isValidChainEndpoint(chainHost);

  if (!client) {
    return res.status(400).json({ error: `${chainHost} is not valid chain endpoint` });
  }

  const result = await client.getTokenState({ address: tokenAddress });
  if (!result.state) {
    return res.status(400).json({ error: `token ${tokenAddress} not found on chain ${chainHost}` });
  }

  const token = result.state;

  const exist = await Token.exists({ chainId: info.network, address: tokenAddress });
  if (exist) {
    return res.status(400).json({ error: `token ${tokenAddress} from ${chainHost} is already listed` });
  }

  // ensure the faucet webapp account exist on the token chain
  const { state: account } = await client.getAccountState({ address: wallet.address });
  if (!account) {
    await client.declare({ moniker: 'faucet-webapp', wallet });
  }

  // insert token record
  const item = await Token.insert({
    chainHost,
    chainId: info.network,
    address: tokenAddress,
    faucetAmount: 0,
    ...pick(token, ['name', 'symbol', 'decimal']),
  });

  return res.json(item);
});

// fetch token list
router.get('/tokens', async (req, res) => {
  const tokens = await Token.find({});
  return res.json(sortBy(tokens, 'createdAt').reverse());
});

// fetch token list for a chain
router.get('/tokens-by-chain', async (req, res) => {
  const { chainHost } = req.query;
  if (!chainHost) {
    return res.json({ error: 'chainHost is required to list token' });
  }

  const [client] = await isValidChainEndpoint(chainHost);
  if (!client) {
    return res.json({ error: `${chainHost} is not valid chain endpoint` });
  }

  const [{ state }, { tokens }] = await Promise.all([
    client.getForgeState(),
    client.listTokens({ paging: { size: 100 } }),
  ]);

  return res.json(
    [{ ...state, address: '' }].concat(tokens).map((x) => pick(x, ['address', 'name', 'symbol', 'decimal']))
  );
});

module.exports = router;
