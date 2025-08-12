sudo a2enmod proxy proxy_http
sudo systemctl restart apache2

cat > /etc/apache2/sites-available/000-default.conf

<VirtualHost *:80>
    ServerName akumars.my.id
    ServerAlias www.akumars.my.id

    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    # Redirect akses via IP langsung ke domain
    RewriteEngine On
    RewriteCond %{HTTP_HOST} ^8\.215\.1\.198$ [OR]
    RewriteCond %{HTTP_HOST} ^127\.0\.0\.1$ [OR]
    RewriteCond %{HTTP_HOST} ^localhost$
    RewriteRule ^ https://akumars.my.id%{REQUEST_URI} [R=301,L]

    # === Reverse‑Proxy Aplikasi ===
    # Game (127.0.0.1:3001) di path /list
    ProxyPass        /list  http://127.0.0.1:3001/
    ProxyPassReverse /list  http://127.0.0.1:3001/

    # Dashboard (127.0.0.1:5173) di path /game
    ProxyPass        /game  http://127.0.0.1:5173/
    ProxyPassReverse /game  http://127.0.0.1:5173/

    # Tambahkan lagi blok ProxyPass/Reverse sesuai port aplikasi lain

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Log
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

sudo a2ensite 000-default.conf
sudo systemctl reload apache2

cat > /etc/apache2/sites-available/000-default-le-ssl.conf

<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName akumars.my.id
    ServerAlias www.akumars.my.id

    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    # === Reverse‑Proxy Aplikasi (HTTPS) ===
    ProxyPass        /list  http://127.0.0.1:3001/
    ProxyPassReverse /list  http://127.0.0.1:3001/

    ProxyPass        /game  http://127.0.0.1:5173/
    ProxyPassReverse /game  http://127.0.0.1:5173/

    # Tambahkan lagi blok ProxyPass/Reverse sesuai port aplikasi lain

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Let’s Encrypt SSL
    Include /etc/letsencrypt/options-ssl-apache.conf
    SSLCertificateFile   /etc/letsencrypt/live/akumars.my.id/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/akumars.my.id/privkey.pem

    # Log
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
</IfModule>

sudo a2ensite 000-default-le-ssl.conf
sudo apache2ctl configtest
sudo systemctl reload apache2

# epic-dragon
cd /path/to/your/epic-dragon
npm install
npm run dev &

# todolist
sudo apt install mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mariadb
CREATE DATABASE todo_list;
USE todo_list;
CREATE TABLE tasks (
     id INT AUTO_INCREMENT PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     due_date DATE,
     description TEXT,
     is_completed BOOLEAN DEFAULT FALSE
);
CREATE USER 'new_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON todo_list.* TO 'new_user'@'localhost';
FLUSH PRIVILEGES;
exit;
cd /path/to/your/todolist
pip install Flask Flask-SQLAlchemy PyMySQL pytz
# Edit app.py with: app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://new_user:password@localhost/todo_list'
python3 app.py &

# shortlink
cd /path/to/your/shortlink
sudo mariadb
CREATE DATABASE shortlink_db;
USE shortlink_db;
CREATE TABLE shortlinks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    short_code VARCHAR(255) NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
# User: admin, Pass: Mars123// in index.php
# Create .htaccess in /shortlink/
RewriteEngine On
RewriteBase /shortlink/
RewriteRule ^([a-zA-Z0-9]+)$ index.php?shortCode=$1 [L,QSA]

# monitoring
# No setup needed, static files.