<?php
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed.', 405);
if (!in_array($auth_user['role'], ['staff', 'admin'])) jsonError('Access denied.', 403);

// Only bursary staff (department_id = 2) can use this
if ((int)$auth_user['department_id'] !== 2) jsonError('Only Bursary staff can upload financial records.', 403);

if (empty($_FILES['file'])) jsonError('No file received.', 400);
$upload_err = $_FILES['file']['error'];
if ($upload_err !== UPLOAD_ERR_OK) jsonError("Upload error code: $upload_err", 400);

$file          = $_FILES['file'];
$original_name = basename($file['name']);
$ext           = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed       = ['pdf','jpg','jpeg','png'];

if (!in_array($ext, $allowed)) jsonError('Only PDF, JPG, and PNG files are allowed.', 400);
if ($file['size'] > 10 * 1024 * 1024) jsonError('File too large. Maximum 10MB.', 400);

$backend_dir = realpath(__DIR__ . '/../../');
$upload_dir  = $backend_dir . '/uploads/staff/bursary/';

if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true))
        jsonError('Could not create upload directory.', 500);
}

$stored_name = 'financial_record_' . time() . '.' . $ext;
$file_path   = 'uploads/staff/bursary/' . $stored_name;
$full_path   = $backend_dir . '/' . $file_path;

if (!move_uploaded_file($file['tmp_name'], $full_path))
    jsonError('Failed to save file.', 500);

try {
    $pdo->prepare("
        INSERT INTO clearance_uploads (request_id, student_id, file_type, file_name, original_name, file_path)
        VALUES (NULL, 0, 'financial_record', ?, ?, ?)
    ")->execute([$stored_name, $original_name, $file_path]);

    $upload_id = (int) $pdo->lastInsertId();

    jsonSuccess([
        'upload_id'     => $upload_id,
        'original_name' => $original_name,
        'file_type'     => 'financial_record',
    ]);
} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}