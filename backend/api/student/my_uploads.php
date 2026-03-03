<?php
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed.', 405);
if ($auth_user['role'] !== 'student') jsonError('Access denied.', 403);

$student_id = (int) $auth_user['id'];

try {
    $stmt = $pdo->prepare("
        SELECT id, file_type, file_name, original_name, file_path, created_at
        FROM clearance_uploads
        WHERE student_id = ? AND file_type != 'financial_record'
        ORDER BY created_at DESC
    ");
    $stmt->execute([$student_id]);
    $uploads = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $base = 'http://' . preg_replace('/:5173$/', '', $_SERVER['HTTP_HOST'] ?? 'localhost');

    foreach ($uploads as &$u) {
        $clean         = ltrim(str_replace('\\', '/', $u['file_path']), '/');
        $u['url']      = $base . '/clearance-system/backend/' . $clean;
        $u['original_name'] = $u['original_name'] ?? $u['file_name'];
    }

    jsonSuccess(['uploads' => $uploads]);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}