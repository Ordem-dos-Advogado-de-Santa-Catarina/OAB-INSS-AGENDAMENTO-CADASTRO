-- Migration: Adicionar campo de senha para autenticação local
-- Permite fallback quando webservice OAB estiver indisponível

ALTER TABLE `users` ADD COLUMN `PASSWORD_HASH` VARCHAR(255) NULL AFTER `LOGINMETHOD`;
ALTER TABLE `users` ADD INDEX `password_hash_idx` (`PASSWORD_HASH`);
