#!/bin/sh
set -e

PORT="${PORT:-80}"
API_UPSTREAM="${API_UPSTREAM:-http://api:3001}"

sed \
  -e "s|__PORT__|${PORT}|g" \
  -e "s|__API_UPSTREAM__|${API_UPSTREAM}|g" \
  /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "Starting nginx on port ${PORT}, API upstream ${API_UPSTREAM}"
nginx -t
exec nginx -g 'daemon off;'
