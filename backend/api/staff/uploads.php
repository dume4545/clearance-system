<?php
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed.', 405);
if (!in_array($auth_user['role'], ['staff', 'admin'])) jsonError('Access denied.', 403);

$request_id = (int) ($_GET['request_id'] ?? 0);
if (!$request_id) jsonError('request_id required.', 400);

// Get request + department code
$stmt = $pdo->prepare("
    SELECT cr.id, cr.student_id,
           COALESCE(cr.submission_data, cr.metadata) AS submission_data,
           d.code AS dept_code
    FROM clearance_requests cr
    JOIN departments d ON d.id = cr.department_id
    WHERE cr.id = ? AND cr.department_id = ?
");
$stmt->execute([$request_id, (int)$auth_user['department_id']]);
$req = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$req) jsonError('Not found.', 404);

// Strict map: only these file_types are valid per department
$dept_file_types = [
    'LIBRARY'  => ['project_softcopy', 'abstract_page'],
    'SEC'      => ['student_id_card'],
    'HOSTEL'   => ['course_form'],
    'REGISTRY' => ['transcript', 'student_id_card', 'jamb_letter'],
    'HOD'      => [],
    'HEALTH'   => [],
    'BURSARY'  => [],
];
$allowed_types = $dept_file_types[$req['dept_code']] ?? [];

$uploads = [];

if (!empty($allowed_types)) {
    $tph = implode(',', array_fill(0, count($allowed_types), '?'));

    // PRIMARY: uploads linked directly to this request AND correct file type
    $stmt = $pdo->prepare("
        SELECT id, file_type, file_name, original_name, file_path, created_at
        FROM clearance_uploads
        WHERE request_id = ? AND file_type IN ($tph)
        ORDER BY created_at ASC
    ");
    $stmt->execute(array_merge([$request_id], $allowed_types));
    $uploads = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // FALLBACK: get IDs from submission_data, but STILL filter by allowed file types
    if (empty($uploads) && $req['submission_data']) {
        try {
            $sub = json_decode($req['submission_data'], true) ?? [];
            $ids = [];
            foreach ($sub as $k => $v) {
                if (str_ends_with($k, '_upload_id') && is_numeric($v)) {
                    $ids[] = (int)$v;
                }
            }
            if (!empty($ids)) {
                $iph  = implode(',', array_fill(0, count($ids), '?'));
                // Double filter: by ID list AND by allowed file types for this dept
                $stmt = $pdo->prepare("
                    SELECT id, file_type, file_name, original_name, file_path, created_at
                    FROM clearance_uploads
                    WHERE id IN ($iph) AND file_type IN ($tph)
                    ORDER BY created_at ASC
                ");
                $stmt->execute(array_merge($ids, $allowed_types));
                $uploads = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Link them to this request for future lookups
                if (!empty($uploads)) {
                    $linked_ids = array_column($uploads, 'id');
                    $lph = implode(',', array_fill(0, count($linked_ids), '?'));
                    $pdo->prepare("UPDATE clearance_uploads SET request_id = ? WHERE id IN ($lph)")
                        ->execute(array_merge([$request_id], $linked_ids));
                }
            }
        } catch (\Throwable $e) { /* ignore parse errors */ }
    }
}

// Friendly label map
$labels = [
    'project_softcopy' => 'Final Year Project (Soft Copy)',
    'abstract_page'    => 'Abstract Page',
    'student_id_card'  => 'Student ID Card',
    'course_form'      => 'Course Form',
    'transcript'       => 'Unofficial Transcript',
    'jamb_letter'      => 'JAMB Admission Letter',
];

// Absolute URL pointing to Apache directly (bypasses Vite)
$base = 'http://' . preg_replace('/:5173$/', '', $_SERVER['HTTP_HOST'] ?? 'localhost');

foreach ($uploads as &$u) {
    $clean             = ltrim(str_replace('\\', '/', $u['file_path']), '/');
    $u['url']          = $base . '/clearance-system/backend/' . $clean;
    $u['label']        = $labels[$u['file_type']] ?? ucwords(str_replace('_', ' ', $u['file_type']));
    $u['display_name'] = !empty($u['original_name']) ? $u['original_name'] : $u['file_name'];
}

jsonSuccess(['uploads' => $uploads]);