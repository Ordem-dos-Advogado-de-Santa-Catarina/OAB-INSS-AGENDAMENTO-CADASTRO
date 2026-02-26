CREATE TABLE `email_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toEmail` varchar(320) NOT NULL,
	`toName` varchar(255),
	`subject` varchar(255) NOT NULL,
	`emailType` varchar(50) NOT NULL,
	`formId` int,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`failureReason` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`previousStatus` enum('pending','analyzing','approved','rejected'),
	`newStatus` enum('pending','analyzing','approved','rejected') NOT NULL,
	`changedBy` int,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `form_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submitted_forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`processNumber` varchar(100) NOT NULL,
	`report` text NOT NULL,
	`defenderName` varchar(255) NOT NULL,
	`contactPhone` varchar(20) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`userName` text NOT NULL,
	`userCpf` varchar(14) NOT NULL,
	`userOab` varchar(20) NOT NULL,
	`userEmail` varchar(320) NOT NULL,
	`userPhone` varchar(20),
	`userAddress` text,
	`status` enum('pending','analyzing','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`adminNotes` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`statusChangedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submitted_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `email_formId_idx` ON `email_log` (`formId`);--> statement-breakpoint
CREATE INDEX `email_status_idx` ON `email_log` (`status`);--> statement-breakpoint
CREATE INDEX `history_formId_idx` ON `form_status_history` (`formId`);--> statement-breakpoint
CREATE INDEX `form_userId_idx` ON `submitted_forms` (`userId`);--> statement-breakpoint
CREATE INDEX `form_status_idx` ON `submitted_forms` (`status`);--> statement-breakpoint
CREATE INDEX `form_processNumber_idx` ON `submitted_forms` (`processNumber`);--> statement-breakpoint
CREATE INDEX `form_submittedAt_idx` ON `submitted_forms` (`submittedAt`);