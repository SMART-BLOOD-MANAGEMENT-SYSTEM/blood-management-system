FROM php:8.2-cli
RUN apt-get update && apt-get install -y \
    unzip git curl zip libzip-dev libpq-dev
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql zip
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app/backend

COPY backend/ .
RUN composer install --no-interaction --prefer-dist --optimize-autoloader
RUN chmod -R 775 storage bootstrap/cache


RUN php artisan config:clear
RUN php artisan cache:clear

EXPOSE 10000
CMD php artisan serve --host=0.0.0.0 --port=$PORT
