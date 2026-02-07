import express from 'express';

import main from './rs-bind/main.js';
import adapter from './adapter.js';

import { handler } from './build/handler.js';

const port = 3000;
express()
  // .use(express.json())
  // .use(express.raw({
  //   limit: '1mb',
  //   type: '*/*',
  // }))
  .use(main.handler(adapter))
  .use(handler)
  .listen(port, () => console.info(`> Running on port ` + port));
