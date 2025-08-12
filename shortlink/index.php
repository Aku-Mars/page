<?php
session_start();

// Konfigurasi dan Koneksi Database (TIDAK ADA PERUBAHAN)
$db_host = "localhost";
$db_user = "admin";
$db_pass = "Mars123//";
$db_name = "shortlink_db";
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

// ====== FUNGSI-FUNGSI HELPER ======
function isLoggedIn() { return isset($_SESSION['user_id']); }
function isAdmin() { return isLoggedIn() && isset($_SESSION['username']) && $_SESSION['username'] === 'admin'; }
function getUsername() { return isset($_SESSION['username']) ? $_SESSION['username'] : 'Guest'; }
function create_auth_token($userId) { global $conn; $selector = bin2hex(random_bytes(8)); $validator = bin2hex(random_bytes(20)); $hashed_validator = hash('sha256', $validator); $expires = new DateTime('+30 days'); $expires_str = $expires->format('Y-m-d H:i:s'); $stmt = $conn->prepare("INSERT INTO auth_tokens (selector, hashed_validator, user_id, expires) VALUES (?, ?, ?, ?)"); $stmt->bind_param("ssis", $selector, $hashed_validator, $userId, $expires_str); if ($stmt->execute()) { setcookie('remember_selector', $selector, $expires->getTimestamp(), '/'); setcookie('remember_validator', $validator, $expires->getTimestamp(), '/'); } }
function clear_auth_tokens($userId) { global $conn; $stmt = $conn->prepare("DELETE FROM auth_tokens WHERE user_id = ?"); $stmt->bind_param("i", $userId); $stmt->execute(); if (isset($_COOKIE['remember_selector'])) { setcookie('remember_selector', '', time() - 3600, '/'); } if (isset($_COOKIE['remember_validator'])) { setcookie('remember_validator', '', time() - 3600, '/'); } }
function login_via_cookie() { global $conn; if (isLoggedIn()) return false; if (isset($_COOKIE['remember_selector']) && isset($_COOKIE['remember_validator'])) { $selector = $_COOKIE['remember_selector']; $validator = $_COOKIE['remember_validator']; $stmt = $conn->prepare("SELECT * FROM auth_tokens WHERE selector = ? AND expires >= NOW()"); $stmt->bind_param("s", $selector); $stmt->execute(); $result = $stmt->get_result(); if ($token = $result->fetch_assoc()) { $hashed_validator_from_cookie = hash('sha256', $validator); if (hash_equals($token['hashed_validator'], $hashed_validator_from_cookie)) { $user = getUserById($token['user_id']); if ($user) { $_SESSION['user_id'] = $user['id']; $_SESSION['username'] = $user['username']; clear_auth_tokens($user['id']); create_auth_token($user['id']); return true; } } } } return false; }
function loginUser($username, $password, $remember_me) { global $conn; $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?"); $stmt->bind_param("s", $username); $stmt->execute(); $result = $stmt->get_result(); if ($user = $result->fetch_assoc()) { if (password_verify($password, $user['password'])) { $_SESSION['user_id'] = $user['id']; $_SESSION['username'] = $username; if ($remember_me) { clear_auth_tokens($user['id']); create_auth_token($user['id']); } return true; } } return false; }

/**
 * PERUBAHAN: Fungsi Register User
 * - Menambahkan pengecekan apakah username sudah ada.
 * - Mengembalikan 'exists' jika username sudah terdaftar.
 * - Mengembalikan true jika berhasil, false jika gagal karena alasan lain.
 */
function registerUser($username, $password) {
    global $conn;
    // 1. Cek apakah username sudah ada
    $stmt_check = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt_check->bind_param("s", $username);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    if ($result_check->num_rows > 0) {
        $stmt_check->close();
        return 'exists'; // Username sudah ada
    }
    $stmt_check->close();

    // 2. Jika tidak ada, lanjutkan proses registrasi
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt_insert = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt_insert->bind_param("ss", $username, $hashed_password);
    if ($stmt_insert->execute()) {
        return true; // Registrasi berhasil
    } else {
        return false; // Gagal karena error database lain
    }
}

function changePassword($userId, $newPassword) { global $conn; $hashed_password = password_hash($newPassword, PASSWORD_DEFAULT); $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?"); $stmt->bind_param("si", $hashed_password, $userId); return $stmt->execute(); }
function getAllUsers() { global $conn; return $conn->query("SELECT id, username, created_at FROM users ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC); }
function getUserById($userId) { global $conn; $stmt = $conn->prepare("SELECT id, username FROM users WHERE id = ?"); $stmt->bind_param("i", $userId); $stmt->execute(); return $stmt->get_result()->fetch_assoc(); }
function updateUserAsAdmin($userId, $newUsername) { global $conn; $stmt = $conn->prepare("UPDATE users SET username = ? WHERE id = ?"); $stmt->bind_param("si", $newUsername, $userId); return $stmt->execute(); }
function updateUserPasswordAsAdmin($userId, $newPassword) { global $conn; $hashed_password = password_hash($newPassword, PASSWORD_DEFAULT); $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?"); $stmt->bind_param("si", $hashed_password, $userId); return $stmt->execute(); }
function deleteUserAsAdmin($userId) { global $conn; $stmt = $conn->prepare("DELETE FROM users WHERE id = ?"); $stmt->bind_param("i", $userId); return $stmt->execute(); }
function format_url($url) { return (!preg_match("~^(?:f|ht)tps?://~i", $url)) ? "https://" . $url : $url; }
function createShortLink($url, $userId, $customShortCode = null, $length = 6, $expires_at = null) { global $conn; $url = format_url($url); if ($customShortCode) { $shortCode = $customShortCode; } else { $shortCode = substr(md5(uniqid(rand(), true)), 0, $length); } $stmt = $conn->prepare("SELECT short_code FROM shortlinks WHERE short_code = ?"); $stmt->bind_param("s", $shortCode); $stmt->execute(); if ($stmt->get_result()->num_rows > 0) { return false; } $stmt = $conn->prepare("INSERT INTO shortlinks (original_url, short_code, user_id, expires_at) VALUES (?, ?, ?, ?)"); $stmt->bind_param("ssis", $url, $shortCode, $userId, $expires_at); return $stmt->execute() ? $shortCode : false; }
function redirectLink($shortCode) { global $conn; $stmt = $conn->prepare("SELECT original_url, expires_at FROM shortlinks WHERE short_code = ?"); $stmt->bind_param("s", $shortCode); $stmt->execute(); $result = $stmt->get_result(); if ($row = $result->fetch_assoc()) { if ($row['expires_at'] && strtotime($row['expires_at']) < time()) { http_response_code(404); die("Shortlink ini telah kedaluwarsa."); } $updateStmt = $conn->prepare("UPDATE shortlinks SET click_count = click_count + 1 WHERE short_code = ?"); $updateStmt->bind_param("s", $shortCode); $updateStmt->execute(); header("Location: " . $row['original_url']); exit(); } else { http_response_code(404); die("Shortlink tidak ditemukan!"); } }
function getShortLinksForUser($userId, $search = '', $limit = 5, $offset = 0) { global $conn; $sql = "SELECT short_code, original_url, click_count, expires_at FROM shortlinks WHERE user_id = ?"; $params = ["i", $userId]; if (!empty($search)) { $sql .= " AND (short_code LIKE ? OR original_url LIKE ?)"; $searchTerm = "%{$search}%"; $params[0] .= "ss"; $params[] = $searchTerm; $params[] = $searchTerm; } $sql .= " ORDER BY created_at DESC"; if ($limit !== 'all') { $sql .= " LIMIT ? OFFSET ?"; $params[0] .= "ii"; $params[] = $limit; $params[] = $offset; } $stmt = $conn->prepare($sql); $stmt->bind_param(...$params); $stmt->execute(); return $stmt->get_result()->fetch_all(MYSQLI_ASSOC); }
function getTotalShortLinksForUser($userId, $search = '') { global $conn; $sql = "SELECT COUNT(*) as total FROM shortlinks WHERE user_id = ?"; $params = ["i", $userId]; if (!empty($search)) { $sql .= " AND (short_code LIKE ? OR original_url LIKE ?)"; $searchTerm = "%{$search}%"; $params[0] .= "ss"; $params[] = $searchTerm; $params[] = $searchTerm; } $stmt = $conn->prepare($sql); $stmt->bind_param(...$params); $stmt->execute(); return $stmt->get_result()->fetch_assoc()['total']; }
function getSingleShortLink($shortCode, $userId) { global $conn; $stmt = $conn->prepare("SELECT short_code, original_url, expires_at FROM shortlinks WHERE short_code = ? AND (user_id = ? OR 1 = ?)"); $isAdmin = isAdmin() ? 1 : 0; $stmt->bind_param("sii", $shortCode, $userId, $isAdmin); $stmt->execute(); return $stmt->get_result()->fetch_assoc(); }
function updateShortLink($shortCode, $originalUrl, $expiresAt, $userId) { global $conn; $originalUrl = format_url($originalUrl); $stmt = $conn->prepare("UPDATE shortlinks SET original_url = ?, expires_at = ? WHERE short_code = ? AND (user_id = ? OR 1 = ?)"); $isAdmin = isAdmin() ? 1 : 0; $stmt->bind_param("sssii", $originalUrl, $expiresAt, $shortCode, $userId, $isAdmin); return $stmt->execute(); }
function deleteShortLink($shortCode, $userId) { global $conn; $stmt = $conn->prepare("DELETE FROM shortlinks WHERE short_code = ? AND user_id = ?"); $stmt->bind_param("si", $shortCode, $userId); return $stmt->execute(); }
function getDashboardStats() { global $conn; $stats = []; $stats['users'] = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count']; $stats['links'] = $conn->query("SELECT COUNT(*) as count FROM shortlinks")->fetch_assoc()['count']; $stats['clicks'] = $conn->query("SELECT SUM(click_count) as count FROM shortlinks")->fetch_assoc()['count'] ?: 0; return $stats; }
function getLineChartData($table, $timespan) { global $conn; $date_filter = ''; if ($timespan === 'month') { $date_filter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'; } elseif ($timespan === 'year') { $date_filter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)'; } return $conn->query("SELECT DATE(created_at) as date, COUNT(*) as count FROM {$table} {$date_filter} GROUP BY DATE(created_at) ORDER BY date ASC")->fetch_all(MYSQLI_ASSOC); }
function getPieChartData($type, $timespan) { global $conn; $date_filter = ''; if ($timespan === 'month') { $date_filter = 'WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'; } elseif ($timespan === 'year') { $date_filter = 'WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)'; } if ($type === 'top_users') { $query = "SELECT u.username as label, COUNT(s.id) as value FROM users u JOIN shortlinks s ON u.id = s.user_id {$date_filter} GROUP BY u.id ORDER BY value DESC LIMIT 5"; } else { $query = "SELECT s.short_code as label, s.click_count as value FROM shortlinks s ORDER BY value DESC LIMIT 5"; } return $conn->query($query)->fetch_all(MYSQLI_ASSOC); }

// ====== ROUTING & CONTROLLER LOGIC ======
if (!isLoggedIn()) { login_via_cookie(); }
if (isset($_GET['shortCode'])) { redirectLink($_GET['shortCode']); }
$action = isset($_GET['action']) ? $_GET['action'] : 'home';
if (!isLoggedIn() && $action !== 'login' && $action !== 'register') { $action = 'login'; }
if (isLoggedIn() && ($action === 'login' || $action === 'register')) { $action = 'home'; }
if (!isAdmin() && $action === 'admin_dashboard') { $action = 'home'; }
$message = ''; $error = ''; $pageData = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $post_action = isset($_POST['action']) ? $_POST['action'] : '';
    if ($post_action === 'login') { if (!empty($_POST['username']) && !empty($_POST['password'])) { if (loginUser($_POST['username'], $_POST['password'], isset($_POST['remember_me']))) { header("Location: index.php?action=home"); exit(); } else { $error = "Username atau password salah."; } } else { $error = "Input tidak boleh kosong."; } $action = 'login'; }
    elseif ($post_action === 'create_link' && isLoggedIn()) { $pageData['form_input'] = $_POST; if (!empty($_POST['url'])) { $expires_at = !empty($_POST['expires_at']) ? date('Y-m-d H:i:s', strtotime($_POST['expires_at'])) : null; $shortCode = createShortLink($_POST['url'], $_SESSION['user_id'], $_POST['custom_code'], 6, $expires_at); if ($shortCode) { $message = "Shortlink berhasil dibuat!"; unset($pageData['form_input']); } else { $error = "Custom code sudah digunakan, silakan gunakan kode lain."; } } else { $error = "URL tidak boleh kosong."; } $action = 'home'; }
    elseif ($post_action === 'update_link' && isLoggedIn()) { if (!empty($_POST['original_url']) && !empty($_POST['short_code'])) { $expires_at = !empty($_POST['expires_at']) ? date('Y-m-d H:i:s', strtotime($_POST['expires_at'])) : null; if (updateShortLink($_POST['short_code'], $_POST['original_url'], $expires_at, $_SESSION['user_id'])) { $message = "Shortlink berhasil diupdate."; } else { $error = "Gagal mengupdate shortlink."; } } else { $error = "URL tidak boleh kosong."; } $action = 'home'; }
    
    /**
     * PERUBAHAN: Logika Controller untuk Registrasi
     * - Memeriksa hasil dari fungsi registerUser().
     * - Menampilkan pesan error yang sesuai jika username sudah ada.
     */
    elseif ($post_action === 'register') {
        if (!empty($_POST['username']) && !empty($_POST['password'])) {
            $registrationResult = registerUser($_POST['username'], $_POST['password']);
            if ($registrationResult === true) {
                $message = "Registrasi berhasil! Silakan login.";
                $action = 'login';
            } elseif ($registrationResult === 'exists') {
                $error = "Username sudah ada. Silakan pilih yang lain.";
                $action = 'register';
            } else {
                $error = "Terjadi kesalahan saat registrasi. Silakan coba lagi.";
                $action = 'register';
            }
        } else {
            $error = "Input tidak boleh kosong.";
            $action = 'register';
        }
    }

    elseif ($post_action === 'delete_link' && isLoggedIn()) { if (deleteShortLink($_POST['delete_code'], $_SESSION['user_id'])) { $message = "Shortlink berhasil dihapus."; } else { $error = "Gagal menghapus shortlink."; } $action = 'home'; }
    elseif ($post_action === 'change_password' && isLoggedIn()) { if (!empty($_POST['new_password'])) { if (changePassword($_SESSION['user_id'], $_POST['new_password'])) { $message = "Password berhasil diubah."; } else { $error = "Gagal mengubah password."; } } else { $error = "Password baru tidak boleh kosong."; } $action = 'changepass'; }
    elseif ($post_action === 'admin_update_user' && isAdmin()) { if (!empty($_POST['username']) && !empty($_POST['user_id'])) { updateUserAsAdmin($_POST['user_id'], $_POST['username']); if (!empty($_POST['new_password'])) { updateUserPasswordAsAdmin($_POST['user_id'], $_POST['new_password']); } $message = "Pengguna berhasil diupdate."; } else { $error = "Input tidak boleh kosong."; } $action = 'users'; }
    elseif ($post_action === 'admin_delete_user' && isAdmin()) { if (!empty($_POST['user_id'])) { if (deleteUserAsAdmin($_POST['user_id'])) { $message = "Pengguna berhasil dihapus."; } else { $error = "Gagal menghapus pengguna."; } } else { $error = "User ID tidak valid."; } $action = 'users'; }
}
if ($action === 'logout') { if(isLoggedIn()) { clear_auth_tokens($_SESSION['user_id']); } session_destroy(); header("Location: index.php"); exit(); }
$admin_only_actions = ['users', 'edit_user', 'delete_user', 'view_links'];
if (in_array($action, $admin_only_actions) && !isAdmin()) { $action = 'home'; $error = "Anda tidak memiliki hak akses."; }
$searchQuery = isset($_GET['search']) ? $_GET['search'] : '';
if (isLoggedIn()) {
    if ($action === 'home') {
        $limit_options = [5, 10, 25, 50, 'all'];
        $limit = isset($_GET['limit']) && in_array($_GET['limit'], $limit_options) ? $_GET['limit'] : 5;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $totalLinks = getTotalShortLinksForUser($_SESSION['user_id'], $searchQuery);
        $totalPages = ($limit !== 'all' && $totalLinks > 0) ? ceil($totalLinks / $limit) : 1;
        $page = max(1, min($page, $totalPages));
        $offset = ($limit !== 'all') ? ($page - 1) * $limit : 0;
        $pageData['userLinks'] = getShortLinksForUser($_SESSION['user_id'], $searchQuery, $limit, $offset);
        $pageData['pagination'] = ['limit' => $limit, 'page' => $page, 'totalPages' => $totalPages, 'totalLinks' => $totalLinks];
    }
    if (isAdmin()) {
        if ($action === 'admin_dashboard') { $pageData['stats'] = getDashboardStats(); $pageData['pieChartData'] = ['top_users' => ['month' => getPieChartData('top_users', 'month'), 'year' => getPieChartData('top_users', 'year'), 'all' => getPieChartData('top_users', 'all')], 'top_links' => ['month' => getPieChartData('top_links', 'month'), 'year' => getPieChartData('top_links', 'year'), 'all' => getPieChartData('top_links', 'all')]]; $pageData['lineChartData'] = ['users' => ['month' => getLineChartData('users', 'month'), 'year' => getLineChartData('users', 'year'), 'all' => getLineChartData('users', 'all')], 'links' => ['month' => getLineChartData('shortlinks', 'month'), 'year' => getLineChartData('shortlinks', 'year'), 'all' => getLineChartData('shortlinks', 'all')]]; }
        if ($action === 'users') { $pageData['allUsers'] = getAllUsers(); }
        if (in_array($action, $admin_only_actions)) { $userId = isset($_GET['id']) ? (int)$_GET['id'] : 0; if ($userId > 0) { $pageData['user'] = getUserById($userId); if ($action === 'view_links') { $pageData['userLinks'] = getShortLinksForUser($userId, $searchQuery); } } else if ($action !== 'users') { $action = 'users'; $error = "User ID tidak valid."; } }
    }
    if ($action === 'edit_link') { $code = isset($_GET['code']) ? $_GET['code'] : ''; if (!empty($code)) { $pageData['link'] = getSingleShortLink($code, $_SESSION['user_id']); if (!$pageData['link']) { $error = "Link tidak ditemukan atau Anda tidak punya hak akses."; $action = 'home'; } } else { $action = 'home'; } }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mars Shortlink</title>
    <link rel="icon" href="https://raw.githubusercontent.com/Aku-Mars/gambar/main/neko.png" type="image/x-icon">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* PERUBAHAN: CSS Disesuaikan untuk Tampilan Lebih Ringkas */
        :root {
            --primary-color: #4a6cf7; --primary-hover: #294ee8;
            --sidebar-bg: #1c2434; --sidebar-text: #dee4ee; --sidebar-active: #3c50e0;
            --content-bg: #f1f5f9; --card-bg: #ffffff;
            --text-dark: #1c2434; --text-light: #64748b;
            --border-color: #e2e8f0; --border-radius: 8px;
            --shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            --transition: all 0.3s ease-in-out;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 15px; } /* Ukuran font dasar dikecilkan */
        body {
            font-family: 'Poppins', sans-serif; background-color: var(--content-bg);
            color: var(--text-dark); display: flex; min-height: 100vh;
        }
        .login-wrapper {
            display: flex; align-items: center; justify-content: center;
            width: 100%; min-height: 100vh; padding: 1.5rem;
        }
        /* -- Sidebar -- */
        .sidebar {
            background-color: var(--sidebar-bg); width: 240px; /* Lebar sidebar dikurangi */
            padding: 1.2rem; /* Padding dikurangi */
            display: flex; flex-direction: column;
            transition: margin-left 0.3s ease;
        }
        .sidebar-header { margin-bottom: 2rem; text-align: center; }
        .sidebar-header a {
            color: white; font-size: 1.6rem; font-weight: 700; /* Font size dikecilkan */
            text-decoration: none;
        }
        .sidebar-nav ul { list-style: none; }
        .sidebar-nav a {
            display: flex; align-items: center; gap: 0.8rem; /* Gap dikurangi */
            padding: 0.8rem 1rem; /* Padding dikurangi */
            margin-bottom: 0.4rem; /* Margin dikurangi */
            color: var(--sidebar-text); text-decoration: none;
            border-radius: var(--border-radius); font-weight: 500;
            transition: var(--transition);
            font-size: 0.95rem; /* Font size dikecilkan */
        }
        .sidebar-nav a:hover, .sidebar-nav a.active {
            background-color: var(--sidebar-active); color: white;
        }
        .sidebar-nav .nav-category {
            font-size: 0.75rem; color: #8a99af; font-weight: 600;
            padding: 0 1rem; margin-top: 1.2rem; margin-bottom: 0.4rem;
            text-transform: uppercase;
        }
        .sidebar-footer { margin-top: auto; text-align: center; }
        .sidebar-footer .user-info {
            padding: 0.8rem; border-top: 1px solid #3d4d60;
        }
        .sidebar-footer .username {
            color: white; font-weight: 600; display: block;
        }
        .sidebar-footer .logout-btn {
            color: #b4c9de; font-size: 0.85rem; text-decoration: none;
        }
        /* -- Main Content -- */
        .main-wrapper {
            flex: 1; display: flex; flex-direction: column;
            transition: margin-left 0.3s ease;
        }
        .main-content { padding: 1.5rem; } /* Padding dikurangi */
        .page-header { margin-bottom: 1.5rem; } /* Margin dikurangi */
        .page-header h1 { font-size: 1.8rem; font-weight: 700; } /* Font size dikecilkan */
        .page-header p { color: var(--text-light); font-size: 1rem; } /* Font size dikecilkan */
        /* -- Dashboard Stat Cards -- */
        .stats-grid {
            display: grid; gap: 1.2rem; /* Gap dikurangi */
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .stat-card {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1.2rem; /* Padding dikurangi */
            border-radius: var(--border-radius);
            color: white; box-shadow: var(--shadow);
            transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-card .stat-info h3 { font-size: 2.2rem; font-weight: 700; } /* Font size dikecilkan */
        .stat-card .stat-info p { font-size: 0.9rem; font-weight: 500; opacity: 0.9; } /* Font size dikecilkan */
        .stat-card .stat-icon { font-size: 3rem; opacity: 0.8; } /* Font size dikecilkan */
        .stat-card.color-1 { background: linear-gradient(to right, #654ea3, #eaafc8); }
        .stat-card.color-2 { background: linear-gradient(to right, #ff512f, #f09819); }
        .stat-card.color-3 { background: linear-gradient(to right, #2193b0, #6dd5ed); }
        /* -- Universal Card Style -- */
        .card {
            background-color: var(--card-bg); border-radius: var(--border-radius);
            padding: 1.5rem; /* Padding dikurangi */
            box-shadow: var(--shadow);
        }
        .card-header {
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.8rem; margin-bottom: 1.2rem; /* Padding & Margin dikurangi */
        }
        .card-header h2 { font-size: 1.15rem; font-weight: 600; } /* Font size dikecilkan */
        /* -- Form & Table Styles -- */
        input, button, .button, select {
            width: 100%; padding: 0.7rem 0.9rem; margin: 0.4rem 0; /* Padding & Margin dikurangi */
            border: 1px solid var(--border-color); border-radius: 6px;
            box-sizing: border-box; font-family: 'Poppins', sans-serif;
            font-size: 0.9rem; /* Font size dikecilkan */
            transition: var(--transition);
        }
        input:focus {
            outline: none; border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
        }
        button, .button {
            background-color: var(--primary-color); color: white;
            border: none; cursor: pointer; font-weight: 500;
        }
        button:hover, .button:hover { background-color: var(--primary-hover); }
        button.danger, .button.danger { background-color: #ef4444; }
        button.danger:hover, .button.danger:hover { background-color: #dc2626; }
        button.success, .button.success { background-color: #10b981; }
        button.success:hover, .button.success:hover { background-color: #059669; }
        .form-container { max-width: 450px; margin: 2rem auto; }
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 1.2rem; }
        th, td {
            text-align: center;
            padding: 0.8rem; /* Padding dikurangi */
            border-bottom: 1px solid var(--border-color);
            vertical-align: middle;
            font-size: 0.9rem; /* Font size dikecilkan */
        }
        th { font-weight: 600; color: var(--text-light); font-size: 0.8rem; }
        
        td.actions {
            display: flex; gap: 0.4rem; justify-content: center;
            align-items: center; flex-wrap: wrap;
        }
        
        td.actions .button, td.actions button {
            width: auto; 
            padding: 0.3rem 0.6rem; 
            font-size: 0.75rem;
        }

        .message, .error {
            padding: 0.8rem; border-radius: var(--border-radius); margin-bottom: 1.2rem;
            font-size: 0.9rem;
        }
        .message { background-color: #f0fdf4; color: #15803d; }
        .error { background-color: #fef2f2; color: #b91c1c; }
        /* -- Chart & Mobile -- */
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-top: 1.5rem; }
        .mobile-menu-toggle {
            display: none; background: none; border: none; font-size: 1.5rem;
            cursor: pointer; position: absolute; top: 1.5rem; right: 1.5rem;
        }
        @media (max-width: 768px) {
            body { flex-direction: column; }
            .sidebar {
                position: fixed; left: -240px; height: 100%; z-index: 1000;
            }
            body.sidebar-active .sidebar { margin-left: 0; left: 0; }
            .main-wrapper { margin-left: 0 !important; }
            .mobile-menu-toggle { display: block; }
            .charts-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<?php if (!isLoggedIn()): ?>
    <div class="login-wrapper">
        <div class="card form-container">
            <div class="card-header">
                <h2><?php echo $action === 'register' ? 'Registrasi Akun Baru' : 'Selamat Datang!'; ?></h2>
            </div>
            <?php if ($message): ?><div class="message"><?php echo $message; ?></div><?php endif; ?>
            <?php if ($error): ?><div class="error"><?php echo $error; ?></div><?php endif; ?>

            <?php if ($action === 'register'): ?>
                <form method="POST" action="index.php?action=register">
                    <input type="hidden" name="action" value="register">
                    <input type="text" name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Register</button>
                </form>
                <p style="text-align:center; margin-top: 1rem; font-size: 0.9rem;">Sudah punya akun? <a href="index.php?action=login">Login di sini</a></p>
            <?php else: ?>
                <form method="POST" action="index.php?action=login">
                    <input type="hidden" name="action" value="login">
                    <input type="text" name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <button type="submit" style="width: auto;">Login</button>
                        <label style="font-size: 0.85rem;"><input type="checkbox" name="remember_me" value="1" style="width:auto; margin-right: 5px; vertical-align: middle;"> Ingat Saya</label>
                    </div>
                </form>
                <p style="text-align:center; margin-top: 1rem; font-size: 0.9rem;">Belum punya akun? <a href="index.php?action=register">Register di sini</a></p>
            <?php endif; ?>
        </div>
    </div>
<?php else: ?>
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <a href="index.php">MarsLink</a>
        </div>
        <nav class="sidebar-nav">
            <ul>
                <li><p class="nav-category">Menu</p></li>
                <li><a href="index.php?action=home" class="<?php echo ($action === 'home' || $action === 'edit_link') ? 'active' : ''; ?>">Dasbor Pengguna</a></li>
                <?php if (isAdmin()): ?>
                <li><a href="index.php?action=admin_dashboard" class="<?php echo $action === 'admin_dashboard' ? 'active' : ''; ?>">Dasbor Admin</a></li>
                <li><p class="nav-category">Manajemen</p></li>
                <li><a href="index.php?action=users" class="<?php echo in_array($action, ['users', 'edit_user', 'delete_user', 'view_links']) ? 'active' : ''; ?>">Pengguna</a></li>
                <?php endif; ?>
                <li><p class="nav-category">Akun</p></li>
                <li><a href="index.php?action=changepass" class="<?php echo $action === 'changepass' ? 'active' : ''; ?>">Ganti Password</a></li>
            </ul>
        </nav>
        <div class="sidebar-footer">
            <div class="user-info">
                <span class="username"><?php echo htmlspecialchars(getUsername()); ?></span>
                <a href="index.php?action=logout" class="logout-btn">Logout</a>
            </div>
        </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
        <main class="main-content">
            <?php if ($message): ?><div class="message"><?php echo $message; ?></div><?php endif; ?>
            <?php if ($error): ?><div class="error"><?php echo $error; ?></div><?php endif; ?>

            <?php // ====== VIEW ADMIN DASHBOARD ====== ?>
            <?php if (isAdmin() && $action === 'admin_dashboard'): ?>
                <div class="page-header">
                    <h1>Dasbor Admin</h1>
                    <p>Ringkasan statistik keseluruhan sistem.</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card color-1"><div class="stat-info"><h3><?php echo $pageData['stats']['users']; ?></h3><p>Total Pengguna</p></div><div class="stat-icon">👥</div></div>
                    <div class="stat-card color-2"><div class="stat-info"><h3><?php echo $pageData['stats']['links']; ?></h3><p>Total Shortlinks</p></div><div class="stat-icon">🔗</div></div>
                    <div class="stat-card color-3"><div class="stat-info"><h3><?php echo $pageData['stats']['clicks']; ?></h3><p>Total Klik</p></div><div class="stat-icon">🖱️</div></div>
                </div>
                <div class="charts-grid">
                    <div class="card"><div class="card-header"><h2>Pengguna Baru per Hari</h2></div><canvas id="usersLineChart"></canvas></div>
                    <div class="card"><div class="card-header"><h2>Shortlink Dibuat per Hari</h2></div><canvas id="linksLineChart"></canvas></div>
                    <div class="card"><div class="card-header"><h2>Top 5 Pengguna (by Links)</h2></div><canvas id="usersPieChart"></canvas></div>
                    <div class="card"><div class="card-header"><h2>Top 5 Links (by Clicks)</h2></div><canvas id="linksPieChart"></canvas></div>
                </div>
                <script>
                    const pieChartData=<?php echo json_encode($pageData['pieChartData']);?>;const lineChartData=<?php echo json_encode($pageData['lineChartData']);?>;
                    function preparePieData(a){return{labels:a.map(a=>a.label),datasets:[{data:a.map(a=>a.value),backgroundColor:["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF"],hoverOffset:4}]}}
                    function prepareLineData(a){return{labels:a.map(a=>a.date),datasets:[{label:"Jumlah",data:a.map(a=>a.count),fill:!0,borderColor:"#4a6cf7",backgroundColor:"rgba(74,108,247,0.1)",tension:.4}]}}
                    new Chart(document.getElementById("usersPieChart"),{type:"doughnut",data:preparePieData(pieChartData.top_users.all),options:{responsive:!0}});
                    new Chart(document.getElementById("linksPieChart"),{type:"doughnut",data:preparePieData(pieChartData.top_links.all),options:{responsive:!0}});
                    new Chart(document.getElementById("usersLineChart"),{type:"line",data:prepareLineData(lineChartData.users.all),options:{responsive:!0}});
                    new Chart(document.getElementById("linksLineChart"),{type:"line",data:prepareLineData(lineChartData.links.all),options:{responsive:!0}});
                </script>

            <?php // ====== VIEW MANAJEMEN PENGGUNA ====== ?>
            <?php elseif (isAdmin() && in_array($action, ['users', 'edit_user', 'delete_user', 'view_links'])): ?>
                <div class="page-header"><h1>Manajemen Pengguna</h1></div>
                <div class="card">
                    <?php if ($action === 'edit_user' && isset($pageData['user'])): ?>
                        <div class="card-header"><h2>Edit Pengguna: <?php echo htmlspecialchars($pageData['user']['username']); ?></h2></div>
                        <form method="POST" action="index.php?action=users"><input type="hidden" name="action" value="admin_update_user"><input type="hidden" name="user_id" value="<?php echo $pageData['user']['id']; ?>"><label>Username</label><input type="text" name="username" value="<?php echo htmlspecialchars($pageData['user']['username']); ?>" required><label>Password Baru (Opsional)</label><input type="password" name="new_password" placeholder="Kosongkan jika tidak ingin diubah"><button type="submit">Update Pengguna</button></form>
                        <a href="index.php?action=users" style="display:inline-block; margin-top:1rem;">&larr; Kembali ke daftar</a>
                    <?php elseif ($action === 'delete_user' && isset($pageData['user'])): ?>
                         <div class="card-header"><h2>Konfirmasi Hapus</h2></div>
                         <p>Anda yakin ingin menghapus pengguna <strong><?php echo htmlspecialchars($pageData['user']['username']); ?></strong>? Semua shortlink miliknya akan terhapus permanen.</p>
                         <form method="POST" action="index.php?action=users" style="display:flex; gap:1rem; margin-top:1rem;"><input type="hidden" name="action" value="admin_delete_user"><input type="hidden" name="user_id" value="<?php echo $pageData['user']['id']; ?>"><button type="submit" class="danger">Ya, Hapus</button><a href="index.php?action=users" class="button">Batal</a></form>
                    <?php elseif ($action === 'view_links' && isset($pageData['user'])): ?>
                        <div class="card-header"><h2>Melihat Links Milik: <?php echo htmlspecialchars($pageData['user']['username']); ?></h2></div>
                        <div class="table-responsive"><table><thead><tr><th>Shortlink</th><th>URL Asli</th><th>Klik</th><th>Status</th></tr></thead><tbody>
                        <?php foreach ($pageData['userLinks'] as $link): ?>
                        <tr><td><a href="https://akumars.my.id/s/<?php echo htmlspecialchars($link['short_code']); ?>" target="_blank"><?php echo htmlspecialchars($link['short_code']); ?></a></td><td><a href="<?php echo htmlspecialchars($link['original_url']); ?>" target="_blank" title="<?php echo htmlspecialchars($link['original_url']); ?>"><?php echo substr(htmlspecialchars($link['original_url']), 0, 50); ?>...</a></td><td><?php echo $link['click_count']; ?></td><td><?php $now=time();$expires=strtotime($link['expires_at']);if(!$link['expires_at']){echo '<span style="color:green;">Aktif</span>';}elseif($expires<$now){echo '<span style="color:red;">Kadaluwarsa</span>';}else{echo date('d M Y H:i', $expires);}?></td></tr>
                        <?php endforeach; if (empty($pageData['userLinks'])): ?><tr><td colspan="4" style="text-align:center;">Pengguna ini belum memiliki link.</td></tr><?php endif; ?>
                        </tbody></table></div>
                        <a href="index.php?action=users" style="display:inline-block; margin-top:1rem;">&larr; Kembali ke daftar</a>
                    <?php else: ?>
                        <div class="card-header"><h2>Daftar Semua Pengguna</h2></div>
                        <div class="table-responsive"><table><thead><tr><th>ID</th><th>Username</th><th>Terdaftar</th><th>Aksi</th></tr></thead><tbody>
                        <?php foreach (getAllUsers() as $user): ?>
                        <tr><td><?php echo $user['id']; ?></td><td><?php echo htmlspecialchars($user['username']); ?></td><td><?php echo date('d M Y', strtotime($user['created_at'])); ?></td><td class="actions"><a class="button" href="index.php?action=view_links&id=<?php echo $user['id']; ?>">Links</a><a class="button success" href="index.php?action=edit_user&id=<?php echo $user['id']; ?>">Edit</a><a class="button danger" href="index.php?action=delete_user&id=<?php echo $user['id']; ?>">Hapus</a></td></tr>
                        <?php endforeach; ?>
                        </tbody></table></div>
                    <?php endif; ?>
                </div>

            <?php // ====== VIEW PENGGUNA (HOME, EDIT, CHANGEPASS) ====== ?>
            <?php else: ?>
                <div class="page-header">
                    <h1><?php echo ($action === 'home') ? 'Dasbor Anda' : (($action === 'edit_link') ? 'Edit Shortlink' : 'Ganti Password'); ?></h1>
                    <?php if($action === 'home'): ?><p>Buat, lihat, dan kelola semua shortlink Anda di sini.</p><?php endif; ?>
                </div>
                <div class="card">
                    <?php if ($action === 'home'): ?>
                        <div class="card-header"><h2>Buat Shortlink Baru</h2></div>
                        <form method="POST" action="index.php"><input type="hidden" name="action" value="create_link"><input type="url" name="url" placeholder="https://example.com" value="<?php echo isset($pageData['form_input']['url']) ? htmlspecialchars($pageData['form_input']['url']) : ''; ?>" required><input type="text" name="custom_code" placeholder="Custom code (opsional)" value="<?php echo isset($pageData['form_input']['custom_code']) ? htmlspecialchars($pageData['form_input']['custom_code']) : ''; ?>"><input type="datetime-local" name="expires_at" title="Tanggal kedaluwarsa (opsional)"><button type="submit">Buat</button></form>
                        <hr style="margin: 1.5rem 0; border:none; border-top: 1px solid var(--border-color);">
                        <div class="card-header" style="border:none; padding-bottom:0;"><h2>Daftar Shortlink Anda</h2></div>
                        <form method="GET" action="index.php" style="display:flex; gap:0.5rem; max-width:400px;"><input type="hidden" name="action" value="home"><input type="text" name="search" placeholder="Cari..." value="<?php echo htmlspecialchars($searchQuery); ?>"><button type="submit" style="width:auto;">Cari</button></form>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; flex-wrap: wrap; gap: 1rem;">
                            <form method="GET" action="index.php" style="display:flex; align-items:center; gap:0.5rem; margin: 0;">
                                <input type="hidden" name="action" value="home">
                                <label for="limit" style="font-size: 0.85rem; white-space: nowrap;">Tampilkan:</label>
                                <select name="limit" id="limit" onchange="this.form.submit()" style="width: auto; padding: 0.4rem; font-size: 0.85rem; margin: 0;">
                                    <option value="5" <?php if ($pageData['pagination']['limit'] == 5) echo 'selected'; ?>>5</option>
                                    <option value="10" <?php if ($pageData['pagination']['limit'] == 10) echo 'selected'; ?>>10</option>
                                    <option value="25" <?php if ($pageData['pagination']['limit'] == 25) echo 'selected'; ?>>25</option>
                                    <option value="50" <?php if ($pageData['pagination']['limit'] == 50) echo 'selected'; ?>>50</option>
                                    <option value="all" <?php if ($pageData['pagination']['limit'] == 'all') echo 'selected'; ?>>Semua</option>
                                </select>
                            </form>
                            <?php if ($pageData['pagination']['limit'] !== 'all' && $pageData['pagination']['totalPages'] > 1): ?>
                            <div class="pagination-controls" style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 0.85rem;">Halaman <?php echo $pageData['pagination']['page']; ?> dari <?php echo $pageData['pagination']['totalPages']; ?></span>
                                <div style="display: flex; gap: 0.5rem;">
                                    <?php if ($pageData['pagination']['page'] > 1): ?>
                                        <a href="?action=home&limit=<?php echo $pageData['pagination']['limit']; ?>&page=<?php echo $pageData['pagination']['page'] - 1; ?>&search=<?php echo htmlspecialchars($searchQuery); ?>" class="button" style="width:auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">&laquo;</a>
                                    <?php endif; ?>
                                    <?php if ($pageData['pagination']['page'] < $pageData['pagination']['totalPages']): ?>
                                        <a href="?action=home&limit=<?php echo $pageData['pagination']['limit']; ?>&page=<?php echo $pageData['pagination']['page'] + 1; ?>&search=<?php echo htmlspecialchars($searchQuery); ?>" class="button" style="width:auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">&raquo;</a>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <?php endif; ?>
                        </div>

                        <div class="table-responsive"><table><thead><tr><th>Shortlink</th><th>URL Asli</th><th>Klik</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
                        <?php foreach ($pageData['userLinks'] as $link): ?>
                        <tr><td><a href="https://akumars.my.id/s/<?php echo htmlspecialchars($link['short_code']); ?>" target="_blank"><?php echo htmlspecialchars($link['short_code']); ?></a></td><td><a href="<?php echo htmlspecialchars($link['original_url']); ?>" target="_blank" title="<?php echo htmlspecialchars($link['original_url']); ?>"><?php echo substr(htmlspecialchars($link['original_url']), 0, 40); ?>...</a></td><td><?php echo $link['click_count']; ?></td><td><?php $now=time();$expires=strtotime($link['expires_at']);if(!$link['expires_at']){echo '<span style="color:green;">Aktif</span>';}elseif($expires<$now){echo '<span style="color:red;">Kadaluwarsa</span>';}else{echo date('d M Y H:i', $expires);}?></td><td class="actions"><a class="button success" href="index.php?action=edit_link&code=<?php echo htmlspecialchars($link['short_code']); ?>">Edit</a><a class="button" href="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://akumars.my.id/s/<?php echo urlencode($link['short_code']); ?>" target="_blank">QR</a><form method="POST" action="index.php" style="margin:0;"><input type="hidden" name="action" value="delete_link"><input type="hidden" name="delete_code" value="<?php echo htmlspecialchars($link['short_code']); ?>"><button type="submit" class="danger">Hapus</button></form></td></tr>
                        <?php endforeach; if (empty($pageData['userLinks'])): ?><tr><td colspan="5" style="text-align:center;">Belum ada link.</td></tr><?php endif; ?>
                        </tbody></table></div>
                    <?php elseif ($action === 'edit_link' && isset($pageData['link'])):
                        $link = $pageData['link']; $expires_value = $link['expires_at'] ? date('Y-m-d\TH:i', strtotime($link['expires_at'])) : ''; ?>
                        <div class="card-header"><h2>Edit: <?php echo htmlspecialchars($link['short_code']); ?></h2></div>
                        <form method="POST" action="index.php"><input type="hidden" name="action" value="update_link"><input type="hidden" name="short_code" value="<?php echo htmlspecialchars($link['short_code']); ?>"><label>URL Asli</label><input type="url" name="original_url" value="<?php echo htmlspecialchars($link['original_url']); ?>" required><label>Tanggal Kedaluwarsa</label><input type="datetime-local" name="expires_at" value="<?php echo $expires_value; ?>"><button type="submit">Update Link</button></form>
                        <a href="index.php?action=home" style="display:inline-block; margin-top:1rem;">&larr; Kembali ke dasbor</a>
                    <?php elseif ($action === 'changepass'): ?>
                        <div class="card-header"><h2>Ganti Password Anda</h2></div>
                        <form method="POST" action="index.php?action=changepass"><input type="hidden" name="action" value="change_password"><input type="password" name="new_password" placeholder="Masukkan password baru" required><button type="submit">Ubah Password</button></form>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </main>
    </div>
<?php endif; ?>

</body>
</html>
