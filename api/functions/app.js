/* eslint-disable global-require */
/* eslint-disable no-console */
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const fallback = require('express-history-api-fallback');

const publishRoutes = require('../routes/upload');
const blockletRoutes = require('../routes/blocklet');
const registryRoutes = require('../routes/registry');
const nftRoutes = require('../routes/nft');
const { blockletDataDir } = require('../libs/env');
const { ASSETS_PATH_PREFIX } = require('../libs/constant');

const ROOT_DIR = path.resolve(__dirname, '../../');

// Create and config express application
const app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(favicon(path.join(ROOT_DIR, 'public', 'favicon.ico')));
app.use(express.static(path.join(ROOT_DIR, 'public'), { maxAge: '1d', index: false }));
app.use(ASSETS_PATH_PREFIX, express.static(path.join(blockletDataDir, 'assets'), { maxAge: '1d', index: false }));

app.use(
  morgan((tokens, req, res) => {
    const log = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');

    return log;
  })
);

const router = express.Router();
router.use('/api', blockletRoutes);
router.use('/api', publishRoutes);
router.use('/api', registryRoutes);
router.use('/api', nftRoutes);
app.use(router);

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.BLOCKLET_APP_ID;
const staticDir = path.resolve(__dirname, '../../', 'build');
if (isProduction) {
  app.use(express.static(staticDir, { maxAge: '365d', index: false }));
  app.use(fallback('index.html', { root: staticDir }));
}

if (process.env.BLOCKLET_DID) {
  app.use(`/${process.env.BLOCKLET_DID}`, router);
  app.use(`/${process.env.BLOCKLET_DID}`, express.static(staticDir, { maxAge: '365d', index: false }));
}
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, './public/redirect.html'));
});

// eslint-disable-next-line
app.use((req, res, next) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

// eslint-disable-next-line
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

exports.server = app;
