<?php
error_reporting(0);
ini_set('display_errors', '0');
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed.', 405);

$student_id = $auth_user['id'];
$data       = json_decode(file_get_contents('php://input'), true) ?? [];
$dept_id    = (int)($data['department_id'] ?? 0);
$metadata   = $data['metadata'] ?? [];

if (!$dept_id) jsonError('Department ID is required.', 400);

try {
    $stmt = $pdo->prepare("SELECT id, name, code FROM departments WHERE id = ?");
    $stmt->execute([$dept_id]);
    $dept = $stmt->fetch();
    if (!$dept) jsonError('Department not found.', 404);

    $code = $dept['code'];

    // ── Get all current clearance statuses for this student ──────────────────
    $stmt = $pdo->prepare("
        SELECT d.code, cr.status
        FROM departments d
        LEFT JOIN clearance_requests cr ON cr.department_id = d.id AND cr.student_id = ?
    ");
    $stmt->execute([$student_id]);
    $statuses = [];
    foreach ($stmt->fetchAll() as $row) {
        $statuses[$row['code']] = $row['status'] ?? 'not_requested';
    }

    $approved = fn($c) => ($statuses[$c] ?? '') === 'approved';

    // ── Prerequisite rules ───────────────────────────────────────────────────
    $prereqs = [
        'LIBRARY'  => ['HOD'],
        'HEALTH'   => ['HOD'],
        'SEC'      => ['HOD'],
        'BURSARY'  => ['HOD', 'HEALTH', 'SEC'],
        'HOSTEL'   => ['HOD', 'SEC', 'HEALTH', 'LIBRARY', 'BURSARY'],
        'REGISTRY' => ['HOD', 'SEC', 'HEALTH', 'LIBRARY', 'BURSARY', 'HOSTEL'],
    ];

    if (isset($prereqs[$code])) {
        $missing = array_filter($prereqs[$code], fn($c) => !$approved($c));
        if (!empty($missing)) {
            $names = ['HOD' => 'HOD/Faculty', 'HEALTH' => 'Health Centre', 'SEC' => 'Security',
                      'LIBRARY' => 'Library', 'BURSARY' => 'Bursary', 'HOSTEL' => 'Hostel Administration'];
            $list  = implode(', ', array_map(fn($c) => $names[$c] ?? $c, $missing));
            jsonError("The following must be approved first: $list", 403);
        }
    }

    // ── Department-specific validation (all keys now use _upload_id) ─────────
    $upload_ids = [];   // collect upload IDs to link after insert

    if ($code === 'HEALTH') {
        if (empty($metadata['hospital_card_number']))
            jsonError('Hospital card number is required.', 400);
    }

    if ($code === 'SEC') {
        if (empty($metadata['student_id_card_upload_id']))
            jsonError('Student ID card upload is required.', 400);
        $upload_ids[] = (int) $metadata['student_id_card_upload_id'];
    }

    if ($code === 'BURSARY') {
        if (empty($metadata['student_account_number']))
            jsonError('Student account number is required.', 400);
    }

    if ($code === 'LIBRARY') {
        if (empty($metadata['project_softcopy_upload_id']))
            jsonError('Final year project soft copy upload is required.', 400);
        if (empty($metadata['abstract_page_upload_id']))
            jsonError('Abstract page upload is required.', 400);
        $upload_ids[] = (int) $metadata['project_softcopy_upload_id'];
        $upload_ids[] = (int) $metadata['abstract_page_upload_id'];
    }

    if ($code === 'HOSTEL') {
        if (empty($metadata['hall']))
            jsonError('Hall selection is required.', 400);
        if (empty($metadata['semester']))
            jsonError('Semester is required.', 400);
        if (empty($metadata['course_form_upload_id']))
            jsonError('Course form upload is required.', 400);
        $upload_ids[] = (int) $metadata['course_form_upload_id'];
    }

    if ($code === 'REGISTRY') {
        if (empty($metadata['transcript_upload_id']))
            jsonError('Unofficial transcript upload is required.', 400);
        if (empty($metadata['student_id_card_upload_id']))
            jsonError('Student ID card upload is required.', 400);
        if (empty($metadata['jamb_letter_upload_id']))
            jsonError('JAMB Admission Letter upload is required.', 400);
        $upload_ids[] = (int) $metadata['transcript_upload_id'];
        $upload_ids[] = (int) $metadata['student_id_card_upload_id'];
        $upload_ids[] = (int) $metadata['jamb_letter_upload_id'];
    }

    $metadata_json = !empty($metadata) ? json_encode($metadata) : null;
    $remarks       = $data['note'] ?? null;

    // ── Check for existing request ───────────────────────────────────────────
    $stmt = $pdo->prepare("
        SELECT id, status FROM clearance_requests WHERE student_id = ? AND department_id = ?
    ");
    $stmt->execute([$student_id, $dept_id]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['status'] === 'pending')  jsonError('You already have a pending request for this department.', 409);
        if ($existing['status'] === 'approved') jsonError('This department has already approved your clearance.', 409);

        // Rejected → re-apply: update existing row
        $pdo->prepare("
            UPDATE clearance_requests
            SET status='pending', remarks=?, submission_data=?, reviewed_by=NULL, reviewed_at=NULL, updated_at=NOW()
            WHERE id=?
        ")->execute([$remarks, $metadata_json, $existing['id']]);

        $request_id = $existing['id'];

    } else {
        // New request
        $pdo->prepare("
            INSERT INTO clearance_requests (student_id, department_id, status, remarks, submission_data)
            VALUES (?, ?, 'pending', ?, ?)
        ")->execute([$student_id, $dept_id, $remarks, $metadata_json]);

        $request_id = (int) $pdo->lastInsertId();
    }

    // ── Link uploaded files to this request ──────────────────────────────────
    if (!empty($upload_ids)) {
        $ph = implode(',', array_fill(0, count($upload_ids), '?'));
        $pdo->prepare("
            UPDATE clearance_uploads SET request_id = ?
            WHERE id IN ($ph) AND student_id = ?
        ")->execute(array_merge([$request_id], $upload_ids, [$student_id]));
    }

    jsonSuccess([], "Clearance request sent to {$dept['name']}.");

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}