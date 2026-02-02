import express from 'express';
import main from './main.js';
import adapter from './adapter.js';

const port = process.env.PORT || 3000;
express()
  .use(express.json())
  .use(express.raw({
    limit: '1mb',
    type: '*/*',
  }))
  .use(main.handler(adapter))
  .listen(port, () => console.info(`> Running on port ` + port));
