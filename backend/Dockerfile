FROM php:8.2-apache

RUN a2enmod rewrite headers
RUN docker-php-ext-install pdo pdo_mysql

COPY . /var/www/html/

RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html\n\
    FallbackResource /index.php\n\
    <Directory /var/www/html>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

RUN mkdir -p /var/www/html/uploads \
 && chown -R www-data:www-data /var/www/html/uploads \
 && chmod -R 755 /var/www/html/uploads

EXPOSE 80