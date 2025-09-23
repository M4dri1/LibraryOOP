FROM php:8.1-apache

RUN docker-php-ext-install pdo pdo_mysql

ENV APACHE_DOCUMENT_ROOT /var/www/html/public/frontend

RUN sed -ri -e 's!/var/www/html!/var/www/html/public/frontend!g' /etc/apache2/sites-available/000-default.conf

RUN echo 'Alias /api /var/www/html/public/api\n\
    <Directory /var/www/html/public/api>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
    </Directory>' > /etc/apache2/conf-available/api-alias.conf \
    && a2enconf api-alias

# Define books.html como página inicial (DirectoryIndex)
RUN echo 'DirectoryIndex books.html' > /etc/apache2/conf-available/front-index.conf \
    && a2enconf front-index

COPY ./ /var/www/html

EXPOSE 80
