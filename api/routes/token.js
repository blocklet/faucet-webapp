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
  return res.json([
    {
      chainHost: 'https://beta.abtnetwork.io/api/',
      chainId: 'beta',
      address: 'z35nQvMnQorD36QfPFv2a7RqgRQyRgNdguC8Y',
      faucetAmount: 3900,
      name: 'RollupTestToken',
      symbol: 'DOWN',
      decimal: 18,
      _id: 'Rtmm1KbeeXxu9uXK',
      createdAt: '2022-01-13T07:09:31.401Z',
      updatedAt: '2025-01-28T01:22:27.720Z',
    },
    {
      chainHost: 'https://beta.abtnetwork.io/api/',
      chainId: 'beta',
      address: 'z35n6h4d7KRprEkkQ3adK9MUf7CxqrgkhtLZX',
      faucetAmount: 2400,
      name: 'RollupTestToken',
      symbol: 'UP',
      decimal: 18,
      _id: 'cUWPQaCbe01Nn72D',
      createdAt: '2022-01-13T07:09:14.383Z',
      updatedAt: '2025-05-15T09:07:03.039Z',
    },
    {
      chainHost: 'https://beta.abtnetwork.io/api/',
      chainId: 'beta',
      address: 'z35nB2SA6xxBuoaiuUXUw6Gah2SNU3UzqdgEt',
      faucetAmount: 3700,
      name: 'RollupTestToken',
      symbol: 'MOON',
      decimal: 18,
      _id: 'H9vh7pXblZSjYp0l',
      createdAt: '2022-01-13T07:08:56.947Z',
      updatedAt: '2025-05-15T09:06:29.874Z',
    },
    {
      chainHost: 'https://beta.abtnetwork.io/api/',
      chainId: 'beta',
      address: 'z35n3kwEXMakjzfaf24DLd67dTJRByTf8y1FN',
      faucetAmount: 5500,
      name: 'Playground Token',
      symbol: 'PLAY',
      decimal: 18,
      _id: 'OeRJpfc2PnMp0PzE',
      createdAt: '2021-05-25T23:34:58.154Z',
      updatedAt: '2025-05-15T09:06:05.933Z',
    },
    {
      chainHost: 'https://beta.abtnetwork.io/api/',
      chainId: 'beta',
      address: 'z35nFBAXpA5N9xE1StApu6MPE6wUGzwThJGGp',
      faucetAmount: 4200,
      name: 'Playground Token',
      symbol: 'PLAY2',
      decimal: 18,
      _id: 'I3mPcdlkbb6oLHyV',
      createdAt: '2021-05-25T23:34:38.185Z',
      updatedAt: '2025-05-15T09:05:40.009Z',
    },
    {
      chainHost: 'https://beta.abtnetwork.io/api/',
      chainId: 'beta',
      address: 'z35n3WVTnN7KrR4gXn3szR6oneVefkBBx78Fc',
      faucetAmount: 18500,
      name: 'Playground Token',
      symbol: 'PLAY3',
      decimal: 18,
      _id: 'wnL0cHMxC3ryvm30',
      createdAt: '2021-05-25T23:34:17.598Z',
      updatedAt: '2025-05-15T09:04:27.359Z',
    },
    {
      chainHost: 'https://beta.abtnetwork.io/api/',
      chainId: 'beta',
      address: 'z35n6UoHSi9MED4uaQy6ozFgKPaZj2UKrurBG',
      faucetAmount: 58300,
      name: 'BetaChainToken',
      symbol: 'TBA',
      decimal: 18,
      _id: 'U87cU8NqgQO5M9Rn',
      createdAt: '2021-05-25T23:33:57.529Z',
      updatedAt: '2025-05-15T09:01:03.374Z',
    },
  ]);
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
