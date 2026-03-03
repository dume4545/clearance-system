<?php
// backend/api/auth/logout.php
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed.', 405);

$user  = requireAuth();
$token = trim(preg_replace('/^Bearer\s+/i', '', $_SERVER['HTTP_AUTHORIZATION'] ?? ''));

$db = getDB();
$db->prepare('DELETE FROM auth_tokens WHERE token = ?')->execute([$token]);

logActivity($user['id'], 'LOGOUT');
jsonSuccess(['message' => 'Logged out successfully.']);
