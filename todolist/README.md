# APLIKASI TO-DO LIST DENGAN DATABASE MARIADB 

1. ```sudo apt install apache2```
2. ```sudo apt install mariadb```
3. ```sudo mariadb```
4. Masukan Command Berikut

**> Membuat Database**
```
CREATE DATABASE todo_list
USE todo_list
```
```
CREATE TABLE tasks (
     id INT AUTO_INCREMENT PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     due_date DATE,
     description TEXT,
     is_completed BOOLEAN DEFAULT FALSE
);
```

**> Membuat User**
```
CREATE USER 'new_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON todo_list.* TO 'new_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```
**CATATAN! Ubah new_user dan password sesuai keinginan dan Buka app.py 
kemudian ubah username dan password yang ada**

5. masuk kebagian file contoh ```cd /var/www/html```
6. ```git clone https://github.com/Aku-Mars/To-doList.git```
7. lanjut
```
pip install Flask Flask-SQLAlchemy PyMySQL pytz
```
**> kalau tidak bisa install node.js dlu**

8. Terakhir ```python3 app.py```
9. Dan Tekan Ctrl + Z dilanjut command ```bg``` agar berjalan di background
10. Cek didalam ip:3000

### NEXT UPDATE
- Penghitung Jumlah Tugas (DONE)
- History (DONE)
- Tampilan Dalam Bentuk Kalender
- Login Kedalam Apps (Sehingga bisa login dan setiap user memiliki database masing-masing
tetapi bisa dilihat orang lain / private sehingg dapat sharing satu sama lain)


