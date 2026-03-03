<?php
error_reporting(0);
ini_set('display_errors', '0');

require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$pass = $data['password'] ?? '';

// Accept either matric_number (students) or email (staff/admin)
$raw_input = trim($data['matric_number'] ?? '');

if (!$raw_input || !$pass) {
    jsonError('Matric number / email and password are required.', 400);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '::1';

try {
    // Try matching as email first (staff/admin), then as matric number (students)
    $stmt = $pdo->prepare("
        SELECT * FROM users
        WHERE (
            LOWER(email) = LOWER(?)
            OR UPPER(matric_number) = UPPER(?)
        )
        AND is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$raw_input, $raw_input]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        $log = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (NULL, 'LOGIN_FAILED', ?, ?)");
        $log->execute(["input=$raw_input", $ip]);
        jsonError('Invalid credentials.', 401);
    }

    // ── Level access guard (students only) ─────────────────────────────────────
    if ($user['role'] === 'student') {
        $level     = (int) $user['level'];
        $programme = $user['programme'];
        $six_year  = ['Medicine and Surgery'];
        $five_year = ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Mechatronics Engineering'];

        if (in_array($programme, $six_year) && $level < 600) {
            jsonError("Access denied. Medicine & Surgery students must be 600 Level.", 403);
        } elseif (in_array($programme, $five_year) && $level < 500) {
            jsonError("Access denied. $programme students must be 500 Level.", 403);
        } elseif (!in_array($programme, array_merge($six_year, $five_year)) && $level < 400) {
            jsonError("Access denied. Only 400 Level and above can access the clearance system.", 403);
        }
    }

    // ── Issue token ─────────────────────────────────────────────────────────────
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
            'matric_number' => $user['matric_number'],
            'level'         => $user['level'],
            'faculty'       => $user['faculty'],
            'programme'     => $user['programme'],
            'department_id' => (int) $user['department_id'],
        ],
    ]);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}