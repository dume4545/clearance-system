<?php
$host     = getenv('MYSQLHOST')     ?: 'localhost';
$port     = getenv('MYSQLPORT')     ?: '3306';
$dbname   = getenv('MYSQLDATABASE') ?: 'clearance_db';
$username = getenv('MYSQLUSER')     ?: 'root';
$password = getenv('MYSQLPASSWORD') ?: '';
$charset  = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Aiven requires SSL — only activates when MYSQL_SSL_CA is set
// Locally this block is skipped automatically
$ssl_ca = getenv('MYSQL_SSL_CA') ?: '';
if ($ssl_ca) {
    $options[PDO::MYSQL_ATTR_SSL_CA]                 = $ssl_ca;
    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

if (!function_exists('getDB')) {
    function getDB() { global $pdo; return $pdo; }
}
