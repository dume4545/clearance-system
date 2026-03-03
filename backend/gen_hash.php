<?php
// Place this file in your backend/ folder
// Visit: http://localhost/clearance-system/backend/gen_hash.php
// DELETE IT after use!

$password = 'staff123';
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

echo "<pre>";
echo "Password: $password\n";
echo "Hash:     $hash\n\n";
echo "SQL to update hod account:\n";
echo "UPDATE users SET password_hash = '$hash', is_active = 1 WHERE email = 'hod@babcock.edu.ng';\n";
echo "</pre>";