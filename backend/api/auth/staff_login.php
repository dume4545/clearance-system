<?php
error_reporting(0);
ini_set('display_errors', '0');

require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$data  = json_decode(file_get_contents('php://input'), true) ?? [];
$email = strtolower(trim($data['email'] ?? ''));
$pass  = $data['password'] ?? '';

if (!$email || !$pass) {
    jsonError('Email and password are required.', 400);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '::1';

try {
    $stmt = $pdo->prepare("
        SELECT * FROM users
        WHERE email = ?
          AND role IN ('staff', 'admin')
          AND is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        $log = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (NULL, 'LOGIN_FAILED', ?, ?)");
        $log->execute(["staff_email=$email", $ip]);
        jsonError('Invalid email or password.', 401);
    }

    // Issue token
    $token      = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)")
        ->execute([$user['id'], $token, $expires_at]);

    $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'LOGIN_SUCCESS', ?, ?)")
        ->execute([$user['id'], "role={$user['role']}", $ip]);

    jsonSuccess([
        'token' => $token,
        'user'  => [
            'id'            => (int) $user['id'],
            'name'          => $user['name'],
            'email'         => $user['email'],
            'role'          => $user['role'],
            'department_id' => (int) $user['department_id'],
        ],
    ]);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}
