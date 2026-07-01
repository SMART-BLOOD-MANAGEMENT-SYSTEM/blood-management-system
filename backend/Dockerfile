FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    unzip git curl zip libzip-dev libpq-dev

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 🔥 أهم سطر (هنا الحل الحقيقي)
WORKDIR /app/backend

# 🔥 ننسخ backend فقط (مش كل الريبو)
COPY backend/ .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=10000
