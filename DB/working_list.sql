-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 09 Des 2024 pada 02.20
-- Versi server: 10.4.27-MariaDB
-- Versi PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `working_list`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `group`
--

CREATE TABLE `group` (
  `id` int(11) NOT NULL,
  `name` char(25) DEFAULT NULL,
  `code` char(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `group`
--

INSERT INTO `group` (`id`, `name`, `code`) VALUES
(1, 'Master Data', 'MD'),
(2, 'Cost Control', 'CC'),
(3, 'Project', 'PR'),
(4, 'Production Planing', 'PL'),
(5, 'Ordering', 'OR'),
(6, 'Sistem Improvement', 'SI'),
(7, 'Administrator', 'GYO');

-- --------------------------------------------------------

--
-- Struktur dari tabel `joblist`
--

CREATE TABLE `joblist` (
  `id` int(20) NOT NULL,
  `job` text DEFAULT NULL,
  `created` datetime DEFAULT current_timestamp(),
  `finished` datetime DEFAULT NULL,
  `target` datetime DEFAULT NULL,
  `detail` text DEFAULT NULL,
  `type` enum('Meeting','Discuss','Review','Approval','Other') NOT NULL,
  `inputer` int(11) DEFAULT NULL,
  `groupjob` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `joblist`
--

INSERT INTO `joblist` (`id`, `job`, `created`, `finished`, `target`, `detail`, `type`, `inputer`, `groupjob`) VALUES
(6, 'Weekly meeting TT Down 1.4', '2024-12-06 10:27:45', NULL, '2024-12-09 11:00:00', 'Update report', 'Meeting', 2, 3),
(7, 'Delay order DN LSP impact error logic JIT', '2024-12-06 17:59:27', NULL, '2024-12-09 17:59:00', '', 'Discuss', 5, 5),
(8, 'Simplicity Template AOC Ordering via System WOS Making', '2024-12-06 18:52:13', NULL, '2024-12-10 18:51:00', '', 'Discuss', 5, 5),
(9, 'Simplicity Order step RM, Coil & Consumable material', '2024-12-06 18:52:53', NULL, '2024-12-11 18:52:00', '', 'Discuss', 5, 5),
(10, 'Skill up for interchangeability order LSP for all member ordering', '2024-12-06 18:54:40', NULL, '2024-12-12 18:52:00', '', 'Discuss', 5, 5),
(11, 'Create Sidebar on SINTA (Sistem Integrasi Agenda)', '2024-12-09 07:53:45', NULL, '2024-12-09 16:00:00', '', 'Other', 3, 6);

-- --------------------------------------------------------

--
-- Struktur dari tabel `joblist_group`
--

CREATE TABLE `joblist_group` (
  `id` int(11) NOT NULL,
  `upcoming` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`upcoming`)),
  `issued` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'[]\'' CHECK (json_valid(`issued`)),
  `todo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'[]\'' CHECK (json_valid(`todo`)),
  `progress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'[]\'' CHECK (json_valid(`progress`)),
  `approved` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'[]\'' CHECK (json_valid(`approved`)),
  `complete` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'[]\'' CHECK (json_valid(`complete`)),
  `recycle` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'[]\'' CHECK (json_valid(`recycle`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `joblist_group`
--

INSERT INTO `joblist_group` (`id`, `upcoming`, `issued`, `todo`, `progress`, `approved`, `complete`, `recycle`) VALUES
(1, '[7,8,9,10]', '[6]', '[]', '[11]', '[]', '[]', '[]');

-- --------------------------------------------------------

--
-- Struktur dari tabel `reoccuring_job`
--

CREATE TABLE `reoccuring_job` (
  `id` int(11) NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `user` int(11) DEFAULT NULL,
  `groupjob` int(11) DEFAULT NULL,
  `job` char(255) DEFAULT NULL,
  `tipe` enum('Daily Task','Weekly Task','Bi Weekly Task','Monthly Task') NOT NULL DEFAULT 'Daily Task',
  `status` tinyint(1) DEFAULT 0,
  `date_finish` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `reoccuring_job`
--

INSERT INTO `reoccuring_job` (`id`, `created`, `user`, `groupjob`, `job`, `tipe`, `status`, `date_finish`) VALUES
(1, '2024-12-06 11:03:53', 5, 5, 'Order arrangement check for LSP parts', 'Daily Task', 1, '2024-12-06 11:08:00'),
(2, '2024-12-06 13:38:12', 5, 5, 'PO Approval separation & distribution', 'Daily Task', 1, '2024-12-06 13:40:00'),
(3, '2024-12-06 13:38:38', 5, 5, 'Change PO Consumable IDM parts', 'Daily Task', 1, '2024-12-06 13:40:00'),
(4, '2024-12-06 13:39:02', 5, 5, 'Change PO LP (Logistic request)', 'Daily Task', 1, '2024-12-06 17:44:00'),
(5, '2024-12-06 14:12:27', 5, 5, 'Spesial Order creation (Special event request Logistic)', 'Daily Task', 1, '2024-12-06 14:12:00'),
(6, '2024-12-06 16:30:00', 2, 7, 'Production Meeting', 'Monthly Task', 0, NULL),
(7, '2024-12-06 17:45:14', 5, 5, 'AKL Creation', 'Daily Task', 1, '2024-12-06 17:47:00'),
(8, '2024-12-06 17:54:43', 5, 5, 'Update overtime HRIS ADM', 'Daily Task', 1, '2024-12-06 17:54:00'),
(9, '2024-12-06 18:59:25', 5, 5, 'Coding for communize application 1000 email', 'Weekly Task', 0, NULL),
(17, '2024-12-09 07:59:44', 3, 6, 'Database Backup', 'Weekly Task', 0, NULL),
(18, '2024-12-09 08:02:01', 5, 5, 'Order arrangement check for LSP parts', 'Daily Task', 0, NULL),
(19, '2024-12-09 08:02:01', 5, 5, 'PO Approval separation & distribution', 'Daily Task', 0, NULL),
(20, '2024-12-09 08:02:01', 5, 5, 'Change PO Consumable IDM parts', 'Daily Task', 0, NULL),
(21, '2024-12-09 08:02:01', 5, 5, 'Change PO LP (Logistic request)', 'Daily Task', 0, NULL),
(22, '2024-12-09 08:02:01', 5, 5, 'Spesial Order creation (Special event request Logistic)', 'Daily Task', 0, NULL),
(23, '2024-12-09 08:02:01', 5, 5, 'AKL Creation', 'Daily Task', 0, NULL),
(24, '2024-12-09 08:02:01', 5, 5, 'Update overtime HRIS ADM', 'Daily Task', 0, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `reoccuring_job_base`
--

CREATE TABLE `reoccuring_job_base` (
  `id` int(11) NOT NULL,
  `user` int(11) DEFAULT NULL,
  `groupjob` int(11) DEFAULT NULL,
  `job` char(255) DEFAULT NULL,
  `tipe` enum('Daily Task','Weekly Task','Bi Weekly Task','Monthly Task') NOT NULL DEFAULT 'Daily Task',
  `reoccuring_tipe` enum('Daily','Date','Day') DEFAULT NULL,
  `reoccuring_unset` char(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `reoccuring_job_base`
--

INSERT INTO `reoccuring_job_base` (`id`, `user`, `groupjob`, `job`, `tipe`, `reoccuring_tipe`, `reoccuring_unset`) VALUES
(1, 5, 5, 'Order arrangement check for LSP parts', 'Daily Task', 'Daily', NULL),
(2, 5, 5, 'PO Approval separation & distribution', 'Daily Task', 'Daily', NULL),
(3, 5, 5, 'Change PO Consumable IDM parts', 'Daily Task', 'Daily', NULL),
(4, 5, 5, 'Change PO LP (Logistic request)', 'Daily Task', 'Daily', NULL),
(5, 5, 5, 'Spesial Order creation (Special event request Logistic)', 'Daily Task', 'Daily', NULL),
(6, 2, 7, 'Production Meeting', 'Monthly Task', 'Date', '19'),
(7, 5, 5, 'AKL Creation', 'Daily Task', 'Daily', NULL),
(8, 5, 5, 'Update overtime HRIS ADM', 'Daily Task', 'Daily', NULL),
(9, 5, 5, 'Coding for communize application 1000 email', 'Weekly Task', 'Day', 'Tuesday'),
(10, 3, 6, 'Database Backup', 'Weekly Task', 'Day', 'Friday');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `nama` char(100) DEFAULT NULL,
  `username` char(50) DEFAULT NULL,
  `password` char(255) DEFAULT NULL,
  `group` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`id`, `nama`, `username`, `password`, `group`) VALUES
(1, 'Lilik Widianto', 'lilik', '$2a$12$ZYlVrV0PRzYlAmStoesJt.B3eK9uCIRXX93KpCVY1uPt4PtmNXrVG', 4),
(2, 'Gita Yoan', 'gita', '$2a$12$MCy7dU37D.s1dsNil.oCHOjTFN5n6y1maPRwNkFCoU4ef4a4wPHtq', 7),
(3, 'Abdul Malik Ibrahim', 'malik', '$2a$12$MMQlSrnUWp.T480z1PUGDeUbabJI9gnWPxf3KrIR1YCrfg8xTGIB2', 6),
(4, 'Ferdi', 'ferdi', '$2a$12$R0armfMVvS92jfzyliq98eJ0T42rSd9g4fB7UUxPWmziu5eP6TKnq', 3),
(5, 'Totoh Faturohman', 'totoh', '$2a$12$4kRUoGln1na8g/A0VXq.WOJY9K/9ec.GcSR3zJ.inssZ.H6ZyZiFi', 5),
(6, 'Aji', 'aji', '$2a$12$u5/ZF0V04lTezdyDmQTpoesoJvMzclwJpqNxh5F6VxKOjxovmXC3K', 5),
(7, 'Agung Wicaksono', 'agung', '$2a$12$sn55as.iiAGviRuPD5oBr.pc2OCUmLEcNSah1tXVqXv/rF.D08LQC', 1),
(8, 'Isna', 'isna', '$2a$12$R3aomF8dvx0DNzA/5nDnbOCXpI3Q3cKHh1hyKDtivbIfbXSqqgiKq', 2);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `group`
--
ALTER TABLE `group`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `joblist`
--
ALTER TABLE `joblist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inputerjobList` (`inputer`),
  ADD KEY `groupjobjobList` (`groupjob`);

--
-- Indeks untuk tabel `joblist_group`
--
ALTER TABLE `joblist_group`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `reoccuring_job`
--
ALTER TABLE `reoccuring_job`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reoccuring_job_groupjob` (`groupjob`),
  ADD KEY `reoccuring_job_user` (`user`);

--
-- Indeks untuk tabel `reoccuring_job_base`
--
ALTER TABLE `reoccuring_job_base`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reoccuring_job_groupjob` (`groupjob`),
  ADD KEY `reoccuring_job_base_user` (`user`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groupUser` (`group`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `group`
--
ALTER TABLE `group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `joblist`
--
ALTER TABLE `joblist`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `joblist_group`
--
ALTER TABLE `joblist_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `reoccuring_job`
--
ALTER TABLE `reoccuring_job`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT untuk tabel `reoccuring_job_base`
--
ALTER TABLE `reoccuring_job_base`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `joblist`
--
ALTER TABLE `joblist`
  ADD CONSTRAINT `groupjobjobList` FOREIGN KEY (`groupjob`) REFERENCES `group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inputerjobList` FOREIGN KEY (`inputer`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reoccuring_job`
--
ALTER TABLE `reoccuring_job`
  ADD CONSTRAINT `reoccuring_job_groupjob` FOREIGN KEY (`groupjob`) REFERENCES `group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reoccuring_job_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reoccuring_job_base`
--
ALTER TABLE `reoccuring_job_base`
  ADD CONSTRAINT `reoccuring_job_base_gruopjob` FOREIGN KEY (`groupjob`) REFERENCES `group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reoccuring_job_base_user` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `groupUser` FOREIGN KEY (`group`) REFERENCES `group` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
