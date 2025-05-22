/* eslint-disable no-console */
const cors = require('cors');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const fallback = require('@blocklet/sdk/lib/middlewares/fallback');
const logger = require('@blocklet/logger');

const { handlers } = require('../libs/auth');
const claimRoutesAuth = require('../routes/auth/claim');
const claimRoutes = require('../routes/claim');
const envRoutes = require('../routes/env');
const tokenRoutes = require('../routes/token');

const ROOT_DIR = path.resolve(__dirname, '../../');

const isProduction = process.env.NODE_ENV !== 'development';

// Create and config express application
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(favicon(path.join(ROOT_DIR, 'public', 'favicon.ico')));
app.use(express.static(path.join(ROOT_DIR, 'public'), { maxAge: '1d', index: false }));

logger.setupAccessLogger(app);

handlers.attach({ app, ...claimRoutesAuth });

const router = express.Router();
router.use('/api', claimRoutes);
router.use('/api', envRoutes);
router.use('/api', tokenRoutes);

const staticDir = path.resolve(__dirname, '../../', 'dist');
if (isProduction) {
  app.use(router);
  app.use(express.static(staticDir, { maxAge: '365d', index: false }));
  app.use(fallback('index.html', { root: staticDir }));
  // eslint-disable-next-line
  app.use((req, res, next) => {
    res.status(404).json({ error: 'NOT FOUND' });
  });

  // eslint-disable-next-line
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
} else {
  app.use(router);
}

module.exports = {
  server: app,
};
