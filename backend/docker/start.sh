#!/bin/sh
# Runs every time the container starts on Render (see render.yaml). The demo starts again from
# the fake catalog: the free plan's disk is wiped anyway when the server sleeps.
set -e

# Render's generated APP_KEY is a base64 value without Laravel's "base64:" prefix
case "$APP_KEY" in
  base64:*) ;;
  *) export APP_KEY="base64:$APP_KEY" ;;
esac

touch "${DB_DATABASE:-database/database.sqlite}"

php artisan shop:demo-reset --no-interaction   # refuses unless SHOP_DEMO=true
php artisan storage:link --force                # makes the product images reachable
php artisan optimize                            # caches config, routes, views and events

# FrankenPHP serves public/, and sends every other address to Laravel's index.php
exec frankenphp php-server --listen "0.0.0.0:${PORT:-8080}" --root public/
