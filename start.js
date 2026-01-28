const express = require('express');
const main = require('./main.js');

const port = process.env.PORT || 3000;
express()
  .use(express.json())
  .use(main.default.handle)
  .listen(port, () => console.info(`> Running on port ` + port));
