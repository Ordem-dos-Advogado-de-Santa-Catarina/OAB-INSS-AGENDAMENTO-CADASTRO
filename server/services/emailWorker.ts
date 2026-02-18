/**
 * Email Worker - Processa a fila de e-mails
 * 
 * Este serviço é responsável por:
 * - Buscar e-mails pendentes na fila
 * - Enviar e-mails usando as configurações SMTP do banco de dados
 * - Atualizar o status dos e-mails (sent/failed)
 * - Implementar retry logic para falhas temporárias
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { 
  getPendingEmails, 
  markEmailAsSent, 
  markEmailAsFailed,
  getSystemSettings 
} from "../db";

export class EmailWorker {
  private transporter: Transporter | null = null;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastConfigUpdate = 0;
  private readonly CONFIG_CACHE_TIME = 5 * 60 * 1000; // 5 minutos

  /**
   * Cria ou atualiza o transporter do nodemailer com as configurações do banco
   */
  private async createTransporter(): Promise<Transporter | null> {
    try {
      const settings = await getSystemSettings();
      
      if (!settings) {
        console.error("[EmailWorker] Configurações do sistema não encontradas");
        return null;
      }

      // Verifica se as configurações SMTP estão definidas
      if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
        console.warn("[EmailWorker] Configurações SMTP incompletas. Configure no painel administrativo.");
        return null;
      }

      // Determina se deve usar SSL implícito (porta 465) ou STARTTLS (outras portas)
      // O erro 'wrong version number' ocorre quando tentamos SSL em uma porta que espera STARTTLS
      const isSecure = settings.smtpPort === 465 || settings.smtpSecure;

      // Cria o transporter com as configurações do banco
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: isSecure,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword,
        },
        // Adiciona configurações extras de segurança para evitar erros de certificado/versão
        tls: {
          rejectUnauthorized: false, // Permite certificados auto-assinados se necessário
          minVersion: 'TLSv1.2'
        }
      });

      // Verifica a conexão
      await transporter.verify();
      console.log("[EmailWorker] Transporter SMTP criado e verificado com sucesso");
      
      this.lastConfigUpdate = Date.now();
      return transporter;
    } catch (error) {
      console.error("[EmailWorker] Erro ao criar transporter:", error);
      return null;
    }
  }

  /**
   * Obtém o transporter, criando um novo se necessário ou se as configurações expiraram
   */
  private async getTransporter(): Promise<Transporter | null> {
    const now = Date.now();
    
    // Recria o transporter se não existe ou se o cache expirou
    if (!this.transporter || (now - this.lastConfigUpdate) > this.CONFIG_CACHE_TIME) {
      this.transporter = await this.createTransporter();
    }
    
    return this.transporter;
  }

  /**
   * Processa um único e-mail da fila
   */
  private async processEmail(email: any): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      if (!transporter) {
        console.warn(`[EmailWorker] Transporter não disponível. E-mail ${email.id} não será processado.`);
        return;
      }

      const settings = await getSystemSettings();
      if (!settings) {
        throw new Error("Configurações do sistema não encontradas");
      }

      // Envia o e-mail
      await transporter.sendMail({
        from: `"${settings.senderName}" <${settings.senderEmail}>`,
        to: email.toName ? `"${email.toName}" <${email.toEmail}>` : email.toEmail,
        subject: email.subject,
        html: email.body,
      });

      // Marca como enviado
      await markEmailAsSent(email.id);
      console.log(`[EmailWorker] E-mail ${email.id} enviado com sucesso para ${email.toEmail}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[EmailWorker] Erro ao enviar e-mail ${email.id}:`, errorMessage);
      
      // Marca como falha se exceder o número de tentativas
      if (email.retryCount >= 3) {
        await markEmailAsFailed(email.id, errorMessage);
        console.error(`[EmailWorker] E-mail ${email.id} marcado como falha após ${email.retryCount} tentativas`);
      } else {
        await markEmailAsFailed(email.id, `Tentativa ${email.retryCount + 1}: ${errorMessage}`);
      }
    }
  }

  /**
   * Processa a fila de e-mails pendentes
   */
  private async processQueue(): Promise<void> {
    if (this.isRunning) {
      return; // Evita execuções simultâneas
    }

    this.isRunning = true;
    
    try {
      const pendingEmails = await getPendingEmails(10); // Processa até 10 e-mails por vez
      
      if (pendingEmails.length === 0) {
        return;
      }

      console.log(`[EmailWorker] Processando ${pendingEmails.length} e-mails pendentes`);

      // Processa e-mails sequencialmente para evitar sobrecarga
      for (const email of pendingEmails) {
        await this.processEmail(email);
        // Pequeno delay entre e-mails para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("[EmailWorker] Erro ao processar fila:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Inicia o worker para processar e-mails periodicamente
   */
  start(intervalSeconds: number = 30): void {
    if (this.intervalId) {
      console.warn("[EmailWorker] Worker já está em execução");
      return;
    }

    console.log(`[EmailWorker] Iniciando worker (intervalo: ${intervalSeconds}s)`);
    
    // Processa imediatamente
    this.processQueue();
    
    // Configura processamento periódico
    this.intervalId = setInterval(() => {
      this.processQueue();
    }, intervalSeconds * 1000);
  }

  /**
   * Para o worker
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[EmailWorker] Worker parado");
    }
  }

  /**
   * Força o recarregamento das configurações SMTP
   */
  async reloadConfig(): Promise<void> {
    console.log("[EmailWorker] Recarregando configurações SMTP");
    this.transporter = await this.createTransporter();
  }
}

// Exporta instância singleton
export const emailWorker = new EmailWorker();
