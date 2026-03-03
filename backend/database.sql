-- ============================================================
--  Online Clearance System – Database Schema
--  Engine: MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS clearance_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE clearance_db;

-- ----------------------------------------------------------------
-- departments / clearance offices
-- ----------------------------------------------------------------
CREATE TABLE departments (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,       -- e.g. "Library", "Bursary"
  code      VARCHAR(30)  NOT NULL UNIQUE,       -- e.g. "LIBRARY", "BURSARY"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (name, code) VALUES
  ('HOD / Faculty',        'HOD'),
  ('Bursary / Finance',    'BURSARY'),
  ('Library',              'LIBRARY'),
  ('Health Centre (BUTH)', 'HEALTH'),
  ('Hostel Administration','HOSTEL'),
  ('Academic Registry',    'REGISTRY');

-- ----------------------------------------------------------------
-- users  (students, staff, admin)
-- ----------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student','staff','admin') NOT NULL DEFAULT 'student',
  -- staff & admin only
  department_id INT NULL,
  -- student only
  matric_number VARCHAR(30)  NULL UNIQUE,
  level         VARCHAR(10)  NULL,               -- e.g. "400"
  faculty       VARCHAR(100) NULL,
  programme     VARCHAR(100) NULL,
  -- meta
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- default admin account  (password: Admin@1234)
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'System Administrator',
  'admin@university.edu',
  '$2y$12$gZxMFAp6F5hHr3TrMnflp.ZExV6lgQHrH1MJaFSNS8lkFt/sB9ioq',
  'admin'
);

-- ----------------------------------------------------------------
-- auth tokens  (stateless-ish JWT alternative)
-- ----------------------------------------------------------------
CREATE TABLE auth_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(128)),
  INDEX idx_expires (expires_at)
);

-- ----------------------------------------------------------------
-- clearance requests  (one row per student per department)
-- ----------------------------------------------------------------
CREATE TABLE clearance_requests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT  NOT NULL,
  department_id INT  NOT NULL,
  status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  remarks       TEXT NULL,                -- staff comment on approve/reject
  reviewed_by   INT  NULL,               -- staff user id
  reviewed_at   DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_student_dept (student_id, department_id),
  FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by)   REFERENCES users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- activity / audit log
-- ----------------------------------------------------------------
CREATE TABLE activity_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT         NULL,
  action      VARCHAR(200) NOT NULL,
  details     TEXT         NULL,
  ip_address  VARCHAR(45)  NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user   (user_id),
  INDEX idx_action (action)
);
