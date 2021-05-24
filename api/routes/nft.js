/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable consistent-return */
const express = require('express');
const get = require('lodash/get');
const Client = require('@ocap/client');
const cache = require('express-cache-headers');
const { isValid } = require('@arcblock/did');
const { createCredentialList } = require('@arcblock/vc');

const { createDisplay } = require('../libs/nft');
const { getBlockletMeta } = require('../libs/blocklet');
const env = require('../libs/env');
const blockletDB = require('../db/blocklet');

const options = { ignoreFields: ['state.context'] };
const router = express.Router();

const ensureAsset = async (req, res, next) => {
  if (!req.query.assetId) {
    return res.send('Invalid request: missing nft asset id');
  }

  const { assetId } = req.query;
  if (isValid(assetId) === false) {
    return res.send('Invalid request: invalid nft asset id');
  }

  const client = new Client(env.chainHost);
  const { state: asset } = await client.getAssetState({ address: assetId }, options);
  if (!asset) {
    return res.send('Invalid request: nft asset not found');
  }

  const { data } = asset;
  if (data.typeUrl !== 'vc') {
    return res.send('Invalid request: nft asset is not a vc');
  }

  const vc = JSON.parse(data.value);
  if (vc.type.includes('BlockletPurchaseCredential') === false) {
    return res.send('Invalid request: nft asset is not a BlockletPurchaseCredential');
  }

  req.asset = asset;
  req.client = client;
  req.vc = vc;

  next();
};

router.get('/nft/display', cache({ ttl: 24 * 60 * 60 }), ensureAsset, async (req, res) => {
  const { vc, asset, client } = req;
  const { owner, parent, issuer } = asset;

  const [{ state: ownerState }, { state: issuerState }, { state: factoryState }] = await Promise.all([
    client.getAccountState({ address: owner }, options),
    client.getAccountState({ address: issuer }, options),
    client.getFactoryState({ address: parent }, options),
  ]);

  res.type('svg');
  res.send(
    createDisplay(vc, {
      owner: ownerState.address,
      issuer: issuerState.moniker,
      description: factoryState.description,
      date: vc.issuanceDate,
    })
  );
});

router.get('/nft/status', ensureAsset, async (req, res) => {
  const { vc } = req;

  const locale = req.query.locale || 'en';
  const translations = {
    zh: '查看 Blocklet',
    en: 'View Blocklet',
  };

  res.jsonp({
    id: vc.id,
    description: 'Actions of BlockletPurchaseCredential',
    actionList: createCredentialList({
      issuer: { wallet: env.wallet, name: 'faucet-webapp-service' },
      claims: [
        {
          id: `${env.serverUrl}/blocklet/${get(vc, 'credentialSubject.purchased.blocklet.id')}`,
          type: 'navigate',
          name: 'view-blocklet',
          scope: 'public',
          label: translations[locale],
        },
      ],
    }),
  });
});

// provide a nft show list for nft-store
router.get('/nft/config', async (req, res) => {
  // Must get all blocklets which is a nft factory
  const getBlocklets = () =>
    new Promise((resolve, reject) => {
      blockletDB.db.find().exec((error, docs) => (error ? reject(error) : resolve(docs)));
    });
  const blocklets = await getBlocklets();
  const factoryList = blocklets.map((item) => getBlockletMeta(item.did, item.currentVersion.version));
  const factories = factoryList.filter((item) => item.nftFactory).map((item) => item.nftFactory);
  res.json({ purchaseFactoryAddresses: factories });
});

module.exports = router;
