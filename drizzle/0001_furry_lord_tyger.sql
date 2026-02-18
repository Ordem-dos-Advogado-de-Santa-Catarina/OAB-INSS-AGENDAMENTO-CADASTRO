CREATE TABLE `appointment_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthlyLimit` int NOT NULL DEFAULT 2,
	`currentMonth` varchar(7) NOT NULL,
	`appointmentsThisMonth` int NOT NULL DEFAULT 0,
	`lastCancellationAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointment_limits_id` PRIMARY KEY(`id`),
	CONSTRAINT `appointment_limits_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appointmentDate` datetime NOT NULL,
	`startTime` varchar(8) NOT NULL,
	`endTime` varchar(8) NOT NULL,
	`reason` varchar(100) NOT NULL,
	`notes` text,
	`status` enum('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
	`cancelledAt` timestamp,
	`cancellationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocked_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockedDate` datetime NOT NULL,
	`startTime` varchar(8) NOT NULL,
	`endTime` varchar(8) NOT NULL,
	`blockType` enum('full_day','time_slot') NOT NULL,
	`reason` text NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blocked_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_report_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` datetime NOT NULL,
	`appointmentCount` int NOT NULL,
	`adminEmailsSent` int NOT NULL,
	`status` enum('success','failed') NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_report_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_report_logs_reportDate_unique` UNIQUE(`reportDate`)
);
--> statement-breakpoint
CREATE TABLE `email_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toEmail` varchar(320) NOT NULL,
	`toName` varchar(255),
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`emailType` varchar(50) NOT NULL,
	`appointmentId` int,
	`userId` int,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`failureReason` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workingHoursStart` varchar(8) NOT NULL DEFAULT '08:00:00',
	`workingHoursEnd` varchar(8) NOT NULL DEFAULT '12:00:00',
	`appointmentDurationMinutes` int NOT NULL DEFAULT 30,
	`monthlyLimitPerUser` int NOT NULL DEFAULT 2,
	`cancellationBlockingHours` int NOT NULL DEFAULT 2,
	`maxAdvancedBookingDays` int NOT NULL DEFAULT 30,
	`blockingTimeAfterHours` varchar(8) NOT NULL DEFAULT '19:00:00',
	`institutionName` varchar(255) NOT NULL DEFAULT 'OAB/SC',
	`institutionAddress` text,
	`institutionPhone` varchar(20),
	`senderEmail` varchar(320) NOT NULL,
	`senderName` varchar(255) NOT NULL,
	`adminEmails` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `cpf` varchar(14) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `oab` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_cpf_unique` UNIQUE(`cpf`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_oab_unique` UNIQUE(`oab`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `appointment_limits` (`userId`);--> statement-breakpoint
CREATE INDEX `currentMonth_idx` ON `appointment_limits` (`currentMonth`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `appointments` (`userId`);--> statement-breakpoint
CREATE INDEX `appointmentDate_idx` ON `appointments` (`appointmentDate`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `blockedDate_idx` ON `blocked_slots` (`blockedDate`);--> statement-breakpoint
CREATE INDEX `blockType_idx` ON `blocked_slots` (`blockType`);--> statement-breakpoint
CREATE INDEX `reportDate_idx` ON `daily_report_logs` (`reportDate`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `daily_report_logs` (`status`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `email_queue` (`status`);--> statement-breakpoint
CREATE INDEX `appointmentId_idx` ON `email_queue` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `email_queue` (`createdAt`);--> statement-breakpoint
CREATE INDEX `cpf_idx` ON `users` (`cpf`);--> statement-breakpoint
CREATE INDEX `oab_idx` ON `users` (`oab`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);