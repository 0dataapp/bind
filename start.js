import express from 'express';

import bind from './rs-bind/main.js';

import storage from './adapter.js';
import { tokens } from './src/lib/oauth/main.node.js';

import { handler } from './build/handler.js';

const port = 3000;
express()
  // .use(express.json())
  // .use(express.raw({
  //   limit: '1mb',
  //   type: '*/*',
  // }))
  .use(bind.handler({
    getScope: tokens.getScope,
    storage,
  }))
  .use(handler)
  .listen(port, () => console.info(`> Running on port ` + port));
