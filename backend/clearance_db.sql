-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 04, 2026 at 01:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clearance_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(200) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, NULL, 'LOGIN_FAILED', 'email=admin@university.edu', '::1', '2026-02-28 10:20:11'),
(2, NULL, 'LOGIN_FAILED', 'email=admin@university.edu', '::1', '2026-02-28 10:20:17'),
(3, 1, 'LOGIN_SUCCESS', 'role=admin', '::1', '2026-02-28 10:21:39'),
(4, 1, 'LOGIN_SUCCESS', 'role=admin', '::1', '2026-02-28 10:39:38'),
(5, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-02-28 20:00:01'),
(6, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-02-28 20:00:16'),
(7, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-02-28 20:01:19'),
(8, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 12:46:55'),
(9, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 12:52:22'),
(10, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 13:05:42'),
(11, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 14:12:02'),
(12, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 15:57:50'),
(13, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 17:36:57'),
(14, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 18:53:06'),
(15, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 18:56:27'),
(16, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 18:57:02'),
(17, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 19:10:36'),
(18, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 19:11:08'),
(19, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 19:18:53'),
(20, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 19:19:59'),
(21, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-01 19:24:24'),
(22, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 19:24:44'),
(23, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 19:25:08'),
(24, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 19:25:31'),
(25, NULL, 'LOGIN_FAILED', 'matric=HOD@BABCOCK.EDU.NG', '::1', '2026-03-01 19:26:23'),
(26, NULL, 'LOGIN_FAILED', 'staff_email=hod@babcock.edu.ng', '::1', '2026-03-01 19:29:59'),
(27, NULL, 'LOGIN_FAILED', 'staff_email=hod@babcock.edu.ng', '::1', '2026-03-01 19:30:22'),
(28, NULL, 'LOGIN_FAILED', 'staff_email=hod@babcock.edu.ng', '::1', '2026-03-01 19:38:21'),
(29, NULL, 'LOGIN_FAILED', 'input=hod@babcock.edu.ng', '::1', '2026-03-01 19:55:29'),
(30, NULL, 'LOGIN_FAILED', 'input=hod@babcock.edu.ng', '::1', '2026-03-02 09:36:42'),
(31, NULL, 'LOGIN_FAILED', 'input=hod@babcock.edu.ng', '::1', '2026-03-02 09:40:26'),
(32, NULL, 'LOGIN_FAILED', 'input=hod@babcock.edu.ng', '::1', '2026-03-02 09:44:55'),
(33, NULL, 'LOGIN_FAILED', 'input=hod@babcock.edu.ng', '::1', '2026-03-02 09:48:54'),
(34, NULL, 'LOGIN_FAILED', 'input=hod@babcock.edu.ng', '::1', '2026-03-02 09:49:03'),
(35, NULL, 'LOGIN_FAILED', 'input=hod@babcock.edu.ng', '::1', '2026-03-02 09:54:35'),
(36, 7, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 09:59:32'),
(37, 7, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 10:01:50'),
(38, 7, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 10:02:34'),
(39, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 10:10:45'),
(40, 7, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 10:11:32'),
(41, 7, 'REJECTED', 'request_id=2', '::1', '2026-03-02 10:16:05'),
(42, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 10:16:43'),
(43, 7, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 10:17:50'),
(44, 7, 'APPROVED', 'request_id=2', '::1', '2026-03-02 10:17:53'),
(45, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 10:18:15'),
(46, 9, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 10:21:09'),
(47, 9, 'REJECTED', 'request_id=3', '::1', '2026-03-02 10:28:04'),
(48, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 10:32:35'),
(49, 9, 'APPROVED', 'request_id=3', '::1', '2026-03-02 10:40:22'),
(50, NULL, 'LOGIN_FAILED', 'input=library@babcock.edu.ng', '::1', '2026-03-02 15:04:50'),
(51, 9, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 15:04:56'),
(52, 9, 'REJECTED', 'request_id=3', '::1', '2026-03-02 15:36:08'),
(53, 9, 'REJECTED', 'request_id=3', '::1', '2026-03-02 15:40:25'),
(54, 9, 'APPROVED', 'request_id=3', '::1', '2026-03-02 15:41:05'),
(55, 10, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 15:48:46'),
(56, 10, 'APPROVED', 'request_id=4', '::1', '2026-03-02 15:49:01'),
(57, 13, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 18:28:53'),
(58, 13, 'APPROVED', 'request_id=5', '::1', '2026-03-02 18:36:28'),
(59, 8, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 18:38:57'),
(60, 8, 'REJECTED', 'request_id=6', '::1', '2026-03-02 18:41:43'),
(61, 8, 'APPROVED', 'request_id=6', '::1', '2026-03-02 18:44:14'),
(62, 11, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 18:45:28'),
(63, 11, 'REJECTED', 'request_id=7', '::1', '2026-03-02 18:46:02'),
(64, 11, 'APPROVED', 'request_id=7', '::1', '2026-03-02 18:46:37'),
(65, 12, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 18:47:44'),
(66, 12, 'APPROVED', 'request_id=8', '::1', '2026-03-02 18:47:52'),
(67, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 18:50:11'),
(68, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 18:50:44'),
(69, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 18:52:46'),
(70, NULL, 'LOGIN_FAILED', 'input=21/7630', '::1', '2026-03-02 18:54:36'),
(71, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 18:55:01'),
(72, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 18:59:23'),
(73, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-02 19:01:42'),
(74, 7, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-02 19:03:40'),
(75, 7, 'APPROVED', 'request_id=13', '::1', '2026-03-03 10:23:01'),
(76, 7, 'APPROVED', 'request_id=9', '::1', '2026-03-03 10:23:08'),
(77, 7, 'APPROVED', 'request_id=12', '::1', '2026-03-03 10:24:32'),
(78, 7, 'APPROVED', 'request_id=11', '::1', '2026-03-03 10:24:34'),
(79, 7, 'APPROVED', 'request_id=10', '::1', '2026-03-03 10:24:36'),
(80, 10, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-03 10:24:46'),
(81, 10, 'APPROVED', 'request_id=14', '::1', '2026-03-03 10:24:56'),
(82, NULL, 'LOGIN_FAILED', 'input=library@babcock.edu.ng', '::1', '2026-03-03 10:25:59'),
(83, 9, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-03 10:26:06'),
(84, 9, 'APPROVED', 'request_id=15', '::1', '2026-03-03 10:26:16'),
(85, 13, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-03 10:45:07'),
(86, 13, 'APPROVED', 'request_id=16', '::1', '2026-03-03 10:50:50'),
(87, NULL, 'LOGIN_FAILED', 'input=bursary@babcock.edu.ng', '::1', '2026-03-03 10:51:23'),
(88, 8, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-03 10:51:51'),
(89, 8, 'REJECTED', 'request_id=17', '::1', '2026-03-03 10:52:37'),
(90, 8, 'APPROVED', 'request_id=17', '::1', '2026-03-03 11:03:54'),
(91, 11, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-03 11:05:53'),
(92, 11, 'APPROVED', 'request_id=18', '::1', '2026-03-03 11:06:22'),
(93, 12, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-03 11:12:25'),
(94, 12, 'APPROVED', 'request_id=19', '::1', '2026-03-03 11:12:29'),
(95, NULL, 'LOGIN_FAILED', 'input=21/7630', '::1', '2026-03-03 11:38:52'),
(96, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-03 11:39:05'),
(97, NULL, 'LOGIN_SUCCESS', 'role=student', '::1', '2026-03-03 11:47:49'),
(98, 7, 'LOGIN_SUCCESS', 'role=staff', '::1', '2026-03-03 11:48:53');

-- --------------------------------------------------------

--
-- Table structure for table `auth_tokens`
--

CREATE TABLE `auth_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(512) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_tokens`
--

INSERT INTO `auth_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, 1, '9f209145981cd4d33b10f4b0606aef717fe5e4415d071fdf0c4acffdda47031a', '2026-03-01 11:21:39', '2026-02-28 10:21:39'),
(2, 1, '4d800c80395892488730f10814322d9dc2a06ce6c331b52b8739ad7476bf9554', '2026-03-01 11:39:38', '2026-02-28 10:39:38'),
(14, 7, 'e8e4623c9b37f937787d2be36902ca4e77017ba454633f4b40619dadfe3f4550', '2026-03-03 10:59:32', '2026-03-02 09:59:32'),
(15, 7, '0e54704eb1c7c5919720ec26ac5109ad2aa96bccab627c18b905918407e1f734', '2026-03-03 11:01:50', '2026-03-02 10:01:50'),
(16, 7, 'bfbebd818491f151d946a6466a969fd0f8d519cb5a760f559f7abb41a4de4c0f', '2026-03-03 11:02:34', '2026-03-02 10:02:34'),
(18, 7, '0d275c411378345efaf05f9626681c85aee3f599a693eb9bfe036fa318fe63a6', '2026-03-03 11:11:32', '2026-03-02 10:11:32'),
(20, 7, 'd7206ca95fad1d7fabe8829ace0cfb9059184aec7d331e1838e2bc7b1fe01f2c', '2026-03-03 11:17:50', '2026-03-02 10:17:50'),
(22, 9, '482d52899335f01e2901c926d41ace9aa0a76d854e7eaa4b3050ea6ac50f4999', '2026-03-03 11:21:09', '2026-03-02 10:21:09'),
(24, 9, 'c3359aab5bc1953c0fc08d4d499c84b14961f3fc307d8e1dd1e580ebf2966412', '2026-03-03 16:04:56', '2026-03-02 15:04:56'),
(25, 10, '7fd4cf0ea5fea0f76a4948775be49de81f126f57cc525823d3657a5322927c1e', '2026-03-03 16:48:46', '2026-03-02 15:48:46'),
(26, 13, '6f101f513385cc37a8a6d83a1ded9a90c22b90d1bd891f14fcb4e87fa5230445', '2026-03-03 19:28:53', '2026-03-02 18:28:53'),
(27, 8, '00c634196d02950c4b5cf9bbb68259d734d5ae1692b0f9c85117eaaee325c7f8', '2026-03-03 19:38:57', '2026-03-02 18:38:57'),
(28, 11, '125878605070bc9e192b3ff9742e81ad6f934f565c2c3e127d5c40ae2486b9e0', '2026-03-03 19:45:28', '2026-03-02 18:45:28'),
(29, 12, 'bd9ea291176d5065d1e9fea82c6610c24e1bb2dd8629615b3c9382ad610d9239', '2026-03-03 19:47:44', '2026-03-02 18:47:44'),
(36, 7, 'f9f31aadf7eeb9a96ea2105783df8504681893aa0915a9d3a4fcd36801640376', '2026-03-03 20:03:40', '2026-03-02 19:03:40'),
(37, 10, '8a1667e14c401abde3f7aaa5efd972a75ff68558018e52487c5471db4da7b653', '2026-03-04 11:24:46', '2026-03-03 10:24:46'),
(38, 9, '15d9e5bc36f93c425d0eacf423e21597a1235a0ed5417fedb8b7d55a7df0457c', '2026-03-04 11:26:06', '2026-03-03 10:26:06'),
(39, 13, '90450b15df03823eec50b577301f8202e0a4c56efcdc8bf0a718bfa9f57b3aa8', '2026-03-04 11:45:07', '2026-03-03 10:45:07'),
(40, 8, 'ad87101fa6c056358cbf6afe7bc6ce0c97a987f6e3d3e1bf3933f4b139bdde8a', '2026-03-04 11:51:51', '2026-03-03 10:51:51'),
(41, 11, 'e1f8e043e60e323e4c6231f86e683ad9bd11aac7858ae4c0113e79a563db0361', '2026-03-04 12:05:53', '2026-03-03 11:05:53'),
(42, 12, '661022c32b1f6ec5629fb187ee8bf3d35fab4a1649e2807c728a635d5b9afc4c', '2026-03-04 12:12:25', '2026-03-03 11:12:25'),
(45, 7, '1fbc67f82d67caa0305cf259a5e0bfce20087d8fd4f0258f50c8a7f7905c9898', '2026-03-04 12:48:53', '2026-03-03 11:48:53');

-- --------------------------------------------------------

--
-- Table structure for table `clearance_requests`
--

CREATE TABLE `clearance_requests` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `remarks` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `submission_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`submission_data`)),
  `rejection_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clearance_uploads`
--

CREATE TABLE `clearance_uploads` (
  `id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `file_type` varchar(50) NOT NULL DEFAULT '',
  `file_name` varchar(100) NOT NULL DEFAULT '',
  `original_name` varchar(255) DEFAULT NULL,
  `student_id` int(11) NOT NULL DEFAULT 0,
  `field_name` varchar(100) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(30) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `code`, `created_at`) VALUES
(1, 'HOD / Faculty', 'HOD', '2026-02-27 16:38:55'),
(2, 'Bursary / Finance', 'BURSARY', '2026-02-27 16:38:55'),
(3, 'Library', 'LIBRARY', '2026-02-27 16:38:55'),
(4, 'Health Centre (BUTH)', 'HEALTH', '2026-02-27 16:38:55'),
(5, 'Hostel Administration', 'HOSTEL', '2026-02-27 16:38:55'),
(6, 'Academic Registry', 'REGISTRY', '2026-02-27 16:38:55'),
(7, 'Security', 'SEC', '2026-02-28 11:01:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','staff','admin') NOT NULL DEFAULT 'student',
  `department_id` int(11) DEFAULT NULL,
  `matric_number` varchar(30) DEFAULT NULL,
  `gender` set('Male','Female','','') NOT NULL,
  `level` varchar(10) DEFAULT NULL,
  `faculty` enum('Benjamin Carson School of Medicine and Surgery','Felicia Adebisi School of Social Sciences','Justice Deborah School of Law','School of Computing','School of Education and Humanities','School of Engineering Sciences','School of Management Sciences','School of Public and Allied Health') NOT NULL,
  `programme` set('Computer Science','Computer Technology','Information Technology','Robotics','Software Engineering','Medicine and Surgery','Anatomy','Physiology','Medical Laboratory Science','Civil Engineering','Mechanical Engineering','Electrical Engineering','Mechatronics Engineering','Law','Economics','Political Science','International Relations','Sociology','Education','English and Literary Studies','History and International Studies','Accounting','Business Administration','Finance','Marketing','International Law & Diplomacy') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department_id`, `matric_number`, `gender`, `level`, `faculty`, `programme`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'System Administrator', 'admin@university.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL, 'Male', NULL, '', '', 1, '2026-02-27 16:38:55', '2026-03-02 09:39:41'),
(7, 'HOD Staff', 'hod@babcock.edu.ng', '$2y$12$/CBPBSh3iQN.vJ2sMXjnYuGfto4w4vQDqC8W03/vxVu4YonchMHg.', 'staff', 1, NULL, '', NULL, '', '', 1, '2026-03-01 17:24:34', '2026-03-02 09:58:56'),
(8, 'Bursary Staff', 'bursary@babcock.edu.ng', '$2y$12$.1rGYGsBsQ6ouJFgn3J4gO5kKTl/Tg8zj/I2iGFo/dzu1SWw5mMcW', 'staff', 2, NULL, '', NULL, '', '', 1, '2026-03-01 17:24:34', '2026-03-02 15:47:59'),
(9, 'Library Staff', 'library@babcock.edu.ng', '$2y$12$/CBPBSh3iQN.vJ2sMXjnYuGfto4w4vQDqC8W03/vxVu4YonchMHg.', 'staff', 3, NULL, '', NULL, '', '', 1, '2026-03-01 17:24:34', '2026-03-02 10:20:49'),
(10, 'Health Staff', 'health@babcock.edu.ng', '$2y$12$.1rGYGsBsQ6ouJFgn3J4gO5kKTl/Tg8zj/I2iGFo/dzu1SWw5mMcW', 'staff', 4, NULL, '', NULL, '', '', 1, '2026-03-01 17:24:34', '2026-03-02 15:47:59'),
(11, 'Hostel Staff', 'hostel@babcock.edu.ng', '$2y$12$.1rGYGsBsQ6ouJFgn3J4gO5kKTl/Tg8zj/I2iGFo/dzu1SWw5mMcW', 'staff', 5, NULL, '', NULL, '', '', 1, '2026-03-01 17:24:34', '2026-03-02 15:47:59'),
(12, 'Registry Staff', 'registry@babcock.edu.ng', '$2y$12$.1rGYGsBsQ6ouJFgn3J4gO5kKTl/Tg8zj/I2iGFo/dzu1SWw5mMcW', 'staff', 6, NULL, '', NULL, '', '', 1, '2026-03-01 17:24:34', '2026-03-02 15:47:59'),
(13, 'Security Staff', 'security@babcock.edu.ng', '$2y$12$.1rGYGsBsQ6ouJFgn3J4gO5kKTl/Tg8zj/I2iGFo/dzu1SWw5mMcW', 'staff', 7, NULL, '', NULL, '', '', 1, '2026-03-01 17:24:34', '2026-03-02 15:47:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token` (`token`(128)),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `clearance_requests`
--
ALTER TABLE `clearance_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_dept` (`student_id`,`department_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Indexes for table `clearance_uploads`
--
ALTER TABLE `clearance_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `matric_number` (`matric_number`),
  ADD KEY `department_id` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `clearance_requests`
--
ALTER TABLE `clearance_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `clearance_uploads`
--
ALTER TABLE `clearance_uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `auth_tokens`
--
ALTER TABLE `auth_tokens`
  ADD CONSTRAINT `auth_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clearance_requests`
--
ALTER TABLE `clearance_requests`
  ADD CONSTRAINT `clearance_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `clearance_requests_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `clearance_requests_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `clearance_uploads`
--
ALTER TABLE `clearance_uploads`
  ADD CONSTRAINT `cu_fk1` FOREIGN KEY (`request_id`) REFERENCES `clearance_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
