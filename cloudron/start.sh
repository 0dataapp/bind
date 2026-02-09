#!/bin/bash

# ensure that this file executable in the app repo: chmod +x start.sh.

if [[ ! -f /app/data/.env ]]; then
  cp /app/code/.env-sample /app/data/.env
fi

mkdir -p /app/data/__storage

chown -R cloudron:cloudron /app/data

exec /usr/local/bin/gosu cloudron:cloudron node --env-file=/app/data/.env start.js
