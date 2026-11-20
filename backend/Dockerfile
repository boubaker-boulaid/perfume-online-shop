# The backend's image, for the demo on Render (render.yaml at the repository's root).
# FrankenPHP is PHP with its own web server, so one process serves the whole API.
FROM dunglas/frankenphp:1-php8.4-bookworm

# Composer, and unzip so it can install the packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-shop.ini"

WORKDIR /app

# The packages first: this layer is reused as long as composer.lock doesn't change
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-interaction

CMD ["/app/docker/start.sh"]
