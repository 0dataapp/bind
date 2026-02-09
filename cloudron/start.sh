#!/bin/bash

# ensure that this file executable in the app repo: chmod +x start.sh.

mkdir -p /app/data/__storage

chown -R cloudron:cloudron /app/data

exec /usr/local/bin/gosu cloudron:cloudron npm run production
