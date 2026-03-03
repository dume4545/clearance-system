<?php
// ── router.php — REQUIRED for PHP built-in server ────────────────────────────
// Run from the backend/ folder:
//   php -S localhost:8000 router.php
//
// This script does what .htaccess does for Apache:
// it maps /api/auth/register → /api/auth/register.php

$uri  = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH); // strip query string

// 1. Serve real static files as-is (images, css, etc.)
$realFile = __DIR__ . $path;
if ($path !== '/' && is_file($realFile)) {
    return false; // let PHP built-in server handle it
}

// 2. Try appending .php
$phpFile = __DIR__ . rtrim($path, '/') . '.php';
if (is_file($phpFile)) {
    // Set SCRIPT_FILENAME so the included file knows where it is
    $_SERVER['SCRIPT_FILENAME'] = $phpFile;
    include $phpFile;
    return true;
}


// 3. Not found
http_response_code(404);
header('Content-Type: application/json');
echo json_encode([
    'success' => false,
    'message' => "Route not found: $path"
]);
return true;