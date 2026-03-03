<?php
error_reporting(0);
ini_set('display_errors', '0');

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    jsonError('Invalid JSON body.', 400);
}

// ── Required fields ───────────────────────────────────────────────────────────
$required = ['name', 'email', 'password', 'matric_number', 'gender' , 'level', 'faculty', 'programme'];
foreach ($required as $field) {
    if (!isset($data[$field]) || (string)$data[$field] === '') {
        jsonError("Field '$field' is required.", 400);
    }
}

$name      = trim($data['name']);
$email     = strtolower(trim($data['email']));
$password  = $data['password'];
$matric    = strtoupper(trim($data['matric_number']));
$gender = trim($data['gender']);
$level     = (int) $data['level'];
$faculty   = trim($data['faculty']);
$programme = trim($data['programme']);

// ── Faculty whitelist ─────────────────────────────────────────────────────────
$valid_faculties = [
    'Benjamin Carson School of Medicine and Surgery',
    'Felicia Adebisi School of Social Sciences',
    'Justice Deborah School of Law',
    'School of Computing',
    'School of Education and Humanities',
    'School of Engineering Sciences',
    'School of Management Sciences',
    'School of Public and Allied Health',
];
if (!in_array($faculty, $valid_faculties, true)) {
    jsonError('Invalid faculty selected.', 400);
}

// ── Programme → Faculty map ───────────────────────────────────────────────────
$programme_faculty_map = [
    'Medicine and Surgery'              => 'Benjamin Carson School of Medicine and Surgery',
    'Anatomy'                           => 'Benjamin Carson School of Medicine and Surgery',
    'Physiology'                        => 'Benjamin Carson School of Medicine and Surgery',
    'Medical Laboratory Science'        => 'Benjamin Carson School of Medicine and Surgery',
    'Computer Science'                  => 'School of Computing',
    'Computer Technology'               => 'School of Computing',
    'Information Technology'            => 'School of Computing',
    'Robotics'                          => 'School of Computing',
    'Software Engineering'              => 'School of Computing',
    'Civil Engineering'                 => 'School of Engineering Sciences',
    'Mechanical Engineering'            => 'School of Engineering Sciences',
    'Electrical Engineering'            => 'School of Engineering Sciences',
    'Mechatronics Engineering'          => 'School of Engineering Sciences',
    'Economics'                         => 'Felicia Adebisi School of Social Sciences',
    'Political Science'                 => 'Felicia Adebisi School of Social Sciences',
    'International Relations'           => 'Felicia Adebisi School of Social Sciences',
    'Sociology'                         => 'Felicia Adebisi School of Social Sciences',
    'International Law & Diplomacy'     => 'Felicia Adebisi School of Social Sciences',
    'Law'                               => 'Justice Deborah School of Law',
    'Education'                         => 'School of Education and Humanities',
    'English and Literary Studies'      => 'School of Education and Humanities',
    'History and International Studies' => 'School of Education and Humanities',
    'Accounting'                        => 'School of Management Sciences',
    'Business Administration'           => 'School of Management Sciences',
    'Finance'                           => 'School of Management Sciences',
    'Marketing'                         => 'School of Management Sciences',
    'Public Health'                     => 'School of Public and Allied Health'
];

if (!array_key_exists($programme, $programme_faculty_map)) {
    jsonError('Invalid programme selected.', 400);
}
if ($programme_faculty_map[$programme] !== $faculty) {
    jsonError("'$programme' does not belong to '$faculty'. Please select the correct faculty.", 400);
}

// ── Level rules ───────────────────────────────────────────────────────────────
$six_year  = ['Medicine and Surgery'];
$five_year = ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Mechatronics Engineering'];

if (!in_array($level, [100, 200, 300, 400, 500, 600], true)) {
    jsonError('Invalid level value.', 400);
}

if (in_array($programme, $six_year, true)) {
    if ($level !== 600) jsonError("Medicine and Surgery students must be in 600 Level. You submitted Level $level.", 403);
} elseif (in_array($programme, $five_year, true)) {
    if ($level !== 500) jsonError("$programme is a 5-year programme. You must be in 500 Level. You submitted Level $level.", 403);
} else {
    if ($level < 400) jsonError("Only final-year students (400 Level and above) may register. You submitted Level $level.", 403);
}

// ── Basic validation ──────────────────────────────────────────────────────────
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonError('Invalid email address.', 400);
}
if (strlen($password) < 6) {
    jsonError('Password must be at least 6 characters.', 400);
}

// ── Database operations — uses getDB() from db.php ───────────────────────────
try {
    $pdo = getDB();

    // Duplicate check
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR matric_number = ?");
    $stmt->execute([$email, $matric]);
    if ($stmt->fetch()) {
        jsonError('An account with this email or matric number already exists.', 409);
    }

    // Insert
    $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    $stmt = $pdo->prepare("
        INSERT INTO users
            (name, email, password_hash, role, matric_number, gender, level, faculty, programme)
        VALUES
            (?, ?, ?, 'student', ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $name,
        $email,
        $password_hash,
        $matric,
        $gender,
        (string) $level,
        $faculty,
        $programme,
    ]);

    $new_id = $pdo->lastInsertId();

    jsonSuccess([
        'user' => [
            'id'            => (int) $new_id,
            'name'          => $name,
            'email'         => $email,
            'matric_number' => $matric,
            'gender'        => $gender,
            'level'         => (string) $level,
            'faculty'       => $faculty,
            'programme'     => $programme,
            'role'          => 'student',
        ]
    ], 'Registration successful. You can now sign in.', 201);

} catch (PDOException $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    jsonError('Server error: ' . $e->getMessage(), 500);
}
