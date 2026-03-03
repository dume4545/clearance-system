FROM php:8.2-apache

RUN a2enmod rewrite headers
RUN docker-php-ext-install pdo pdo_mysql

COPY . /var/www/html/

RUN sed -i 's|AllowOverride None|AllowOverride All|g' /etc/apache2/apache2.conf

RUN mkdir -p /var/www/html/uploads \
 && chown -R www-data:www-data /var/www/html/uploads \
 && chmod -R 755 /var/www/html/uploads

EXPOSE 80