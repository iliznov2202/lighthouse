#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
docker compose --env-file .env.production -f compose.production.yml exec -T api node scripts/backup.mjs
# Retention, encrypted off-site copy and alerting belong to the deployment's
# backup system. Do not delete an archive until its remote copy is verified.
