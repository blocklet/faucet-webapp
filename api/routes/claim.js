/* eslint-disable indent */
const express = require('express');
const omit = require('lodash/omit');
const Jwt = require('@arcblock/jwt');
const { toBase58 } = require('@ocap/util');
const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const { wallet } = require('../libs/auth');
const { fund } = require('../routes/auth/claim');

const router = express.Router();

const ensureSignedResponse = (req, res, next) => {
  if (req.ensureSignedResponse === undefined) {
    req.ensureSignedResponse = true;
    const originJson = res.json;

    res.json = (payload) => {
      const data = { response: payload };
      if (payload.error) {
        data.errorMessage = payload.error;
      }

      data.response = omit(data.response, ['error', 'errorMessage']);
      data.status = data.errorMessage ? 'error' : 'ok';

      originJson.call(res, {
        appPk: toBase58(wallet.publicKey),
        authInfo: Jwt.sign(wallet.address, wallet.secretKey, data, true),
      });
    };
  }

  next();
};

const ensureSignedRequest =
  ({ fieldPk, fieldInfo, enforceTimestamp }) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  (req, res, next) => {
    const locale = 'en';
    const data = req.body;

    const errors = {
      pkMissing: {
        en: `${fieldPk} is required to complete sign`,
        zh: `${fieldPk} 参数缺失`,
      },
      tokenMissing: {
        en: `${fieldInfo} is required to complete sign`,
        zh: 'JWT Token 参数缺失',
      },
      tokenInvalid: {
        en: 'Invalid JWT token',
        zh: '签名无效',
      },
      timeInvalid: {
        en: 'JWT token expired, make sure your device time in sync with network',
        zh: '签名中的时间戳无效，请确保设备和网络时间同步',
      },
    };

    const pk = data[fieldPk];
    const info = data[fieldInfo];
    if (!pk) {
      return res.json({ code: 'INVALID_REQUEST', error: errors.pkMissing[locale] });
    }
    if (!info) {
      return res.json({ code: 'INVALID_REQUEST', error: errors.tokenMissing[locale] });
    }

    const isValid = Jwt.verify(info, pk);
    if (!isValid) {
      // NOTE: since the token can be invalid because of wallet-app clock not in sync
      // We should tell the user that if it's caused by clock
      const isValidSig = Jwt.verify(info, pk, { tolerance: 0, enforceTimestamp: false });
      if (enforceTimestamp) {
        const error = isValidSig ? errors.timeInvalid[locale] : errors.tokenInvalid[locale];
        return res.json({ code: 'INVALID_REQUEST', error });
      }
    }

    req.payload = Jwt.decode(info, true);
    req.sender = fromPublicKey(pk, toTypeInfo(req.payload.iss));

    return next();
  };

// claim tokens from app
router.post(
  '/claim',
  ensureSignedResponse,
  ensureSignedRequest({ fieldPk: 'userPk', fieldInfo: 'userInfo', enforceTimestamp: true }),
  async (req, res) => {
    const result = await fund({ userDid: req.sender.address, id: req.payload.token, type: 'day' });
    return res.json(result);
  }
);

module.exports = router;
