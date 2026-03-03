<?php
error_reporting(0);
ini_set('display_errors', '0');

require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed.', 405);

$student_id = $auth_user['id'];

try {
    $depts = $pdo->query("SELECT id, name, code FROM departments ORDER BY name")->fetchAll();

    $stmt = $pdo->prepare("
        SELECT department_id, id as request_id, status, remarks, reviewed_at, created_at
        FROM clearance_requests
        WHERE student_id = ?
    ");
    $stmt->execute([$student_id]);
    $requests = [];
    foreach ($stmt->fetchAll() as $row) {
        $requests[$row['department_id']] = $row;
    }

    // For any rejected bursary request, fetch the financial record file
    $bursary_files = [];
    foreach ($requests as $dept_id => $req) {
        if ($req['status'] === 'rejected' && $req['request_id']) {
            // Check if this is a bursary dept by looking up dept code
            $ds = $pdo->prepare("SELECT code FROM departments WHERE id = ?");
            $ds->execute([$dept_id]);
            $dept_row = $ds->fetch();
            if ($dept_row && $dept_row['code'] === 'BURSARY') {
                $fs = $pdo->prepare("
                    SELECT id, original_name, file_name, file_path
                    FROM clearance_uploads
                    WHERE request_id = ? AND file_type = 'financial_record'
                    ORDER BY created_at DESC LIMIT 1
                ");
                $fs->execute([$req['request_id']]);
                $file = $fs->fetch(PDO::FETCH_ASSOC);
                if ($file) {
                    $clean = ltrim(str_replace('\\', '/', $file['file_path']), '/');
                    $base  = 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
                    $bursary_files[$dept_id] = [
                        'url'          => $base . '/clearance-system/backend/' . $clean,
                        'display_name' => $file['original_name'] ?? $file['file_name'],
                    ];
                }
            }
        }
    }

    $clearances = [];
    foreach ($depts as $dept) {
        $req = $requests[$dept['id']] ?? null;
        $entry = [
            'department_id'   => $dept['id'],
            'name'            => $dept['name'],
            'code'            => $dept['code'],
            'status'          => $req ? $req['status']      : 'not_requested',
            'remarks'         => $req ? $req['remarks']     : null,
            'reviewed_at'     => $req ? $req['reviewed_at'] : null,
            'request_id'      => $req ? $req['request_id']  : null,
            'created_at'      => $req ? $req['created_at']  : null,
            'financial_record' => $bursary_files[$dept['id']] ?? null,
        ];
        $clearances[] = $entry;
    }

    jsonSuccess([
        'student'    => [
            'id'            => (int) $auth_user['id'],
            'name'          => $auth_user['name'],
            'email'         => $auth_user['email'],
            'matric_number' => $auth_user['matric_number'],
            'level'         => $auth_user['level'],
            'faculty'       => $auth_user['faculty'],
            'programme'     => $auth_user['programme'],
        ],
        'clearances' => $clearances,
    ]);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}