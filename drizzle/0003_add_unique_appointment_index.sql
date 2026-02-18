-- Custom SQL migration to add unique index to appointments table
CREATE UNIQUE INDEX `unique_appointment_idx` ON `appointments` (`APPOINTMENTDATE`, `STARTTIME`);
