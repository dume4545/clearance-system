<<<<<<< HEAD
FROM php:8.2-apache

RUN a2enmod rewrite headers
RUN docker-php-ext-install pdo pdo_mysql

# Copy all backend files
COPY . /var/www/html/

# Allow .htaccess overrides in all directories
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/clearance.conf \
 && a2enconf clearance

# Fix uploads folder permissions
RUN mkdir -p /var/www/html/uploads \
 && chown -R www-data:www-data /var/www/html/uploads \
 && chmod -R 755 /var/www/html/uploads

=======
FROM php:8.2-apache

RUN a2enmod rewrite headers
RUN docker-php-ext-install pdo pdo_mysql

# Copy all backend files
COPY . /var/www/html/

# Allow .htaccess overrides in all directories
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/clearance.conf \
 && a2enconf clearance

# Fix uploads folder permissions
RUN mkdir -p /var/www/html/uploads \
 && chown -R www-data:www-data /var/www/html/uploads \
 && chmod -R 755 /var/www/html/uploads

>>>>>>> a8ab0f1133fb7bbd06163066d09088260142bf6d
EXPOSE 80