<?php
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed.', 405);
if (!in_array($auth_user['role'], ['staff', 'admin'])) jsonError('Access denied.', 403);

$dept_id = (int) $auth_user['department_id'];

try {
    $stmt = $pdo->prepare("
        SELECT
            cr.id,
            cr.status,
            cr.remarks,
            COALESCE(cr.submission_data, cr.metadata) AS submission_data,
            cr.created_at,
            cr.updated_at,
            u.name         AS student_name,
            u.matric_number,
            u.faculty,
            u.programme,
            u.level
        FROM clearance_requests cr
        JOIN users u ON u.id = cr.student_id
        WHERE cr.department_id = ?
        ORDER BY
            CASE cr.status WHEN 'pending' THEN 0 WHEN 'rejected' THEN 1 ELSE 2 END,
            cr.created_at DESC
    ");
    $stmt->execute([$dept_id]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonSuccess(['requests' => $requests]);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}