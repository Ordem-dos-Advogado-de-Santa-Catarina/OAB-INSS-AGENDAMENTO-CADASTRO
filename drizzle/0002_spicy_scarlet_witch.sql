CREATE TABLE `admin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminEmails` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_settings_id` PRIMARY KEY(`id`)
);
