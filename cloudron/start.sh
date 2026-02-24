#!/bin/bash

# ensure that this file executable in the app repo: chmod +x start.sh.

if [[ ! -f /app/data/.env ]]; then
  printf "BETTER_AUTH_SECRET=\"$( openssl rand -hex 32 )\"\n" > /app/data/.env
fi

chown -R cloudron:cloudron /app/data

exec /usr/local/bin/gosu cloudron:cloudron node --env-file=/app/data/.env build
