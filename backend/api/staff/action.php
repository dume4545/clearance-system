<?php
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed.', 405);
if (!in_array($auth_user['role'], ['staff', 'admin'])) jsonError('Access denied.', 403);

$data       = json_decode(file_get_contents('php://input'), true) ?? [];
$request_id = (int) ($data['request_id'] ?? 0);
$action     = $data['action']  ?? '';
$remarks    = trim($data['remarks'] ?? '');
$bursary_upload_id = (int) ($data['bursary_upload_id'] ?? 0);

if (!$request_id || !in_array($action, ['approved', 'rejected'])) jsonError('Invalid request.', 400);
if ($action === 'rejected' && !$remarks) jsonError('Rejection reason is required.', 400);

$dept_id = (int) $auth_user['department_id'];

try {
    $stmt = $pdo->prepare("
        SELECT id, student_id FROM clearance_requests
        WHERE id = ? AND department_id = ? AND status = 'pending'
    ");
    $stmt->execute([$request_id, $dept_id]);
    $req = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$req) jsonError('Request not found or already actioned.', 404);

    $pdo->prepare("
        UPDATE clearance_requests
        SET status = ?, remarks = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW()
        WHERE id = ?
    ")->execute([$action, $remarks, $auth_user['id'], $request_id]);

    // Link bursary financial record to this request
    if ($bursary_upload_id && $dept_id === 2) {
        $pdo->prepare("
            UPDATE clearance_uploads SET request_id = ?, student_id = ?
            WHERE id = ? AND file_type = 'financial_record'
        ")->execute([$request_id, $req['student_id'], $bursary_upload_id]);
    }

    $pdo->prepare("
        INSERT INTO activity_log (user_id, action, details, ip_address)
        VALUES (?, ?, ?, ?)
    ")->execute([
        $auth_user['id'],
        strtoupper($action),
        "request_id=$request_id",
        $_SERVER['REMOTE_ADDR'] ?? '::1'
    ]);

    jsonSuccess(['message' => "Request {$action} successfully."]);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}