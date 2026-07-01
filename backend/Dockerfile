FROM php:8.2-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    zip \
    libzip-dev \
    libpq-dev

# PHP extensions (IMPORTANT for Laravel + PostgreSQL)
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Permissions (important for Laravel)
RUN chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 10000

# Start Laravel server
CMD php artisan serve --host=0.0.0.0 --port=10000
