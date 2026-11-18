#!/usr/bin/env bash
set -euo pipefail
# Docker's Mongo entrypoint drops privileges after initialising the root user.
if [ ! -s /data/key/replica.key ]; then
  umask 077
  openssl rand -base64 512 > /data/key/replica.key
fi
chown mongodb:mongodb /data/key/replica.key
chmod 400 /data/key/replica.key
exec docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /data/key/replica.key
