<?php
// koneksi ke database
$conn = new mysqli("localhost", "admin", "Mars123//", "shortlink_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// fungsi untuk membuat shortlink
function createShortLink($url, $customShortCode = null, $length = 6) {
    global $conn;
    
    if ($customShortCode) {
        $shortCode = $customShortCode;
    } else {
        $shortCode = substr(md5(uniqid(rand(), true)), 0, $length); // membuat kode pendek dengan panjang yang ditentukan
    }
    
    // Cek jika shortCode sudah ada
    $stmt = $conn->prepare("SELECT COUNT(*) FROM shortlinks WHERE short_code = ?");
    $stmt->bind_param("s", $shortCode);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($count);
    $stmt->fetch();
    
    while ($count > 0) {
        // Jika sudah ada, buat shortCode baru dengan panjang yang ditentukan
        $shortCode = substr(md5(uniqid(rand(), true)), 0, $length);
        $stmt->bind_param("s", $shortCode);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($count);
        $stmt->fetch();
    }
    
    $stmt->close();
    $stmt = $conn->prepare("INSERT INTO shortlinks (short_code, original_url) VALUES (?, ?)");
    $stmt->bind_param("ss", $shortCode, $url);
    $stmt->execute();
    return $shortCode;
}

// fungsi untuk mengarahkan shortlink ke URL asli
function redirect($shortCode) {
    global $conn;
    $stmt = $conn->prepare("SELECT original_url FROM shortlinks WHERE short_code = ?");
    $stmt->bind_param("s", $shortCode);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $url = $row['original_url'];
        $stmt->close();
        header("Location: " . $url);
        exit();
    } else {
        echo "Shortlink tidak ditemukan!";
    }
}

// fungsi untuk menghapus shortlink
function deleteShortLink($shortCode) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM shortlinks WHERE short_code = ?");
    $stmt->bind_param("s", $shortCode);
    $stmt->execute();
}

// Cek jika shortCode ada di URL
if (isset($_GET['shortCode'])) {
    $shortCode = $_GET['shortCode'];
    redirect($shortCode);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['url'])) {
        $url = $_POST['url'];
        $customShortCode = isset($_POST['custom_code']) ? $_POST['custom_code'] : null;
        $length = isset($_POST['length']) ? (int)$_POST['length'] : 6; // Ambil panjang dari input, default 6
        $shortCode = createShortLink($url, $customShortCode, $length);
        $shortLink = "https://akumars.my.id/s/" . $shortCode;
    } elseif (isset($_POST['delete_code'])) {
        $shortCode = $_POST['delete_code'];
        deleteShortLink($shortCode);
        $message = "Shortlink " . $shortCode . " berhasil dihapus.";
    }
}

function getAllShortLinks() {
    global $conn;
    $result = $conn->query("SELECT short_code, original_url FROM shortlinks");
    return $result->fetch_all(MYSQLI_ASSOC);
}

$shortLinks = getAllShortLinks();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="Short Your Link Here">
    <meta property="og:description" content="Mars Hub">
    <meta property="og:image" content="https://raw.githubusercontent.com/Aku-Mars/gambar/main/bannercps.png">
    <meta property="og:url" content="https://akumars.my.id/">    
    <title>Mars Shortlink</title>
    <link rel="icon" href="https://raw.githubusercontent.com/Aku-Mars/gambar/main/neko.png" type="image/x-icon">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
        }
        input[type="text"], input[type="number"] {
            width: 100%;
            padding: 10px;
            margin: 10px -10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0056b3;
        }
        p {
            margin-top: 20px;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .shortlink-list {
            margin-top: 20px;
            text-align: left;
            overflow-x: auto;
        }
        .shortlink-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #ddd;
            flex-wrap: wrap;
        }
        .shortlink-item:last-child {
            border-bottom: none;
        }
        .shortlink-item span {
            max-width: 100%;
        }
        .shortlink-item a,
        .shortlink-item .original-url {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: calc(100% - 100px);
        }
        .shortlink-item form {
            margin: 0;
        }
        .message {
            color: green;
        }
        .error {
            color: red;
        }
        @media (max-width: 600px) {
            .shortlink-item a,
            .shortlink-item .original-url {
                max-width: calc(100% - 70px);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Buat Shortlink</h1>
        <form method="POST" action="">
            <input type="text" name="url" placeholder="Masukkan URL" required>
            <input type="text" name="custom_code" placeholder="Custom shortlink (optional)">
            <input type="number" name="length" placeholder="Panjang shortlink (default: 6)" min="1" max="10" value="6">
            <button type="submit">Buat Shortlink</button>
        </form>
        <?php if (isset($shortLink)) { ?>
            <p>Shortlink Anda: <a href="<?php echo $shortLink; ?>" target="_blank"><?php echo $shortLink; ?></a></p>
        <?php } ?>
        <?php if (isset($message)) { ?>
            <p class="message"><?php echo $message; ?></p>
        <?php } ?>

        <!-- <div class="shortlink-list">
            <h2>Daftar Shortlink</h2>
            <?php
            foreach ($shortLinks as $link) {
                echo "<div class='shortlink-item'>
                        <span>
                            <a href='https://akumars.my.id/s/" . $link['short_code'] . "' target='_blank'>" . $link['short_code'] . "</a>
                            <span class='original-url'>" . $link['original_url'] . "</span>
                        </span>
                        <form method='POST' action=''>
                            <input type='hidden' name='delete_code' value='" . $link['short_code'] . "'>
                            <button type='submit'>Hapus</button>
                        </form>
                      </div>";
            }
            ?>
        </div> -->

    </div>
</body>
</html>
