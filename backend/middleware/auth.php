<?php
// ── middleware/auth.php — verify Bearer token ────────────────────────────────
// Usage in API files: require_once '../../middleware/auth.php';
// After including, $auth_user contains the logged-in user row.

function requireAuth() {
    global $pdo;

    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$auth || !str_starts_with($auth, 'Bearer ')) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'Unauthorised. No token provided.']);
        exit;
    }

    $token = trim(substr($auth, 7));

    // Look up token in auth_tokens table
    $stmt = $pdo->prepare("
        SELECT u.* FROM auth_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token = ?
          AND t.expires_at > NOW()
          AND u.is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'Unauthorised. Token invalid or expired.']);
        exit;
    }

    return $user;
}

// Run immediately and store result in $auth_user for the calling file
$auth_user = requireAuth();
