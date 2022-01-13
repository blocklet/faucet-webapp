const express = require('express');

const { wallet, types } = require('../libs/auth');

const router = express.Router();

router.get('/env', async (req, res) => res.json({ address: wallet.address, types }));

module.exports = router;
