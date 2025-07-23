<?php
// Konfigurasi database
$host = '8.215.1.198'; // Ganti dengan host Anda
$user = 'admin'; // Ganti dengan user Anda
$password = 'Mars123//'; // Ganti dengan password Anda
$dbname = 'porto_db'; // Ganti dengan nama database Anda

// Buat koneksi
$conn = new mysqli($host, $user, $password, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// --- Logic Utama ---

// 1. Dapatkan informasi pengunjung
$ip_address = $_SERVER['REMOTE_ADDR'];
$user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown';
date_default_timezone_set('Asia/Jakarta'); // Set timezone ke WIB

// 2. Perbarui total pengunjung (tabel views)
$conn->query("UPDATE views SET count = count + 1 WHERE id = 1");

// 3. Catat kunjungan saat ini (tabel visit_logs)
$log_sql = "INSERT INTO visit_logs (ip_address, visit_time) VALUES (?, NOW())";
$log_stmt = $conn->prepare($log_sql);
$log_stmt->bind_param("s", $ip_address);
$log_stmt->execute();
$log_stmt->close();

// 4. Hitung jumlah kunjungan dari IP ini hari ini
$count_today_sql = "SELECT COUNT(*) as today_count FROM visit_logs WHERE ip_address = ? AND DATE(visit_time) = CURDATE()";
$count_stmt = $conn->prepare($count_today_sql);
$count_stmt->bind_param("s", $ip_address);
$count_stmt->execute();
$count_result = $count_stmt->get_result();
$count_row = $count_result->fetch_assoc();
$visits_today = $count_row['today_count'];
$count_stmt->close();

// 5. Ambil total pengunjung
$result = $conn->query("SELECT count FROM views WHERE id = 1");
$row = $result->fetch_assoc();
$total_views = $row['count'];

// Tutup koneksi database
$conn->close();

// --- Fungsi Bantuan ---
function getDeviceType($userAgent) {
    if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', $userAgent)) {
        return 'Tablet';
    }
    if (preg_match('/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds)/i', $userAgent)) {
        return 'Mobile';
    }
    if (preg_match('/(windows|macintosh|linux)/i', $userAgent)) {
        return 'PC/Desktop';
    }
    return 'Unknown';
}

// --- Webhook Notification Logic ---

// Dapatkan informasi tambahan
$device_type = getDeviceType($user_agent);
$access_time = date('H:i:s'); // Waktu dalam format Jam:Menit:Detik

// Dapatkan informasi geolokasi dari IP
$geoip_url = "http://ip-api.com/json/{$ip_address}";
$geoip_data = json_decode(file_get_contents($geoip_url), true);

$country = isset($geoip_data['country']) ? $geoip_data['country'] : 'Unknown';
$region = isset($geoip_data['regionName']) ? $geoip_data['regionName'] : 'Unknown';
$city = isset($geoip_data['city']) ? $geoip_data['city'] : 'Unknown';
$isp = isset($geoip_data['isp']) ? $geoip_data['isp'] : 'Unknown';

// Siapkan data untuk dikirim ke Discord
$webhook_url = 'https://discord.com/api/webhooks/1396436570608898068/24HxXVISytveEbG8PWG4KqV03zyau6UeQncI3mAM_aTe9D5mqGFK8KqV03zyau6UeQncI3mAM_aTe9D5mqGFK8iblrXWTZ';
$timestamp = date("c");

$embed = [
    "title" => "🚀 Pengunjung Baru di Portofolio Anda!",
    "description" => "Seseorang baru saja mengunjungi halaman portofolio Anda.",
    "color" => hexdec("00FF00"),
    "fields" => [
        [
            "name" => "📍 Lokasi",
            "value" => "**Kota:** {$city}\n**Wilayah:** {$region}\n**Negara:** {$country}",
            "inline" => true
        ],
        [
            "name" => "🌐 Jaringan",
            "value" => "**Alamat IP:** {$ip_address}\n**ISP:** {$isp}",
            "inline" => true
        ],
        [
            "name" => "🔍 Info Tambahan",
            "value" => "**Jam Akses:** {$access_time}\n**Perangkat:** {$device_type}\n**Kunjungan IP Hari Ini:** {$visits_today}",
            "inline" => false
        ],
        [
            "name" => "💻 Perangkat & Browser",
            "value" => "```{$user_agent}```",
            "inline" => false
        ]
    ],
    "footer" => [
        "text" => "Total Pengunjung: {$total_views}"
    ],
    "timestamp" => $timestamp
];

$payload = json_encode(["embeds" => [$embed]]);

// Kirim notifikasi menggunakan cURL
$ch = curl_init($webhook_url);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_exec($ch);
curl_close($ch);

// --- End of Webhook Logic ---

// Kembalikan hitungan sebagai JSON (untuk frontend)
header('Content-Type: application/json');
echo json_encode(['count' => $total_views]);
?>