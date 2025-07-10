from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import pytz
import secrets

# ======================================================================
# 1. CLASS MIDDLEWARE UNTUK REVERSE PROXY
# Class ini ditambahkan untuk memberitahu Flask bahwa ia berjalan di sub-direktori
# ======================================================================
class ReverseProxied(object):
    def __init__(self, app, script_name=None, scheme=None, server=None):
        self.app = app
        self.script_name = script_name
        self.scheme = scheme
        self.server = server

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '') or self.script_name
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ.get('PATH_INFO', '')
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]
        scheme = environ.get('HTTP_X_SCHEME', '') or self.scheme
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        server = environ.get('HTTP_X_FORWARDED_HOST', '') or self.server
        if server:
            environ['HTTP_HOST'] = server
        return self.app(environ, start_response)

# Inisialisasi Aplikasi Flask
app = Flask(__name__)

# ======================================================================
# 2. PENERAPAN MIDDLEWARE
# Baris ini menerapkan class di atas ke aplikasi Anda, dengan path '/list'
# ======================================================================
app.wsgi_app = ReverseProxied(app.wsgi_app, script_name='/list')


# Konfigurasi Aplikasi
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:Mars123//@localhost/todo_list'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = secrets.token_hex(16)
db = SQLAlchemy(app)

# Model Database (Tidak ada perubahan)
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date)
    is_completed = db.Column(db.Boolean, default=False)

class DeletedTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date)
    deleted_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes / Logic Aplikasi (Tidak ada perubahan)
@app.route('/')
def index():
    tasks = Task.query.all()
    deleted_tasks = DeletedTask.query.all()

    day_names = {
        'Monday': 'Senin',
        'Tuesday': 'Selasa',
        'Wednesday': 'Rabu',
        'Thursday': 'Kamis',
        'Friday': 'Jumat',
        'Saturday': 'Sabtu',
        'Sunday': 'Minggu'
    }

    return render_template('index.html', tasks=tasks, deleted_tasks=deleted_tasks, dayNames=day_names)

@app.route('/add_task', methods=['POST'])
def add_task():
    title = request.form['title']
    description = request.form['description']
    due_date = request.form['due_date']

    task = Task(title=title, description=description, due_date=due_date)
    db.session.add(task)

    try:
        db.session.commit()
        flash('Tugas berhasil ditambahkan!', 'success')
    except Exception as e:
        flash('Gagal menambahkan tugas. Error: {}'.format(str(e)), 'error')
        db.session.rollback()

    return redirect(url_for('index'))

@app.route('/edit_task/<int:id>', methods=['GET', 'POST'])
def edit_task(id):
    task = Task.query.get(id)

    if request.method == 'POST':
        task.title = request.form['title']
        task.description = request.form['description']
        due_date_str = request.form['due_date']
        task.due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date() if due_date_str else None

        try:
            db.session.commit()
            flash('Tugas berhasil diubah!', 'success')
        except Exception as e:
            flash('Gagal mengubah tugas. Error: {}'.format(str(e)), 'error')
            db.session.rollback()

        return redirect(url_for('index'))

    return render_template('edit_task.html', task=task)

@app.route('/delete_task/<int:id>', methods=['GET', 'POST'])
def delete_task(id):
    task = Task.query.get(id)
    if task is None:
        flash('Tugas tidak ditemukan.', 'error')
        return redirect(url_for('index'))

    if request.method == 'POST':
        deleted_task = DeletedTask(
            title=task.title,
            description=task.description,
            due_date=task.due_date,
        )

        db.session.add(deleted_task)
        db.session.delete(task)

        try:
            db.session.commit()
            flash('Tugas dihapus dan dipindahkan ke riwayat!', 'success')
        except Exception as e:
            flash('Gagal menghapus tugas. Error: {}'.format(str(e)), 'error')
            db.session.rollback()

        return redirect(url_for('index'))

    return render_template('confirm_delete.html', task=task)

@app.route('/riwayat')
def riwayat():
    deleted_tasks = DeletedTask.query.all()

    day_names = {
        'Monday': 'Senin',
        'Tuesday': 'Selasa',
        'Wednesday': 'Rabu',
        'Thursday': 'Kamis',
        'Friday': 'Jumat',
        'Saturday': 'Sabtu',
        'Sunday': 'Minggu'
    }

    # Konversi waktu ke zona waktu Asia/Jakarta
    jakarta_timezone = pytz.timezone('Asia/Jakarta')
    for deleted_task in deleted_tasks:
        deleted_task.deleted_at = deleted_task.deleted_at.astimezone(jakarta_timezone) + timedelta(hours=8)

    return render_template('riwayat.html', deleted_tasks=deleted_tasks, dayNames=day_names, pytz=pytz)

@app.route('/restore_task/<int:id>', methods=['GET', 'POST'])
def restore_task(id):
    deleted_task = DeletedTask.query.get(id)

    if request.method == 'POST':
        task = Task(
            title=deleted_task.title,
            description=deleted_task.description,
            due_date=deleted_task.due_date,
        )

        db.session.add(task)
        db.session.delete(deleted_task)

        try:
            db.session.commit()
            flash('Tugas berhasil dikembalikan!', 'success')
        except Exception as e:
            flash('Gagal mengembalikan tugas. Error: {}'.format(str(e)), 'error')
            db.session.rollback()

        return redirect(url_for('index'))

    return render_template('confirm_restore.html', task=deleted_task)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # ======================================================================
    # 3. KOREKSI PORT
    # Port diubah dari 3000 menjadi 3001 agar sesuai dengan konfigurasi Apache
    # ======================================================================
    app.run(debug=True, host='0.0.0.0', port=3001)