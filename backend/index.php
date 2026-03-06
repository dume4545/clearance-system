<?php
// Handle CORS for all requests including OPTIONS preflight
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim($path, '/');

if ($path === '' || $path === '/') {
    echo json_encode(['status' => 'Clearance API is running.']);
    exit;
}

// Map /auth/register → /api/auth/register.php
$phpFile = __DIR__ . '/api' . $path . '.php';

if (is_file($phpFile)) {
    require $phpFile;
    exit;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'message' => "Route not found: $path"]);
