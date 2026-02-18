CREATE TABLE `appointment_messages` (
`ID` int AUTO_INCREMENT NOT NULL,
`APPOINTMENTID` int NOT NULL,
`SENDERID` int NOT NULL,
`MESSAGE` text NOT NULL,
`ISADMIN` boolean NOT NULL DEFAULT false,
`ISREAD` boolean NOT NULL DEFAULT false,
`CREATEDAT` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `appointment_messages_ID` PRIMARY KEY(`ID`)
);
CREATE INDEX `appointment_idx` ON `appointment_messages` (`APPOINTMENTID`);
