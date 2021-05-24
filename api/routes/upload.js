/* eslint-disable no-await-in-loop */
require('express-async-errors');
const path = require('path');
const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const ssri = require('ssri');
const semver = require('semver');
const tar = require('tar');
const get = require('lodash/get');
const cloneDeep = require('lodash/cloneDeep');
const Client = require('@ocap/client');
const { toBase58 } = require('@ocap/util');
const { compile } = require('@ocap/contract');
const verifyMultiSig = require('@blocklet/meta/lib/verify-multi-sig');
const validateBlockletMeta = require('@blocklet/meta/lib/validate');
const { isFreeBlocklet, createShareContract } = require('@blocklet/meta/lib/payment');
const stableStringify = require('json-stable-stringify');

const env = require('../libs/env');
const blockletDB = require('../db/blocklet');
const { blockletRootDir, tempUploadDir, getBlockletDir } = require('../libs/blocklet');
const { BLOCKLET_STATUS } = require('../libs/constant');
const logger = require('../libs/logger');
const { blockletDataDir } = require('../libs/env');
const { convertMarkdownToHtmlAst } = require('../libs/markdown-converter');

const router = express.Router();

const storage = multer.diskStorage({
  destination: tempUploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const extractTarball = async (tarballFilepath, targetDir) => {
  fs.ensureDirSync(targetDir);

  await tar.x({
    file: tarballFilepath,
    cwd: targetDir,
  });

  return path.join(targetDir, 'package');
};

const generateStaticFiles = async ({ tarballFilepath, targetDir, blockletMeta }) => {
  const tempDir = path.join(blockletDataDir, Date.now().toString());
  try {
    const { did, version } = blockletMeta;
    fs.ensureDirSync(targetDir);
    const extractedTarballFilepath = await extractTarball(tarballFilepath, tempDir);

    const blockletMdFilepath = path.join(extractedTarballFilepath, 'blocklet.md');
    if (fs.existsSync(blockletMdFilepath)) {
      const ast = convertMarkdownToHtmlAst(fs.readFileSync(blockletMdFilepath));
      fs.writeFileSync(path.join(targetDir, 'blocklet.ast'), JSON.stringify(ast));
      logger.info('generated blocklet ast file', { did, version });
    } else {
      logger.warn('there is no blocklet.md file in the blocklet', { did, version });
    }

    ['screenshots', blockletMeta.logo].forEach((pathname) => {
      if (!pathname) {
        return;
      }

      const sourceScreenshotsDir = path.join(extractedTarballFilepath, pathname);
      if (fs.existsSync(sourceScreenshotsDir)) {
        fs.moveSync(sourceScreenshotsDir, path.join(targetDir, pathname), { overwrite: true });
        logger.info(`moved ${pathname} files`, { did, version });
      } else {
        logger.warn(`there is no ${pathname} files in the blocklet`, { did, version });
      }
    });
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.removeSync(tempDir);
    }
  }
};

const responseError = (status, message) => (req, res) => {
  // clean files
  if (req.files) {
    const blockletMetaFile = req.files['blocklet-meta'][0].path;
    const blockletTarballFile = req.files['blocklet-tarball'][0].path;

    if (fs.existsSync(blockletMetaFile)) {
      fs.removeSync(blockletMetaFile);
    }

    if (fs.existsSync(blockletTarballFile)) {
      fs.removeSync(blockletTarballFile);
    }
  }

  logger.info('publish error', { status, message });
  res.status(status).json({ error: message });
};

const validateBody = async (req, res, next) => {
  const blockletMetafile = req.files['blocklet-meta'][0].path;
  const blockletTarballFile = req.files['blocklet-tarball'][0].path;

  if (!blockletMetafile) {
    return responseError(400, 'Invalid blocklet meta file, found empty')(req, res);
  }

  if (!blockletTarballFile) {
    return responseError(400, 'Invalid blocklet tarball file, found empty')(req, res);
  }

  req.blockletMetafile = blockletMetafile;
  req.blockletTarballFile = blockletTarballFile;

  return next();
};

// Do not trust, verify!!!
const validateMeta = async (req, res, next) => {
  const blockletMeta = JSON.parse(fs.readFileSync(req.blockletMetafile).toString());
  try {
    validateBlockletMeta(blockletMeta);
    req.meta = blockletMeta;
    next();
  } catch (err) {
    responseError(400, err.message)(req, res);
  }
};

// Do not trust, verify!!!
const verifySig = async (req, res, next) => {
  const verifyRes = verifyMultiSig(req.meta);
  if (verifyRes !== true) {
    logger.error('invalid signature', { blockletDid: req.meta.did });
    return responseError(401, 'invalid signature')(req, res);
  }

  req.owner = req.meta.signatures[0].pk;

  return next();
};

// Do not trust, verify!!!
const verifyNftFactory = async (req, res, next) => {
  const meta = cloneDeep(req.meta);
  if (isFreeBlocklet(req.meta)) {
    return next();
  }

  // ensure minimum share requirement
  const shares = get(meta, 'charging.shares', []);
  const registryShare = shares.find((x) => x.address === env.wallet.toAddress());
  if (!registryShare) {
    return responseError(400, 'Blocklet share config does not contain registry part')(req, res);
  }
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(Number(registryShare.share)) || Number(registryShare.share) < Number(env.shareRequirement)) {
    return responseError(400, `Blocklet share config does not satisfy requirement, expected ${env.shareRequirement}`)(
      req,
      res
    );
  }

  if (!meta.nftFactory) {
    return responseError(400, 'Missing NFT factory for non-free blocklet')(req, res);
  }

  let factoryState = null;

  // ensure factory exists on chain
  const client = new Client(env.chainHost);
  try {
    const { state } = await client.getFactoryState({ address: meta.nftFactory });
    if (!state) {
      throw new Error('Blocklet NFT factory not found on chain');
    }

    factoryState = state;
  } catch (err) {
    return responseError(400, err.message)(req, res);
  }

  // ensure factory has valid contract in mint hook
  try {
    const { hooks } = factoryState;

    const toBNStr = async (n) => (await client.fromTokenToUnit(n)).toString();

    // reconstruct the contract
    const price = await toBNStr(meta.charging.price || 0);
    const tokens = cloneDeep(meta.charging.tokens || []);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < tokens.length; i++) {
      const { state } = await client.getTokenState({ address: tokens[i].address });
      if (!state) {
        throw new Error(`Token specified in blocklet meta was not found on chain: ${tokens[i].address}`);
      }

      tokens[i].value = await toBNStr(tokens[i].price || 0);
    }
    const contract = createShareContract({ price, tokens, shares });

    // try compile the contract
    compile(contract);

    // the contract must match with the online version
    const mintHook = hooks.find((x) => x.name === 'mint' && x.type === 'contract');
    if (!mintHook) {
      throw new Error('Blocklet NFT factory must have sharing contract as minting hook');
    }
    if (mintHook.hook !== contract) {
      throw new Error('Blocklet NFT factory sharing contract does not match');
    }

    return next();
  } catch (err) {
    return responseError(400, err.message)(req, res);
  }
};

const validatePermissions = async (req, res, next) => {
  const { did } = req.meta;

  const blocklet = await blockletDB.findOne({ did });

  if (!blocklet) {
    return next();
  }

  req.blocklet = blocklet;

  // 兼容，老的 pk 不是 base58
  if (toBase58(blocklet.owner.pk) !== req.owner) {
    return responseError(403, 'No permission to update this blocklet')(req, res);
  }

  // NOTE: lastestVersion 是个拼写错误，但是为了向前兼容需要这么写
  const { version: latestVersion } = blocklet.latestVersion || blocklet.lastestVersion;
  const newVersion = req.meta.version;

  if (semver.lte(newVersion, latestVersion)) {
    return responseError(403, `No permission to publish version less than ${latestVersion} blocklet`)(req, res);
  }

  return next();
};

const verifyTarballIntegrity = async (req, res, next) => {
  const temp = await ssri.fromStream(fs.createReadStream(req.blockletTarballFile), { algorithms: ['sha512'] });
  const tarballIntegrity = temp.toString();
  const { integrity: tarballIntegrityInMetafile } = req.meta.dist;

  if (tarballIntegrity !== tarballIntegrityInMetafile) {
    return responseError(400, 'invalid tarball')(req, res);
  }

  return next();
};

const addExtraFields = (req, res, next) => {
  req.now = new Date().toISOString();
  req.meta.lastPublishedAt = req.now;
  next();
};

const sign = async (req, res, next) => {
  const json = env.wallet.toJSON();

  const signatureData = {
    type: json.type.pk,
    name: env.registryName,
    signer: json.address,
    pk: toBase58(json.pk),
    excludes: ['htmlAst', 'stats'],
    appended: ['htmlAst', 'lastPublishedAt', 'stats'],
    created: new Date().toISOString(),
  };

  req.meta.signatures.unshift(signatureData);
  const sig = toBase58(env.wallet.sign(stableStringify(req.meta)));

  req.meta.signatures[0].sig = sig;
  next();
};

const saveRelease = async (req, res) => {
  const { meta } = req;
  const blockletDestDir = getBlockletDir(blockletRootDir, meta.did, meta.version);
  const isUpdate = !!req.blocklet;
  logger.info('is update', { isUpdate, did: meta.did });

  try {
    const targetBlockletTarballFile = path.join(blockletDestDir, meta.dist.tarball);

    fs.ensureDirSync(blockletDestDir);
    fs.writeFileSync(path.join(blockletDestDir, 'blocklet.json'), JSON.stringify(meta));
    fs.moveSync(req.blockletTarballFile, targetBlockletTarballFile);

    const currentVersion = {
      version: meta.version,
      status: BLOCKLET_STATUS.normal,
      published_at: req.now,
    };

    if (isUpdate) {
      const updateResult = await blockletDB.update(
        { did: req.meta.did },
        {
          $set: { currentVersion, latestVersion: currentVersion, lastPublishedAt: req.now },
          $push: { versions: currentVersion },
        }
      );

      logger.info('update blocklet success', { result: updateResult });
    } else {
      const saveResult = await blockletDB.insert({
        did: meta.did,
        name: meta.name,
        owner: { pk: req.owner },
        currentVersion,
        latestVersion: currentVersion,
        versions: [currentVersion],
        lastPublishedAt: req.now,
      });

      logger.info('create blocklet success', { result: saveResult });
    }

    /*
     * 因为不同版本的 blocklet 只会存在一份 static files, 所以在处理出错的时候需要保证
     * 不删除原来版本的文件
     */
    const staticsDir = path.join(blockletDataDir, 'assets');
    const currentStaticDir = path.join(staticsDir, meta.did);
    try {
      await generateStaticFiles({
        tarballFilepath: targetBlockletTarballFile,
        targetDir: currentStaticDir,
        blockletMeta: meta,
      });
      logger.info('generated blocklet static files', { did: meta.did });
    } catch (error) {
      logger.error('generate blocklet static files failed', { error, did: meta.did });
      if (!isUpdate) {
        fs.removeSync(currentStaticDir);
      }
    }

    return res.json('publish successfully');
  } catch (error) {
    logger.error('publish failed:', { error });
    fs.removeSync(blockletDestDir);

    return res.status(500).json('publish failed');
  }
};

router.post(
  '/blocklets/upload',
  upload.fields([
    { name: 'blocklet-meta', maxCount: 1 },
    { name: 'blocklet-tarball', maxCount: 1 },
  ]),
  validateBody,
  validateMeta,
  verifySig,
  verifyNftFactory,
  validatePermissions,
  verifyTarballIntegrity,
  addExtraFields,
  sign,
  saveRelease
);

module.exports = router;
