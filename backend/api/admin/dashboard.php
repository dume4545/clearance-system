<?php
// backend/api/admin/dashboard.php
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed.', 405);

requireAuth(['admin']);
$db = getDB();

// ---- overview counts ----
$totalStudents = (int)$db->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn();
$totalStaff    = (int)$db->query("SELECT COUNT(*) FROM users WHERE role='staff'")->fetchColumn();

// students fully cleared (approved in ALL departments)
$totalDepts = (int)$db->query("SELECT COUNT(*) FROM departments")->fetchColumn();
$fullyCleared = (int)$db->prepare(
    "SELECT COUNT(*) FROM (
       SELECT student_id
       FROM   clearance_requests
       WHERE  status = 'approved'
       GROUP  BY student_id
       HAVING COUNT(*) = ?
     ) t"
)->execute([$totalDepts]) ? $db->query(
    "SELECT COUNT(*) FROM (
       SELECT student_id FROM clearance_requests
       WHERE  status='approved'
       GROUP  BY student_id HAVING COUNT(*) = $totalDepts
     ) t"
)->fetchColumn() : 0;

$pendingCount  = (int)$db->query("SELECT COUNT(*) FROM clearance_requests WHERE status='pending'")->fetchColumn();
$approvedCount = (int)$db->query("SELECT COUNT(*) FROM clearance_requests WHERE status='approved'")->fetchColumn();
$rejectedCount = (int)$db->query("SELECT COUNT(*) FROM clearance_requests WHERE status='rejected'")->fetchColumn();

// ---- per-department breakdown ----
$stmt = $db->query(
    "SELECT d.name, d.code,
            SUM(cr.status='pending')  AS pending,
            SUM(cr.status='approved') AS approved,
            SUM(cr.status='rejected') AS rejected
     FROM departments d
     LEFT JOIN clearance_requests cr ON cr.department_id = d.id
     GROUP BY d.id
     ORDER BY d.name"
);
$deptBreakdown = $stmt->fetchAll();

// ---- recent activity ----
$stmt = $db->query(
    "SELECT al.action, al.details, al.created_at, u.name AS user_name
     FROM activity_log al
     LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC
     LIMIT 20"
);
$recentActivity = $stmt->fetchAll();

jsonSuccess([
    'overview' => [
        'total_students'   => $totalStudents,
        'total_staff'      => $totalStaff,
        'fully_cleared'    => (int)$fullyCleared,
        'pending_requests' => $pendingCount,
        'approved_total'   => $approvedCount,
        'rejected_total'   => $rejectedCount,
        'total_departments'=> $totalDepts,
    ],
    'department_breakdown' => $deptBreakdown,
    'recent_activity'      => $recentActivity,
]);
