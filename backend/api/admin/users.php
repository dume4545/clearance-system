<?php
// backend/api/admin/users.php
// GET    ?role=student|staff|all  — list users
// PUT    { user_id, action: "toggle_active"|"change_role", role? }
// DELETE ?user_id=N
require_once __DIR__ . '/../../middleware/auth.php';

$admin = requireAuth(['admin']);
$db    = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ---- GET: list users ----
if ($method === 'GET') {
    $role   = $_GET['role']   ?? 'all';
    $search = $_GET['search'] ?? '';

    $sql    = "SELECT u.id, u.name, u.email, u.role, u.matric_number,
                      u.level, u.faculty, u.programme,
                      u.is_active, u.created_at,
                      d.name AS department_name
               FROM users u
               LEFT JOIN departments d ON d.id = u.department_id
               WHERE u.role != 'admin'";
    $params = [];

    if (in_array($role, ['student','staff'], true)) {
        $sql     .= ' AND u.role = ?';
        $params[] = $role;
    }
    if ($search) {
        $sql     .= ' AND (u.name LIKE ? OR u.email LIKE ? OR u.matric_number LIKE ?)';
        $like     = "%$search%";
        $params   = array_merge($params, [$like, $like, $like]);
    }

    $sql .= ' ORDER BY u.created_at DESC LIMIT 200';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonSuccess(['users' => $stmt->fetchAll()]);
}

// ---- PUT: update user ----
if ($method === 'PUT') {
    $body   = bodyJson();
    $userId = (int)($body['user_id'] ?? 0);
    $action = $body['action'] ?? '';

    if (!$userId) jsonError('user_id is required.');

    if ($action === 'toggle_active') {
        $db->prepare(
            'UPDATE users SET is_active = 1 - is_active WHERE id = ? AND role != "admin"'
        )->execute([$userId]);
        logActivity($admin['id'], 'USER_TOGGLED', "target_user=$userId");
        jsonSuccess(['message' => 'User status updated.']);
    }

    if ($action === 'change_role') {
        $newRole = $body['role'] ?? '';
        if (!in_array($newRole, ['student','staff'], true))
            jsonError('role must be "student" or "staff".');
        $deptId = $newRole === 'staff' ? (int)($body['department_id'] ?? 0) : null;
        if ($newRole === 'staff' && !$deptId) jsonError('department_id required for staff role.');

        $db->prepare(
            'UPDATE users SET role = ?, department_id = ? WHERE id = ? AND role != "admin"'
        )->execute([$newRole, $deptId, $userId]);
        logActivity($admin['id'], 'ROLE_CHANGED', "target_user=$userId new_role=$newRole");
        jsonSuccess(['message' => 'User role updated.']);
    }

    jsonError('Unknown action.');
}

// ---- DELETE: remove user ----
if ($method === 'DELETE') {
    $userId = (int)($_GET['user_id'] ?? 0);
    if (!$userId) jsonError('user_id is required.');

    $db->prepare('DELETE FROM users WHERE id = ? AND role != "admin"')->execute([$userId]);
    logActivity($admin['id'], 'USER_DELETED', "target_user=$userId");
    jsonSuccess(['message' => 'User deleted.']);
}

jsonError('Method not allowed.', 405);
