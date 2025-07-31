# Panduan Setup Hosting dengan Apache

Panduan ini menjelaskan langkah-langkah untuk menyiapkan server hosting menggunakan Apache sebagai reverse proxy untuk beberapa aplikasi, termasuk konfigurasi SSL dengan Let's Encrypt.

## Daftar Aplikasi yang Dihosting

*   **To-Do List**: Aplikasi Flask dengan MariaDB yang berjalan di port `3001`.
*   **Epic Dragon (Game)**: Aplikasi React/Vite yang berjalan di port `5173`.
*   **Monitoring Dashboard**: Aplikasi HTML/CSS/JS statis yang berjalan di path biasa.

## 1. Prasyarat

Pastikan Anda memiliki sistem operasi berbasis Debian/Ubuntu (atau yang serupa) dan akses `sudo`.

*   Apache2
*   Certbot (untuk SSL)
*   Node.js & npm (untuk Epic Dragon)
*   Python3 & pip (untuk To-Do List)
*   MariaDB Server (untuk To-Do List)

## 2. Instalasi Apache dan Modul yang Dibutuhkan

```bash
sudo apt update
sudo apt install apache2 certbot python3-certbot-apache
sudo a2enmod proxy proxy_http rewrite ssl
sudo systemctl restart apache2
```

## 3. Konfigurasi Virtual Host Apache (HTTP - Port 80)

Buat atau edit file konfigurasi default Apache Anda. Ganti `akumars.my.id` dengan domain Anda dan `8.215.1.198` dengan IP server Anda.

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Isi file `000-default.conf` dengan konten berikut:

```apache
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
    
    RedirectMatch permanent ^/list$ /list/
    RedirectMatch permanent ^/game$ /game/

    # === Reverse‑Proxy Aplikasi ===
    # Game (127.0.0.1:3001) di path /list
    ProxyPass        /list/  http://127.0.0.1:3001/
    ProxyPassReverse /list/  http://127.0.0.1:3001/

    # Dashboard (127.0.0.1:5173) di path /game
    ProxyPass        /game/  http://127.0.0.1:5173/
    ProxyPassReverse /game/  http://127.0.0.1:5173/

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

```

Aktifkan situs dan reload Apache:

```bash
sudo a2ensite 000-default.conf
sudo systemctl reload apache2
```

## 4. Konfigurasi SSL dengan Certbot

Jalankan Certbot untuk mendapatkan sertifikat SSL dan secara otomatis mengkonfigurasi Virtual Host HTTPS Anda.

```bash
sudo certbot --apache -d akumars.my.id -d www.akumars.my.id
```

Certbot akan membuat file `000-default-le-ssl.conf` secara otomatis. Pastikan konfigurasi `ProxyPass` dan `ProxyPassReverse` di dalamnya sesuai dengan yang ada di `000-default.conf` untuk port 80.

Contoh isi `000-default-le-ssl.conf` setelah dibuat oleh Certbot (pastikan blok `ProxyPass` ditambahkan secara manual jika Certbot tidak menambahkannya):

```apache
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName akumars.my.id
    ServerAlias www.akumars.my.id

    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    RedirectMatch permanent ^/list$ /list/
    RedirectMatch permanent ^/game$ /game/

    # === Reverse‑Proxy Aplikasi (HTTPS) ===
    ProxyPass        /list/  http://127.0.0.1:3001/
    ProxyPassReverse /list/  http://127.0.0.1:3001/

    ProxyPass        /game/  http://127.0.0.1:5173/
    ProxyPassReverse /game/  http://127.0.0.1:5173/

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

```

Uji konfigurasi Apache dan reload:

```bash
sudo a2ensite 000-default-le-ssl.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## 5. Setup Aplikasi

Pastikan setiap aplikasi berjalan pada port yang sesuai agar dapat diakses melalui reverse proxy Apache.

### 5.1. Epic Dragon (Game)

Aplikasi ini akan diakses melalui `https://akumars.my.id/game`.

1.  **Navigasi ke Direktori Proyek:**
    ```bash
    cd /path/to/your/epic-dragon # Sesuaikan dengan lokasi proyek Anda
    ```
2.  **Instal Dependensi:**
    ```bash
    npm install
    ```
3.  **Build Proyek (Opsional, jika ingin menyajikan versi produksi):**
    ```bash
    npm run build
    ```
4.  **Jalankan Aplikasi:**
    Untuk pengembangan, Anda bisa menggunakan `npm run dev` (biasanya di port 5173). Untuk produksi, Anda perlu menyajikan folder `dist` (setelah `npm run build`) atau menggunakan `npx serve` atau `python -m http.server`.

    Jika Anda menggunakan `vite preview` atau `npm run dev`, pastikan untuk mengkonfigurasi `vite.config.ts` agar berjalan di port `5173`.

    Contoh `vite.config.ts` untuk port 5173:
    ```typescript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig({
      plugins: [react()],
      server: {
        port: 5173,
      }
    })
    ```
    Atau, jika Anda menyajikan folder `dist` setelah build:
    ```bash
    npx serve -l 5173 dist &
    ```
    Pastikan proses ini berjalan di latar belakang.

### 5.2. Monitoring Dashboard

Aplikasi ini akan diakses melalui `https://akumars.my.id/monitoring`.

1.  **Navigasi ke Direktori Proyek:**
    ```bash
    cd /path/to/your/monitoring # Sesuaikan dengan lokasi proyek Anda
    ```
2.  **Jalankan Aplikasi:**
    Karena ini adalah aplikasi statis, Anda tidak perlu melakukan apa apa, bisa langsung mengaksesnya saja.

### 5.3. To-Do List

Aplikasi ini akan diakses melalui `https://akumars.my.id/list`.

1.  **Instal MariaDB Server:**
    ```bash
    sudo apt install mariadb-server
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    ```
2.  **Konfigurasi Database MariaDB:**
    Masuk ke shell MariaDB:
    ```bash
    sudo mariadb
    ```
    Buat database dan user:
    ```sql
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
    ```
    **CATATAN!** Ubah `'new_user'` dan `'password'` sesuai keinginan Anda.

3.  **Navigasi ke Direktori Proyek:**
    ```bash
    cd /path/to/your/todolist # Sesuaikan dengan lokasi proyek Anda
    ```
4.  **Instal Dependensi Python:**
    ```bash
    pip install Flask Flask-SQLAlchemy PyMySQL pytz
    ```
    Jika `pip` tidak ditemukan, instal `python3-pip`:
    ```bash
    sudo apt install python3-pip
    ```
5.  **Sesuaikan `app.py`:**
    Buka `app.py` dan ubah kredensial database agar sesuai dengan user dan password yang Anda buat di langkah 2.

    ```python
    # Contoh bagian yang perlu diubah di app.py
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://new_user:password@localhost/todo_list'
    ```

6.  **Jalankan Aplikasi Flask:**
    Pastikan aplikasi berjalan di port `3001`.

    ```bash
    python3 app.py &
    ```
    Gunakan `&` untuk menjalankan di latar belakang. Jika Anda ingin menghentikannya, Anda mungkin perlu mencari PID proses Python dan membunuhnya.

## 6. Verifikasi

Setelah semua aplikasi berjalan dan Apache dikonfigurasi, Anda dapat mengaksesnya melalui domain Anda:

*   **Epic Dragon:** `https://akumars.my.id/list`
*   **Monitoring Dashboard:** `https://akumars.my.id/game`
*   **To-Do List:** `https://akumars.my.id/todo`

Pastikan untuk memeriksa log Apache (`/var/log/apache2/error.log` dan `access.log`) jika Anda mengalami masalah.
