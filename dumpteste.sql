/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: agendamento_inss
-- ------------------------------------------------------
-- Server version	10.11.13-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment_limits`
--

DROP TABLE IF EXISTS `appointment_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_limits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `monthlyLimit` int(11) NOT NULL DEFAULT 999,
  `currentMonth` varchar(7) NOT NULL,
  `appointmentsThisMonth` int(11) NOT NULL DEFAULT 0,
  `lastCancellationAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  KEY `userId_idx` (`userId`),
  KEY `currentMonth_idx` (`currentMonth`),
  CONSTRAINT `appointment_limits_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_limits`
--

LOCK TABLES `appointment_limits` WRITE;
/*!40000 ALTER TABLE `appointment_limits` DISABLE KEYS */;
INSERT INTO `appointment_limits` VALUES
(1,1,999,'2026-02',0,'2026-02-02 20:48:20','2026-01-29 20:48:20','2026-02-02 17:48:20'),
(2,2769,999,'2026-02',1,'2026-02-01 11:10:25','2026-02-01 07:42:02','2026-02-02 17:24:34');
/*!40000 ALTER TABLE `appointment_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_messages`
--

DROP TABLE IF EXISTS `appointment_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_messages` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `APPOINTMENTID` int(11) NOT NULL,
  `SENDERID` int(11) NOT NULL,
  `MESSAGE` text NOT NULL,
  `ISADMIN` tinyint(1) NOT NULL DEFAULT 0,
  `ISREAD` tinyint(1) NOT NULL DEFAULT 0,
  `CREATEDAT` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`),
  KEY `appointment_idx` (`APPOINTMENTID`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_messages`
--

LOCK TABLES `appointment_messages` WRITE;
/*!40000 ALTER TABLE `appointment_messages` DISABLE KEYS */;
INSERT INTO `appointment_messages` VALUES
(1,10,2769,'teste 123',0,1,'2026-02-02 05:41:43'),
(2,10,2769,'teste',0,1,'2026-02-02 05:42:12'),
(3,10,1,'teste',1,1,'2026-02-02 05:43:59'),
(4,10,1,'teste',1,1,'2026-02-02 05:44:10'),
(5,11,2769,'Teste 1[',0,1,'2026-02-02 13:36:39'),
(6,11,1,'TEst 2',1,1,'2026-02-02 13:36:45'),
(7,11,2769,'teste 3',0,1,'2026-02-02 13:36:48'),
(8,11,1,'Teste 4',1,1,'2026-02-02 13:36:52'),
(9,10,2769,'TEste',0,1,'2026-02-02 15:53:05'),
(10,10,2769,'Teste3',0,1,'2026-02-02 15:53:10'),
(11,10,2769,'teste',0,1,'2026-02-02 17:42:53'),
(12,10,1,'1',1,1,'2026-02-02 17:48:27'),
(13,10,2769,'Teste',0,1,'2026-02-02 19:42:21'),
(14,10,1,'Teste 2',1,1,'2026-02-02 19:57:56'),
(15,10,2769,'Olá',0,1,'2026-02-02 20:05:46'),
(16,10,1,'Teste',1,1,'2026-02-02 20:05:56'),
(17,10,2769,'teste',0,1,'2026-02-02 20:10:19'),
(18,10,1,'teste',1,1,'2026-02-02 20:10:27'),
(19,10,1,'teste',1,1,'2026-02-02 20:10:33'),
(20,10,1,'teste1',1,1,'2026-02-02 20:11:49'),
(21,10,2769,'teste2',0,1,'2026-02-02 20:13:01'),
(22,11,2769,'teste2',0,1,'2026-02-02 20:13:10'),
(23,11,2769,'teste1',0,1,'2026-02-02 20:15:25'),
(24,10,2769,'teste1',0,1,'2026-02-02 20:15:27'),
(25,10,2769,'Teste',0,1,'2026-02-02 20:24:01'),
(26,10,2769,'Olá',0,1,'2026-02-02 20:58:40'),
(27,11,2769,'Olá',0,0,'2026-02-02 20:58:42'),
(28,10,1,'teste',1,1,'2026-02-02 21:12:45');
/*!40000 ALTER TABLE `appointment_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `appointmentDate` datetime NOT NULL,
  `startTime` varchar(8) NOT NULL,
  `endTime` varchar(8) NOT NULL,
  `reason` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
  `cancelledAt` timestamp NULL DEFAULT NULL,
  `cancellationReason` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `appointmentDate_idx` (`appointmentDate`),
  KEY `status_idx` (`status`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES
(1,1,'2026-02-02 03:00:00','08:30:00','09:00:00','Atendimento Geral','teste','cancelled','2026-02-02 08:24:52','1','2026-01-29 20:48:20','2026-02-02 05:24:52'),
(2,1,'2026-02-02 03:00:00','09:30:00','10:00:00','Atendimento Geral','3323','confirmed','2026-02-02 07:39:49','t','2026-01-29 20:54:50','2026-02-02 18:09:06'),
(3,1,'2026-02-03 03:00:00','08:30:00','09:00:00','Renovação de Inscrição','eteste','cancelled','2026-02-02 08:24:59','1','2026-01-31 04:55:28','2026-02-02 05:24:59'),
(4,1,'2026-02-04 03:00:00','08:30:00','09:00:00','Problemas com Senha','5ytrt','cancelled','2026-02-01 14:48:05','34','2026-01-31 08:18:15','2026-02-01 11:48:05'),
(5,2769,'2026-02-03 03:00:00','08:30:00','09:00:00','Atendimento Geral','2323','cancelled','2026-02-02 08:25:02','1','2026-02-01 07:42:02','2026-02-02 05:25:02'),
(6,2769,'2026-02-03 03:00:00','10:00:00','10:30:00','Renovação de Inscrição','42423','cancelled','2026-02-02 08:25:04','1','2026-02-01 07:42:08','2026-02-02 05:25:04'),
(7,1,'2026-02-03 03:00:00','09:00:00','09:30:00','Renovação de Inscrição','2323323','cancelled','2026-02-02 20:48:20','1','2026-02-01 11:27:11','2026-02-02 17:48:20'),
(8,1,'2026-02-03 03:00:00','09:30:00','10:00:00','Renovação de Inscrição','423423','cancelled','2026-02-02 07:55:15','1','2026-02-01 11:30:56','2026-02-02 04:55:16'),
(9,2769,'2026-02-03 03:00:00','08:30:00','09:00:00','Problemas com Senha','3232','cancelled','2026-02-02 08:43:06','1','2026-02-02 04:32:54','2026-02-02 05:43:06'),
(10,2769,'2026-02-03 03:00:00','08:00:00','08:30:00','Atendimento Geral','23434','confirmed',NULL,NULL,'2026-02-02 05:25:59','2026-02-02 05:25:59'),
(11,2769,'2026-02-03 03:00:00','08:30:00','09:00:00','Renovação de Inscrição','21323','confirmed',NULL,NULL,'2026-02-02 05:26:07','2026-02-02 05:26:07');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entityType` varchar(50) NOT NULL,
  `entityId` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `action_idx` (`action`),
  KEY `createdAt_idx` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES
(1,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:32:10'),
(2,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:32:22'),
(3,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:35:00'),
(4,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:40:20'),
(5,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:42:37'),
(6,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:45:31'),
(7,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:45:48'),
(8,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:46:17'),
(9,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:47:10'),
(10,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:47:23'),
(11,1,'CREATE_APPOINTMENT','appointment',NULL,'Agendamento para 02/02/2026 às 08:30:00','::ffff:172.26.0.1','2026-01-29 20:48:20'),
(12,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 20:54:32'),
(13,1,'CREATE_APPOINTMENT','appointment',NULL,'Agendamento para 02/02/2026 às 09:30:00','::ffff:172.26.0.1','2026-01-29 20:54:50'),
(14,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 21:41:43'),
(15,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-29 21:46:22'),
(16,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.26.0.1','2026-01-30 01:12:25'),
(17,1,'CANCEL_APPOINTMENT','appointment',2,NULL,'::ffff:172.26.0.1','2026-01-30 01:15:44'),
(18,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 30/01/2026 (full_day)','::ffff:172.26.0.1','2026-01-30 01:55:32'),
(19,1,'DELETE_BLOCK','blocked_slot',1,NULL,'::ffff:172.26.0.1','2026-01-30 01:55:38'),
(20,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 05/02/2026 (full_day)','::ffff:172.26.0.1','2026-01-30 01:55:52'),
(21,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-01-30 14:00:28'),
(22,1,'DELETE_BLOCK','blocked_slot',2,NULL,'::ffff:172.27.0.1','2026-01-30 14:01:15'),
(23,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 12/02/2026 (period)','::ffff:172.27.0.1','2026-01-30 16:43:53'),
(24,1,'CANCEL_APPOINTMENT','appointment',1,'Teste','::ffff:172.27.0.1','2026-01-30 16:45:01'),
(25,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-01-30 23:34:20'),
(26,1,'CREATE_APPOINTMENT','appointment',NULL,'Agendamento para 03/02/2026 às 08:30:00','::ffff:172.27.0.1','2026-01-31 04:55:28'),
(27,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-01-31 06:49:00'),
(28,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-01-31 06:49:00'),
(29,1,'UPDATE_STATUS','appointment',2,'Status alterado para pending','::ffff:172.27.0.1','2026-01-31 08:17:20'),
(30,1,'UPDATE_STATUS','appointment',2,'Status alterado para pending','::ffff:172.27.0.1','2026-01-31 08:17:21'),
(31,1,'UPDATE_STATUS','appointment',2,'Status alterado para no_show','::ffff:172.27.0.1','2026-01-31 08:17:22'),
(32,1,'UPDATE_STATUS','appointment',1,'Status alterado para no_show','::ffff:172.27.0.1','2026-01-31 08:17:28'),
(33,1,'CREATE_APPOINTMENT','appointment',NULL,'Agendamento para 04/02/2026 às 08:30:00','::ffff:172.27.0.1','2026-01-31 08:18:15'),
(34,1,'CANCEL_APPOINTMENT','appointment',3,'4354','::ffff:172.27.0.1','2026-01-31 08:18:29'),
(35,2769,'LOGIN_SOAP','user',2769,NULL,'::ffff:172.27.0.1','2026-02-01 07:41:42'),
(36,2769,'CREATE_APPOINTMENT','appointment',NULL,'Agendamento para 03/02/2026 às 08:30:00','::ffff:172.27.0.1','2026-02-01 07:42:02'),
(37,2769,'CREATE_APPOINTMENT','appointment',NULL,'Agendamento para 03/02/2026 às 10:00:00','::ffff:172.27.0.1','2026-02-01 07:42:08'),
(38,2769,'CANCEL_APPOINTMENT','appointment',5,'Teste','::ffff:172.27.0.1','2026-02-01 08:10:25'),
(39,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-01 08:14:11'),
(40,1,'UPDATE_STATUS','appointment',4,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 08:14:52'),
(41,1,'UPDATE_STATUS','appointment',4,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 08:14:53'),
(42,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 05/02/2026 (time_slot)','::ffff:172.27.0.1','2026-02-01 08:48:01'),
(43,1,'DELETE_BLOCK','blocked_slot',6,NULL,'::ffff:172.27.0.1','2026-02-01 08:48:22'),
(44,1,'DELETE_BLOCK','blocked_slot',3,NULL,'::ffff:172.27.0.1','2026-02-01 08:48:23'),
(45,1,'DELETE_BLOCK','blocked_slot',4,NULL,'::ffff:172.27.0.1','2026-02-01 08:48:23'),
(46,1,'DELETE_BLOCK','blocked_slot',5,NULL,'::ffff:172.27.0.1','2026-02-01 08:48:24'),
(47,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 12/02/2026 (full_day)','::ffff:172.27.0.1','2026-02-01 08:56:31'),
(48,1,'DELETE_BLOCK','blocked_slot',7,NULL,'::ffff:172.27.0.1','2026-02-01 08:56:43'),
(49,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 04/02/2026 (full_day)','::ffff:172.27.0.1','2026-02-01 11:20:53'),
(50,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-01 11:24:35'),
(51,1,'CREATE_APPOINTMENT','appointment',8,'Agendamento para 03/02/2026 às 09:30:00','::ffff:172.27.0.1','2026-02-01 11:30:56'),
(52,1,'DELETE_BLOCK','blocked_slot',8,NULL,'::ffff:172.27.0.1','2026-02-01 11:44:29'),
(53,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 04/02/2026 (full_day)','::ffff:172.27.0.1','2026-02-01 11:44:38'),
(54,1,'DELETE_BLOCK','blocked_slot',9,NULL,'::ffff:172.27.0.1','2026-02-01 11:44:52'),
(55,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 10/02/2026 (full_day)','::ffff:172.27.0.1','2026-02-01 11:45:53'),
(56,1,'UPDATE_STATUS','appointment',1,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:46:44'),
(57,1,'UPDATE_STATUS','appointment',2,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:46:45'),
(58,1,'UPDATE_STATUS','appointment',1,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:46:50'),
(59,1,'UPDATE_STATUS','appointment',2,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:46:51'),
(60,1,'UPDATE_STATUS','appointment',1,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:47:10'),
(61,1,'UPDATE_STATUS','appointment',1,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:47:11'),
(62,1,'UPDATE_STATUS','appointment',1,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:47:12'),
(63,1,'UPDATE_STATUS','appointment',1,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:47:13'),
(64,1,'UPDATE_STATUS','appointment',2,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:47:15'),
(65,1,'UPDATE_STATUS','appointment',2,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:47:16'),
(66,1,'UPDATE_STATUS','appointment',1,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:47:16'),
(67,1,'UPDATE_STATUS','appointment',1,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:47:17'),
(68,1,'UPDATE_STATUS','appointment',2,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:47:17'),
(69,1,'UPDATE_STATUS','appointment',1,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:47:20'),
(70,1,'UPDATE_STATUS','appointment',2,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:47:21'),
(71,1,'UPDATE_STATUS','appointment',1,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:47:22'),
(72,1,'UPDATE_STATUS','appointment',2,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:47:23'),
(73,1,'CANCEL_APPOINTMENT','appointment',7,'.','::ffff:172.27.0.1','2026-02-01 11:47:37'),
(74,1,'CANCEL_APPOINTMENT','appointment',8,'.','::ffff:172.27.0.1','2026-02-01 11:47:39'),
(75,1,'CANCEL_APPOINTMENT','appointment',1,'.','::ffff:172.27.0.1','2026-02-01 11:47:40'),
(76,1,'CANCEL_APPOINTMENT','appointment',2,'.','::ffff:172.27.0.1','2026-02-01 11:47:42'),
(77,1,'UPDATE_STATUS','appointment',4,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:48:00'),
(78,1,'UPDATE_STATUS','appointment',4,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:48:01'),
(79,1,'CANCEL_APPOINTMENT','appointment',4,'34','::ffff:172.27.0.1','2026-02-01 11:48:05'),
(80,1,'UPDATE_STATUS','appointment',6,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:49:34'),
(81,1,'UPDATE_STATUS','appointment',6,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:49:36'),
(82,1,'UPDATE_STATUS','appointment',6,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:49:37'),
(83,1,'UPDATE_STATUS','appointment',3,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:50:04'),
(84,1,'UPDATE_STATUS','appointment',5,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:50:05'),
(85,1,'UPDATE_STATUS','appointment',7,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:50:06'),
(86,1,'UPDATE_STATUS','appointment',3,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:08'),
(87,1,'UPDATE_STATUS','appointment',5,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:10'),
(88,1,'UPDATE_STATUS','appointment',7,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:11'),
(89,1,'UPDATE_STATUS','appointment',8,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:12'),
(90,1,'UPDATE_STATUS','appointment',6,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:12'),
(91,1,'UPDATE_STATUS','appointment',6,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:50:13'),
(92,1,'UPDATE_STATUS','appointment',6,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:13'),
(93,1,'UPDATE_STATUS','appointment',2,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:34'),
(94,1,'UPDATE_STATUS','appointment',2,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:50:35'),
(95,1,'UPDATE_STATUS','appointment',2,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:50:48'),
(96,1,'UPDATE_STATUS','appointment',2,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:50:50'),
(97,1,'UPDATE_STATUS','appointment',2,'Status alterado para pending','::ffff:172.27.0.1','2026-02-01 11:50:51'),
(98,1,'UPDATE_STATUS','appointment',2,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:50:52'),
(99,1,'UPDATE_STATUS','appointment',2,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-01 11:50:52'),
(100,1,'UPDATE_STATUS','appointment',2,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:50:53'),
(101,1,'UPDATE_STATUS','appointment',6,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:52:02'),
(102,1,'UPDATE_STATUS','appointment',6,'Status alterado para completed','::ffff:172.27.0.1','2026-02-01 11:52:03'),
(103,1,'UPDATE_STATUS','appointment',6,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-01 11:52:04'),
(104,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-01 22:53:15'),
(105,1,'UPDATE_STATUS','appointment',3,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 01:07:02'),
(106,1,'UPDATE_STATUS','appointment',5,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 01:07:03'),
(107,1,'UPDATE_STATUS','appointment',7,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 01:07:04'),
(108,1,'UPDATE_STATUS','appointment',8,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 01:07:04'),
(109,1,'UPDATE_STATUS','appointment',6,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 01:07:05'),
(110,1,'UPDATE_STATUS','appointment',3,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 01:07:06'),
(111,1,'UPDATE_STATUS','appointment',3,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 01:07:07'),
(112,1,'UPDATE_STATUS','appointment',3,'Status alterado para pending','::ffff:172.27.0.1','2026-02-02 01:07:08'),
(113,1,'UPDATE_STATUS','appointment',3,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 01:07:09'),
(114,1,'UPDATE_STATUS','appointment',5,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 01:07:10'),
(115,1,'UPDATE_STATUS','appointment',8,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 01:07:11'),
(116,1,'UPDATE_STATUS','appointment',6,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 01:07:12'),
(117,1,'UPDATE_STATUS','appointment',8,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 01:07:12'),
(118,1,'UPDATE_STATUS','appointment',7,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 01:07:12'),
(119,1,'UPDATE_STATUS','appointment',1,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 04:16:13'),
(120,1,'UPDATE_STATUS','appointment',1,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 04:16:15'),
(121,1,'UPDATE_STATUS','appointment',1,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 04:16:16'),
(122,1,'UPDATE_STATUS','appointment',1,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 04:16:16'),
(123,1,'UPDATE_STATUS','appointment',1,'Status alterado para pending','::ffff:172.27.0.1','2026-02-02 04:16:17'),
(124,1,'UPDATE_STATUS','appointment',1,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 04:16:17'),
(125,1,'UPDATE_STATUS','appointment',1,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 04:16:33'),
(126,2769,'LOGIN_SOAP','user',2769,NULL,'::ffff:172.27.0.1','2026-02-02 04:32:43'),
(127,2769,'CREATE_APPOINTMENT','appointment',9,'Agendamento para 03/02/2026 às 08:30:00','::ffff:172.27.0.1','2026-02-02 04:32:54'),
(128,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-02 04:38:09'),
(129,1,'CANCEL_APPOINTMENT','appointment',1,'t','::ffff:172.27.0.1','2026-02-02 04:39:30'),
(130,1,'CANCEL_APPOINTMENT','appointment',2,'t','::ffff:172.27.0.1','2026-02-02 04:39:36'),
(131,1,'UPDATE_STATUS','appointment',1,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 04:39:46'),
(132,1,'UPDATE_STATUS','appointment',2,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 04:39:47'),
(133,1,'CANCEL_APPOINTMENT','appointment',2,'t','::ffff:172.27.0.1','2026-02-02 04:39:49'),
(134,1,'CANCEL_APPOINTMENT','appointment',1,'t','::ffff:172.27.0.1','2026-02-02 04:39:53'),
(135,1,'UPDATE_STATUS','appointment',3,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 04:40:17'),
(136,1,'UPDATE_STATUS','appointment',9,'Status alterado para completed','::ffff:172.27.0.1','2026-02-02 04:40:17'),
(137,1,'UPDATE_STATUS','appointment',3,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 04:40:19'),
(138,1,'UPDATE_STATUS','appointment',5,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 04:40:20'),
(139,1,'UPDATE_STATUS','appointment',9,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 04:40:20'),
(140,1,'UPDATE_STATUS','appointment',7,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 04:40:20'),
(141,1,'UPDATE_STATUS','appointment',8,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 04:40:21'),
(142,1,'UPDATE_STATUS','appointment',6,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 04:40:21'),
(143,1,'CANCEL_APPOINTMENT','appointment',8,'1','::ffff:172.27.0.1','2026-02-02 04:55:16'),
(144,1,'CANCEL_APPOINTMENT','appointment',7,'3123','::ffff:172.27.0.1','2026-02-02 04:57:07'),
(145,1,'CREATE_BLOCK','blocked_slot',NULL,'Bloqueio em 12/02/2026 (full_day)','::ffff:172.27.0.1','2026-02-02 04:58:09'),
(146,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-02 05:19:30'),
(147,1,'CANCEL_APPOINTMENT','appointment',1,'1','::ffff:172.27.0.1','2026-02-02 05:24:52'),
(148,1,'CANCEL_APPOINTMENT','appointment',3,'1','::ffff:172.27.0.1','2026-02-02 05:24:59'),
(149,1,'CANCEL_APPOINTMENT','appointment',5,'1','::ffff:172.27.0.1','2026-02-02 05:25:02'),
(150,1,'CANCEL_APPOINTMENT','appointment',6,'1','::ffff:172.27.0.1','2026-02-02 05:25:04'),
(151,1,'CANCEL_APPOINTMENT','appointment',9,'1','::ffff:172.27.0.1','2026-02-02 05:25:12'),
(152,2769,'LOGIN_SOAP','user',2769,NULL,'::ffff:172.27.0.1','2026-02-02 05:25:51'),
(153,2769,'CREATE_APPOINTMENT','appointment',10,'Agendamento criado para 03/02/2026 às 08:00:00','::ffff:172.27.0.1','2026-02-02 05:25:59'),
(154,2769,'CREATE_APPOINTMENT','appointment',11,'Agendamento criado para 03/02/2026 às 08:30:00','::ffff:172.27.0.1','2026-02-02 05:26:07'),
(155,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-02 05:26:19'),
(156,2769,'LOGIN_SOAP','user',2769,NULL,'::ffff:172.27.0.1','2026-02-02 05:38:11'),
(157,2769,'LOGIN_SOAP','user',2769,NULL,'::ffff:172.27.0.1','2026-02-02 05:39:17'),
(158,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-02 05:39:30'),
(159,1,'UPDATE_STATUS','appointment',9,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 05:43:02'),
(160,1,'CANCEL_APPOINTMENT','appointment',9,'1','::ffff:172.27.0.1','2026-02-02 05:43:06'),
(161,2769,'LOGIN_SOAP','user',2769,NULL,'::ffff:172.27.0.1','2026-02-02 13:35:06'),
(162,2769,'LOGIN_SOAP','user',2769,NULL,'::ffff:172.27.0.1','2026-02-02 17:37:06'),
(163,1,'UPDATE_STATUS','appointment',7,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 17:48:15'),
(164,1,'CANCEL_APPOINTMENT','appointment',7,'1','::ffff:172.27.0.1','2026-02-02 17:48:20'),
(165,1,'UPDATE_STATUS','appointment',2,'Status alterado para no_show','::ffff:172.27.0.1','2026-02-02 18:09:03'),
(166,1,'UPDATE_STATUS','appointment',2,'Status alterado para confirmed','::ffff:172.27.0.1','2026-02-02 18:09:06'),
(167,1,'LOGIN_SOAP','user',1,NULL,'::ffff:172.27.0.1','2026-02-02 18:09:58');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blocked_slots`
--

DROP TABLE IF EXISTS `blocked_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `blocked_slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blockedDate` datetime NOT NULL,
  `startTime` varchar(8) NOT NULL,
  `endTime` varchar(8) NOT NULL,
  `blockType` enum('full_day','time_slot') NOT NULL,
  `reason` text NOT NULL,
  `createdBy` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `blockedDate_idx` (`blockedDate`),
  KEY `blockType_idx` (`blockType`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blocked_slots`
--

LOCK TABLES `blocked_slots` WRITE;
/*!40000 ALTER TABLE `blocked_slots` DISABLE KEYS */;
INSERT INTO `blocked_slots` VALUES
(10,'2026-02-10 15:00:00','08:00:00','12:00:00','full_day','bbbbbbbbbbb',1,'2026-02-01 11:45:53','2026-02-01 11:45:53'),
(11,'2026-02-12 15:00:00','08:00:00','12:00:00','full_day','3444',1,'2026-02-02 04:58:09','2026-02-02 04:58:09');
/*!40000 ALTER TABLE `blocked_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_queue`
--

DROP TABLE IF EXISTS `email_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `toEmail` varchar(320) NOT NULL,
  `toName` varchar(255) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `emailType` varchar(50) NOT NULL,
  `appointmentId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `sentAt` timestamp NULL DEFAULT NULL,
  `failureReason` text DEFAULT NULL,
  `retryCount` int(11) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `status_idx` (`status`),
  KEY `appointmentId_idx` (`appointmentId`),
  KEY `createdAt_idx` (`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_queue`
--

LOCK TABLES `email_queue` WRITE;
/*!40000 ALTER TABLE `email_queue` DISABLE KEYS */;
INSERT INTO `email_queue` VALUES
(1,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:30:00 às 09:00:00</p>\n                <p><span class=\"label\">Motivo:</span> Atendimento Geral</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',NULL,1,'sent','2026-02-01 14:07:09',NULL,0,'2026-01-29 20:48:20','2026-02-01 11:07:09'),
(2,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 09:30:00 às 10:00:00</p>\n                <p><span class=\"label\">Motivo:</span> Atendimento Geral</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',NULL,1,'sent','2026-02-01 14:07:13',NULL,0,'2026-01-29 20:54:50','2026-02-01 11:07:13'),
(3,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 29/01/2026</p>\n                <p><span class=\"label\">Horário:</span> 22:15:44</p>\n                \n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',2,1,'sent','2026-02-01 14:07:18',NULL,0,'2026-01-30 01:15:44','2026-02-01 11:07:18'),
(4,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 30/01/2026</p>\n                <p><span class=\"label\">Horário:</span> 13:45:01</p>\n                <p><span class=\"label\">Motivo:</span> Teste</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',1,1,'sent','2026-02-01 14:07:22',NULL,0,'2026-01-30 16:45:01','2026-02-01 11:07:22'),
(5,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 03/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:30:00 às 09:00:00</p>\n                <p><span class=\"label\">Motivo:</span> Renovação de Inscrição</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',NULL,1,'sent','2026-02-01 14:07:26',NULL,0,'2026-01-31 04:55:28','2026-02-01 11:07:26'),
(6,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 04/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:30:00 às 09:00:00</p>\n                <p><span class=\"label\">Motivo:</span> Problemas com Senha</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',NULL,1,'sent','2026-02-01 14:07:30',NULL,0,'2026-01-31 08:18:15','2026-02-01 11:07:30'),
(7,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 31/01/2026</p>\n                <p><span class=\"label\">Horário:</span> 05:18:29</p>\n                <p><span class=\"label\">Motivo:</span> 4354</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',3,1,'sent','2026-02-01 14:07:35',NULL,0,'2026-01-31 08:18:29','2026-02-01 11:07:35'),
(8,'TESTE@TESTE.COM.BR','BRCTESTECADASTRO','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>BRCTESTECADASTRO</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 03/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:30:00 às 09:00:00</p>\n                <p><span class=\"label\">Motivo:</span> Atendimento Geral</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',NULL,2769,'sent','2026-02-01 14:06:51',NULL,0,'2026-02-01 07:42:02','2026-02-01 11:06:51'),
(9,'TESTE@TESTE.COM.BR','BRCTESTECADASTRO','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>BRCTESTECADASTRO</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 03/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 10:00:00 às 10:30:00</p>\n                <p><span class=\"label\">Motivo:</span> Renovação de Inscrição</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',NULL,2769,'sent','2026-02-01 14:06:55',NULL,0,'2026-02-01 07:42:08','2026-02-01 11:06:55'),
(10,'TESTE@TESTE.COM.BR','BRCTESTECADASTRO','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>BRCTESTECADASTRO</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 01/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 05:10:25</p>\n                <p><span class=\"label\">Motivo:</span> Teste</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',5,2769,'sent','2026-02-01 14:06:59',NULL,0,'2026-02-01 08:10:25','2026-02-01 11:06:59'),
(11,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 03/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 09:30:00 às undefined</p>\n                <p><span class=\"label\">Motivo:</span> Renovação de Inscrição</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',8,1,'sent','2026-02-01 14:31:27',NULL,0,'2026-02-01 11:30:56','2026-02-01 11:31:27'),
(12,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 01/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:47:37</p>\n                <p><span class=\"label\">Motivo:</span> .</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',7,1,'sent','2026-02-01 14:47:44',NULL,0,'2026-02-01 11:47:37','2026-02-01 11:47:44'),
(13,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 01/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:47:39</p>\n                <p><span class=\"label\">Motivo:</span> .</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',8,1,'sent','2026-02-01 14:47:49',NULL,0,'2026-02-01 11:47:39','2026-02-01 11:47:49'),
(14,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 01/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:47:40</p>\n                <p><span class=\"label\">Motivo:</span> .</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',1,1,'sent','2026-02-01 14:48:13',NULL,0,'2026-02-01 11:47:40','2026-02-01 11:48:13'),
(15,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 01/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:47:42</p>\n                <p><span class=\"label\">Motivo:</span> .</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',2,1,'sent','2026-02-01 14:48:17',NULL,0,'2026-02-01 11:47:42','2026-02-01 11:48:17'),
(16,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 01/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:48:05</p>\n                <p><span class=\"label\">Motivo:</span> 34</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',4,1,'sent','2026-02-01 14:48:22',NULL,0,'2026-02-01 11:48:05','2026-02-01 11:48:22'),
(17,'TESTE@TESTE.COM.BR','BRCTESTECADASTRO','Agendamento Confirmado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Confirmado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #667eea; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✓ Agendamento Confirmado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>BRCTESTECADASTRO</strong>,</p>\n            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 03/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 08:30:00 às undefined</p>\n                <p><span class=\"label\">Motivo:</span> Problemas com Senha</p>\n                \n                \n            </div>\n            \n            <p><strong>Importante:</strong></p>\n            <ul>\n                <li>Chegue com 10 minutos de antecedência</li>\n                <li>Leve seus documentos de identificação</li>\n                <li>Para cancelar, entre em contato com antecedência</li>\n            </ul>\n            \n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_confirmation',9,2769,'sent','2026-02-02 07:33:05',NULL,0,'2026-02-02 04:32:54','2026-02-02 04:33:05'),
(18,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 01:39:30</p>\n                <p><span class=\"label\">Motivo:</span> t</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',1,1,'sent','2026-02-02 07:39:57',NULL,0,'2026-02-02 04:39:30','2026-02-02 04:39:57'),
(19,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 01:39:36</p>\n                <p><span class=\"label\">Motivo:</span> t</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',2,1,'sent','2026-02-02 07:40:01',NULL,0,'2026-02-02 04:39:36','2026-02-02 04:40:01'),
(20,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 01:39:49</p>\n                <p><span class=\"label\">Motivo:</span> t</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',2,1,'sent','2026-02-02 07:40:05',NULL,0,'2026-02-02 04:39:49','2026-02-02 04:40:05'),
(21,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 01:39:53</p>\n                <p><span class=\"label\">Motivo:</span> t</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n            <p>Se tiver dúvidas, entre em contato conosco.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC</p>\n        </div>\n    </div>\n</body>\n</html>\n      ','appointment_cancellation',1,1,'sent','2026-02-02 07:40:26',NULL,0,'2026-02-02 04:39:53','2026-02-02 04:40:26'),
(22,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 01:55:16</p>\n                <p><span class=\"label\">Motivo:</span> 1</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n        </div>\n    </div>\n</body>\n</html>','appointment_cancellation',8,1,'sent','2026-02-02 07:55:27',NULL,0,'2026-02-02 04:55:16','2026-02-02 04:55:27'),
(23,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Agendamento Cancelado</title>\n    <style>\n        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }\n        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }\n        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }\n        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }\n        .label { font-weight: bold; color: #dc3545; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h2>✗ Agendamento Cancelado</h2>\n        </div>\n        <div class=\"content\">\n            <p>Olá <strong>TESTE #2485</strong>,</p>\n            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>\n            \n            <div class=\"details\">\n                <p><span class=\"label\">Data:</span> 02/02/2026</p>\n                <p><span class=\"label\">Horário:</span> 01:57:07</p>\n                <p><span class=\"label\">Motivo:</span> 3123</p>\n            </div>\n            \n            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>\n        </div>\n        <div class=\"footer\">\n            <p>Este é um email automático. Não responda diretamente.</p>\n        </div>\n    </div>\n</body>\n</html>','appointment_cancellation',7,1,'sent','2026-02-02 07:57:25',NULL,0,'2026-02-02 04:57:07','2026-02-02 04:57:25'),
(24,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá TESTE #2485</h1><p>Seu agendamento para o dia 02/02/2026 às 02:24:52 foi cancelado.</p>','appointment_cancellation',1,1,'sent','2026-02-02 08:25:06',NULL,0,'2026-02-02 05:24:52','2026-02-02 05:25:06'),
(25,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá TESTE #2485</h1><p>Seu agendamento para o dia 02/02/2026 às 02:24:59 foi cancelado.</p>','appointment_cancellation',3,1,'sent','2026-02-02 08:25:10',NULL,0,'2026-02-02 05:24:59','2026-02-02 05:25:10'),
(26,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá TESTE #2485</h1><p>Seu agendamento para o dia 02/02/2026 às 02:25:02 foi cancelado.</p>','appointment_cancellation',5,1,'sent','2026-02-02 08:25:34',NULL,0,'2026-02-02 05:25:02','2026-02-02 05:25:34'),
(27,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá TESTE #2485</h1><p>Seu agendamento para o dia 02/02/2026 às 02:25:04 foi cancelado.</p>','appointment_cancellation',6,1,'sent','2026-02-02 08:25:38',NULL,0,'2026-02-02 05:25:04','2026-02-02 05:25:38'),
(28,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá TESTE #2485</h1><p>Seu agendamento para o dia 02/02/2026 às 02:25:12 foi cancelado.</p>','appointment_cancellation',9,1,'sent','2026-02-02 08:25:42',NULL,0,'2026-02-02 05:25:12','2026-02-02 05:25:42'),
(29,'TESTE@TESTE.COM.BR','BRCTESTECADASTRO','Agendamento Confirmado - Sistema de Agendamento INSS','<h1>Olá BRCTESTECADASTRO</h1><p>Seu agendamento para o dia 03/02/2026 às 08:00 foi confirmado.</p>','appointment_confirmation',10,2769,'sent','2026-02-02 08:26:04',NULL,0,'2026-02-02 05:25:59','2026-02-02 05:26:04'),
(30,'TESTE@TESTE.COM.BR','BRCTESTECADASTRO','Agendamento Confirmado - Sistema de Agendamento INSS','<h1>Olá BRCTESTECADASTRO</h1><p>Seu agendamento para o dia 03/02/2026 às 08:30 foi confirmado.</p>','appointment_confirmation',11,2769,'sent','2026-02-02 08:26:34',NULL,0,'2026-02-02 05:26:07','2026-02-02 05:26:34'),
(31,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá TESTE #2485</h1><p>Seu agendamento para o dia 02/02/2026 às 02:43:06 foi cancelado.</p>','appointment_cancellation',9,1,'sent','2026-02-02 08:43:17',NULL,0,'2026-02-02 05:43:06','2026-02-02 05:43:17'),
(32,'dtioab@oab-sc.org.br','TESTE #2485','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá TESTE #2485</h1><p>Seu agendamento para o dia 02/02/2026 às 14:48:20 foi cancelado.</p>','appointment_cancellation',7,1,'sent','2026-02-02 20:48:49',NULL,0,'2026-02-02 17:48:20','2026-02-02 17:48:49');
/*!40000 ALTER TABLE `email_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_templates` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `SLUG` varchar(50) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `SUBJECT` varchar(255) NOT NULL,
  `BODY` text NOT NULL,
  `VARIABLES` text DEFAULT NULL,
  `UPDATEDAT` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ID`),
  UNIQUE KEY `SLUG` (`SLUG`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_templates`
--

LOCK TABLES `email_templates` WRITE;
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
INSERT INTO `email_templates` VALUES
(1,'appointment_confirmation','Confirmação de Agendamento','Agendamento Confirmado - Sistema de Agendamento INSS','<h1>Olá {userName}</h1><p>Seu agendamento para o dia {appointmentDate} às {startTime} foi confirmado.</p>','{userName}, {appointmentDate}, {startTime}, {endTime}, {reason}','2026-02-02 04:50:26'),
(2,'appointment_cancellation','Cancelamento de Agendamento','Agendamento Cancelado - Sistema de Agendamento INSS','<h1>Olá {userName}</h1><p>Seu agendamento para o dia {appointmentDate} às {startTime} foi cancelado.</p>','{userName}, {appointmentDate}, {startTime}, {reason}','2026-02-02 04:50:26'),
(3,'custom_notification','Notificação Customizada','Aviso Importante - Sistema de Agendamento INSS','<h1>Olá {userName}</h1><p>{message}</p>','{userName}, {message}','2026-02-02 04:50:26');
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workingHoursStart` varchar(8) NOT NULL DEFAULT '08:00:00',
  `workingHoursEnd` varchar(8) NOT NULL DEFAULT '12:00:00',
  `appointmentDurationMinutes` int(11) NOT NULL DEFAULT 30,
  `monthlyLimitPerUser` int(11) NOT NULL DEFAULT 999,
  `cancellationBlockingHours` int(11) NOT NULL DEFAULT 2,
  `maxAdvancedBookingDays` int(11) NOT NULL DEFAULT 30,
  `blockingTimeAfterHours` varchar(8) NOT NULL DEFAULT '19:00:00',
  `institutionName` varchar(255) NOT NULL DEFAULT 'OAB/SC',
  `institutionAddress` text DEFAULT NULL,
  `institutionPhone` varchar(20) DEFAULT NULL,
  `senderEmail` varchar(320) NOT NULL,
  `senderName` varchar(255) NOT NULL,
  `adminEmails` text NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `MINCANCELLATIONLEADTIMEHOURS` int(11) NOT NULL DEFAULT 5,
  `DAILYREPORTTIME` varchar(5) NOT NULL DEFAULT '19:00',
  `DAILYREPORTENABLED` tinyint(1) NOT NULL DEFAULT 1,
  `SMTPHOST` varchar(255) NOT NULL DEFAULT 'smtp.gmail.com',
  `SMTPPORT` int(11) NOT NULL DEFAULT 587,
  `SMTPSECURE` tinyint(1) NOT NULL DEFAULT 0,
  `SMTPUSER` varchar(320) DEFAULT NULL,
  `SMTPPASSWORD` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES
(1,'08:00:00','13:00:00',30,999,2,30,'19:00:00','OAB/SC','','','no-reply@oab-sc.org.br','OAB/SC Agendamentos','[\"no-reply@oab-sc.org.br\"]','2026-02-02 17:24:34',5,'19:00',1,'smtp.gmail.com',587,0,'no-reply@oab-sc.org.br','whkx qwhg rubh zqll');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `oab` varchar(20) NOT NULL,
  `name` text NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `nomeMae` text DEFAULT NULL,
  `nomePai` text DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `orgaoRg` varchar(20) DEFAULT NULL,
  `dataExpedicaoRg` varchar(10) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `loginMethod` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lastSignedIn` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `openId` (`openId`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `oab` (`oab`),
  KEY `cpf_idx` (`cpf`),
  KEY `oab_idx` (`oab`),
  KEY `email_idx` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=94534 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'soap_254.116.696-69','254.116.696-69','00000','TESTE #2485','dtioab@oab-sc.org.br','2341421433','89010-900','Rua Hermann Hering, 1005','Bom Retiro','BLUMENAU','SC','TESTE','','11111111','SSP','2000-01-01','admin',1,'soap','2026-01-29 20:24:57','2026-02-02 21:20:20','2026-02-03 00:20:20'),
(2769,'soap_131.947.510-85','131.947.510-85','','BRCTESTECADASTRO','TESTE@TESTE.COM.BR','2323333333323','88340-970','Rua Amsterdã, 58','Areias','CAMBORIÚ','SC','','','38.160.131-6','','','user',1,'soap','2026-02-01 07:41:42','2026-02-02 21:19:36','2026-02-03 00:19:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-02 18:20:20
