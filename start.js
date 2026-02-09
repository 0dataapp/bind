import express from 'express';

import bind from 'remotestorage-middleware';

import storage from './adapter.js';
import { tokens } from './tokens.js';

import { handler } from './build/handler.js';

const prefix = 'storage';
const port = 3000;
express()
  .use(bind.options())
  .use(bind.webfinger({
    prefix,
  }))
  .enable('trust proxy')
  .use(`/${ prefix }`, express.json(), express.raw({
    limit: '1mb',
    type: '*/*',
  }), bind.storage({
    getScope: tokens.getScope,
    storage,
  }))
  .use(handler)
  .listen(port, () => console.info(`> Running on port ` + port));
