const express = require('express');
const { toBase58 } = require('@ocap/util');

const env = require('../libs/env');

const router = express.Router();

const { version } = require('../../package.json');

router.get('/registry.json', async (req, res) => {
  res.json({
    id: env.wallet.toAddress(),
    pk: toBase58(env.wallet.publicKey),
    name: env.registryName,
    description: env.registryDesc,
    logoUrl: env.registryLogoUrl,
    maintainer: env.registryMaintainer,
    chainHost: env.chainHost,
    cdnUrl: env.cdnUrl,
    version,
  });
});

module.exports = router;
