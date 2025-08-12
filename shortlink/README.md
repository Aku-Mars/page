# 🔗 Mars Shortlink - Pemendek URL Cepat & Mudah

![Shortlink](https://raw.githubusercontent.com/Aku-Mars/gambar/main/bannercps.png)

## Deskripsi Aplikasi

Mars Shortlink adalah aplikasi pemendek URL berbasis web yang memungkinkan Anda mengubah URL panjang menjadi tautan yang lebih pendek, mudah diingat, dan dapat dibagikan. Aplikasi ini mendukung pembuatan shortlink otomatis atau kustom, serta fitur penghapusan tautan. Ideal untuk kebutuhan berbagi tautan di media sosial, presentasi, atau di mana pun ruang karakter menjadi pertimbangan.

## ✨ Fitur Utama

-   **Pemendekan URL:** Ubah URL panjang menjadi shortlink yang ringkas.
-   **Shortlink Kustom:** Buat shortlink dengan kode yang Anda inginkan (misalnya, `akumars.my.id/shortlink/nama-anda`).
-   **Panjang Shortlink Variabel:** Atur panjang shortcode yang dihasilkan secara otomatis.
-   **Pengalihan Cepat:** Redirect pengguna dari shortlink ke URL asli dengan cepat.
-   **Penghapusan Shortlink:** Hapus shortlink yang tidak lagi diperlukan.
-   **Daftar Shortlink:** Melihat daftar shortlink yang sudah dibuat (fitur ini ada di kode tapi dikomentari di UI).

## 🚀 Teknologi yang Digunakan

-   **PHP:** Bahasa pemrograman sisi server untuk logika aplikasi dan interaksi database.
-   **MySQL/MariaDB:** Sistem manajemen database untuk menyimpan data shortlink.
-   **HTML:** Struktur halaman web.
-   **CSS:** Styling dasar antarmuka pengguna.
-   **Apache Mod_Rewrite:** Untuk mengelola pengalihan URL yang bersih dan SEO-friendly.

## 📋 Syarat (Prasyarat)

Untuk menjalankan aplikasi ini, Anda memerlukan lingkungan server web yang mendukung PHP dan database MySQL/MariaDB. Contohnya:

-   **Server Web:** Apache (dengan `mod_rewrite` diaktifkan).
-   **PHP:** Versi 7.x atau lebih tinggi disarankan.
-   **Database:** MySQL atau MariaDB.

## 🛠️ Setup Awal / Instalasi

Ikuti langkah-langkah di bawah ini untuk mengatur dan menjalankan proyek ini di lingkungan lokal Anda:

1.  **Clone Repositori:**
    ```bash
    git clone <URL_REPOSITORI_ANDA>
    cd shortlink
    ```

2.  **Konfigurasi Database:**
    *   Buat database baru (misalnya `shortlink_db`) di MySQL/MariaDB Anda.
    *   Jalankan query SQL berikut untuk membuat tabel `shortlinks`:
        ```sql
        CREATE DATABASE shortlink_db;
        USE shortlink_db;
        CREATE TABLE shortlinks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            short_code VARCHAR(255) NOT NULL,
            original_url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ```
    *   Sesuaikan kredensial database di `index.php` jika diperlukan:
        ```php
        $conn = new mysqli("localhost", "username_anda", "password_anda", "shortlink_db");
        ```

3.  **Konfigurasi Server Web (Apache):**
    *   **Aktifkan `mod_rewrite`:**
        ```bash
        sudo a2enmod rewrite
        sudo systemctl restart apache2
        ```
    *   **Konfigurasi Virtual Host (opsional, jika ingin akses langsung tanpa subfolder):**
        Tambahkan konfigurasi berikut ke file virtual host Anda (misalnya `/etc/apache2/sites-available/000-default.conf`):
        ```apache
        <VirtualHost *:80>
            ServerAdmin webmaster@localhost
            DocumentRoot /var/www/html

            <Directory /var/www/html>
                Options Indexes FollowSymLinks
                AllowOverride All
                Require all granted
            </Directory>

            Alias /shortlink /var/www/html/shortlink
            <Directory /var/www/html/shortlink>
                Options Indexes FollowSymLinks
                AllowOverride All
                Require all granted
            </Directory>

            ErrorLog ${APACHE_LOG_DIR}/error.log
            CustomLog ${APACHE_LOG_DIR}/access.log combined
        </VirtualHost>
        ```
    *   **Buat file `.htaccess` di dalam folder `shortlink`:**
        ```apache
        RewriteEngine On
        RewriteBase /shortlink/

        # Tangani shortlink dengan panjang variabel
        RewriteRule ^([a-zA-Z0-9]+)$ index.php?shortCode=$1 [L,QSA]
        ```
    *   **Restart Apache:**
        ```bash
        sudo systemctl restart apache2
        ```

4.  **Atur Izin File:**
    ```bash
    sudo chown -R www-data:www-data /var/www/html/shortlink
    sudo chmod -R 755 /var/www/html/shortlink
    ```

5.  **Akses Aplikasi:**
    *   Buka browser Anda dan navigasikan ke `http://localhost/shortlink` (sesuaikan jika nama folder atau konfigurasi virtual host Anda berbeda).

## 💡 Potensi Pengembangan Lebih Lanjut

-   **Antarmuka Pengguna yang Lebih Baik:** Tingkatkan desain UI/UX dengan framework CSS modern (Bootstrap, Tailwind CSS) dan JavaScript untuk pengalaman yang lebih interaktif.
-   **Statistik Klik:** Tambahkan fitur untuk melacak jumlah klik pada setiap shortlink.
-   **Manajemen Pengguna:** Implementasikan sistem login/registrasi untuk memungkinkan pengguna mengelola shortlink mereka sendiri.
-   **Validasi Input:** Perkuat validasi URL dan shortcode kustom.
-   **API:** Sediakan API untuk memungkinkan aplikasi lain membuat atau mengelola shortlink secara terprogram.
-   **QR Code Generator:** Tambahkan fitur untuk menghasilkan QR Code dari shortlink.
-   **Kedaluwarsa Shortlink:** Fitur untuk mengatur tanggal kedaluwarsa pada shortlink.
-   **Domain Kustom:** Dukungan untuk menggunakan domain kustom sebagai basis shortlink.
-   **Keamanan:** Implementasikan perlindungan terhadap spam dan penyalahgunaan.