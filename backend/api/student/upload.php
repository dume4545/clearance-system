<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');

require_once '../../config/cors.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed.', 405);

$student_id = (int) $auth_user['id'];

$allowed_types = ['project_softcopy','abstract_page','student_id_card','course_form','transcript','jamb_letter'];
$file_type     = $_POST['file_type'] ?? '';

if (!in_array($file_type, $allowed_types)) {
    jsonError('Invalid file type: ' . $file_type, 400);
}

if (empty($_FILES['file'])) jsonError('No file received.', 400);

$upload_err = $_FILES['file']['error'];
if ($upload_err !== UPLOAD_ERR_OK) {
    $err_map = [
        UPLOAD_ERR_INI_SIZE   => 'File too large (php.ini limit).',
        UPLOAD_ERR_FORM_SIZE  => 'File too large (form limit).',
        UPLOAD_ERR_PARTIAL    => 'File only partially uploaded.',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temp folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write to disk.',
        UPLOAD_ERR_EXTENSION  => 'Upload blocked by extension.',
    ];
    jsonError($err_map[$upload_err] ?? "Upload error code: $upload_err", 400);
}

$file          = $_FILES['file'];
$original_name = basename($file['name']);           // ← the real device filename
$ext           = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed       = ['pdf','jpg','jpeg','png'];

if (!in_array($ext, $allowed)) jsonError('Only PDF, JPG, and PNG files are allowed.', 400);
if ($file['size'] > 10 * 1024 * 1024) jsonError('File too large. Maximum size is 10MB.', 400);

$backend_dir = realpath(__DIR__ . '/../../');
$upload_dir  = $backend_dir . '/uploads/' . $student_id . '/';

if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true))
        jsonError('Could not create upload directory.', 500);
}

$stored_name = $file_type . '_' . time() . '.' . $ext;   // safe filename on disk
$file_path   = 'uploads/' . $student_id . '/' . $stored_name;
$full_path   = $backend_dir . '/' . $file_path;

if (!move_uploaded_file($file['tmp_name'], $full_path))
    jsonError('Failed to save file. Check that backend/uploads/ is writable.', 500);

try {
    $pdo->prepare("
        DELETE FROM clearance_uploads
        WHERE student_id = ? AND file_type = ? AND request_id IS NULL
    ")->execute([$student_id, $file_type]);

    $pdo->prepare("
        INSERT INTO clearance_uploads (request_id, student_id, file_type, file_name, original_name, file_path)
        VALUES (NULL, ?, ?, ?, ?, ?)
    ")->execute([$student_id, $file_type, $stored_name, $original_name, $file_path]);

    $upload_id = (int) $pdo->lastInsertId();

    jsonSuccess([
        'upload_id'     => $upload_id,
        'file_name'     => $stored_name,
        'original_name' => $original_name,
        'file_type'     => $file_type,
    ]);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}