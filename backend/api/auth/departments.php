<?php
// backend/api/auth/departments.php  — public, used during registration
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed.', 405);

$db   = getDB();
$stmt = $db->query('SELECT id, name, code FROM departments ORDER BY name');
jsonSuccess(['departments' => $stmt->fetchAll()]);
