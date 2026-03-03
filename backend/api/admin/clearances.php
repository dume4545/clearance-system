<?php
// backend/api/admin/clearances.php
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed.', 405);

requireAuth(['admin']);
$db = getDB();

$status   = $_GET['status']        ?? 'all';
$deptId   = (int)($_GET['dept_id'] ?? 0);
$search   = $_GET['search']        ?? '';

$sql = "SELECT cr.id, cr.status, cr.remarks, cr.created_at, cr.updated_at,
               u.name  AS student_name, u.email AS student_email,
               u.matric_number, u.level, u.faculty,
               d.name  AS department_name,
               r.name  AS reviewed_by
        FROM   clearance_requests cr
        JOIN   users u ON u.id = cr.student_id
        JOIN   departments d ON d.id = cr.department_id
        LEFT JOIN users r ON r.id = cr.reviewed_by
        WHERE  1=1";
$params = [];

if (in_array($status, ['pending','approved','rejected'], true)) {
    $sql .= ' AND cr.status = ?'; $params[] = $status;
}
if ($deptId) {
    $sql .= ' AND cr.department_id = ?'; $params[] = $deptId;
}
if ($search) {
    $sql .= ' AND (u.name LIKE ? OR u.matric_number LIKE ?)';
    $like  = "%$search%";
    $params[] = $like; $params[] = $like;
}

$sql .= ' ORDER BY cr.updated_at DESC LIMIT 500';
$stmt = $db->prepare($sql);
$stmt->execute($params);

jsonSuccess(['clearances' => $stmt->fetchAll()]);
