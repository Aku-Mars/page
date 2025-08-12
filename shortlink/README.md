# Mars Shortlink

Aplikasi pemendek URL (URL shortener) yang komprehensif dan kaya fitur, dibangun dengan PHP dan MySQL.

## Fitur Utama

- **Sistem Pengguna Lengkap**: Registrasi, login, dan manajemen password yang aman.
- **Fitur "Ingat Saya"**: Kemampuan untuk tetap login dengan aman menggunakan cookies.
- **Manajemen Link Pribadi**: Pengguna dapat membuat, mengedit, dan menghapus shortlink mereka sendiri.
- **URL Otomatis**: Otomatis menambahkan `https://` ke URL jika tidak ada protokol (http/https) yang dimasukkan.
- **Pelacakan Klik**: Melacak jumlah klik untuk setiap shortlink.
- **Kode QR**: Membuat kode QR secara instan untuk setiap link.
- **Link Kedaluwarsa**: Atur tanggal kedaluwarsa. Status (Aktif/Kadaluwarsa) ditampilkan dengan jelas dan dapat diubah.
- **Pencarian**: Cari link dengan cepat berdasarkan kode pendek atau URL asli.

## Fitur Admin

- **Dasbor Admin Komprehensif**: Menampilkan statistik total (pengguna, link, klik) dan grafik interaktif.
- **Grafik Visual**: Pie chart untuk "Top Users" & "Top Links", serta Line chart untuk tren pembuatan link dan pendaftaran pengguna dari waktu ke waktu.
- **Filter Waktu**: Semua grafik dapat difilter berdasarkan rentang waktu (30 hari, 1 tahun, semua).
- **CRUD Pengguna**: Admin dapat membuat, melihat, mengedit (username & password), dan menghapus pengguna.
- **Lihat Link Pengguna**: Admin dapat melihat semua link yang dimiliki oleh pengguna tertentu.

## Persyaratan

- PHP
- MySQL atau MariaDB
- Web server (Apache, Nginx, dll.)

## Pengaturan

1.  **Konfigurasi Database**:
    - Buat sebuah database (contoh: `shortlink_db`).
    - Jalankan TIGA perintah `CREATE TABLE` di bawah ini untuk membuat tabel `users`, `shortlinks`, dan `auth_tokens`.
    - Perbarui kredensial database (`$db_host`, `$db_user`, `$db_pass`, `$db_name`) di bagian atas file `index.php`.

2.  **Konfigurasi Web Server**:
    - Letakkan folder `shortlink` di direktori root web server Anda.
    - Pastikan `mod_rewrite` (untuk Apache) aktif dan `AllowOverride All` diatur untuk web root.
    - Aturan rewrite untuk aplikasi ini harus diletakkan di file `.htaccess` **root** (`/var/www/html/.htaccess`) atau di konfigurasi Virtual Host.

3.  **Buat Pengguna Admin**:
    - Daftarkan pengguna baru dengan `username` **admin**. Pengguna ini akan memiliki akses ke semua fitur admin.

## Skema Database

**1. Tabel `users`:**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. Tabel `shortlinks`:**
```sql
CREATE TABLE shortlinks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    short_code VARCHAR(255) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    user_id INT NULL,
    click_count INT DEFAULT 0,
    expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**3. Tabel `auth_tokens` (untuk "Ingat Saya")**
```sql
CREATE TABLE `auth_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `selector` varchar(255) NOT NULL,
  `hashed_validator` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `expires` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `selector` (`selector`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```
