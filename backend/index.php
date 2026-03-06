<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim($path, '/');

if ($path === '' || $path === '/') {
    echo json_encode(['status' => 'Clearance API is running.']);
    exit;
}

$phpFile = __DIR__ . $path . '.php';

if (is_file($phpFile)) {
    require $phpFile;
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => "Route not found: $path"]);