const express = require('express');

const { wallet } = require('../libs/auth');

const router = express.Router();

router.get('/env', async (req, res) => res.json({ address: wallet.toAddress() }));

module.exports = router;
