/**
 * Serviço de Email
 * 
 * Gerencia envio de notificações por email com suporte a templates dinâmicos
 */

import { addEmailToQueue, getSystemSettings, getEmailTemplateBySlug } from "../db";

export interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailService {
  /**
   * Substitui variáveis no formato {variableName} pelos valores reais
   */
  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.split(placeholder).join(value || "");
    }
    return result;
  }

  /**
   * Busca um template do banco ou usa o fallback padrão
   */
  private async getTemplate(slug: string, defaultTemplate: EmailTemplate, variables: Record<string, string>): Promise<EmailTemplate> {
    try {
      const dbTemplate = await getEmailTemplateBySlug(slug);
      
      const subject = dbTemplate ? dbTemplate.subject : defaultTemplate.subject;
      const body = dbTemplate ? dbTemplate.body : defaultTemplate.body;

      return {
        subject: this.replaceVariables(subject, variables),
        body: this.replaceVariables(body, variables),
      };
    } catch (error) {
      console.error(`[EmailService] Erro ao carregar template ${slug}:`, error);
      return {
        subject: this.replaceVariables(defaultTemplate.subject, variables),
        body: this.replaceVariables(defaultTemplate.body, variables),
      };
    }
  }

  /**
   * Template padrão de confirmação (Fallback)
   */
  private getDefaultConfirmationTemplate(): EmailTemplate {
    return {
      subject: "Agendamento Confirmado - Sistema de Agendamento INSS",
      body: `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendamento Confirmado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .label { font-weight: bold; color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>✓ Agendamento Confirmado</h2>
        </div>
        <div class="content">
            <p>Olá <strong>{userName}</strong>,</p>
            <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>
            
            <div class="details">
                <p><span class="label">Data:</span> {appointmentDate}</p>
                <p><span class="label">Horário:</span> {startTime} às {endTime}</p>
                <p><span class="label">Motivo:</span> {reason}</p>
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
                <li>Chegue com 10 minutos de antecedência</li>
                <li>Leve seus documentos de identificação</li>
            </ul>
        </div>
        <div class="footer">
            <p>Este é um email automático. Não responda diretamente.</p>
        </div>
    </div>
</body>
</html>`,
    };
  }

  /**
   * Template padrão de cancelamento (Fallback)
   */
  private getDefaultCancellationTemplate(): EmailTemplate {
    return {
      subject: "Agendamento Cancelado - Sistema de Agendamento INSS",
      body: `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendamento Cancelado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .label { font-weight: bold; color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>✗ Agendamento Cancelado</h2>
        </div>
        <div class="content">
            <p>Olá <strong>{userName}</strong>,</p>
            <p>Seu agendamento foi cancelado. Aqui estão os detalhes:</p>
            
            <div class="details">
                <p><span class="label">Data:</span> {appointmentDate}</p>
                <p><span class="label">Horário:</span> {startTime}</p>
                <p><span class="label">Motivo:</span> {reason}</p>
            </div>
            
            <p>Você pode agendar um novo horário a qualquer momento através do sistema.</p>
        </div>
        <div class="footer">
            <p>Este é um email automático. Não responda diretamente.</p>
        </div>
    </div>
</body>
</html>`,
    };
  }

  /**
   * Template padrão de notificação customizada (Fallback)
   */
  private getDefaultNotificationTemplate(): EmailTemplate {
    return {
      subject: "Notificação Importante - Sistema de Agendamento INSS",
      body: `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificação</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Aviso Importante</h2>
        </div>
        <div class="content">
            <p>Olá <strong>{userName}</strong>,</p>
            <p>{message}</p>
        </div>
        <div class="footer">
            <p>Este é um email automático. Não responda diretamente.</p>
        </div>
    </div>
</body>
</html>`,
    };
  }

  /**
   * Adiciona email à fila de envio
   */
  async queueEmail(data: {
    toEmail: string;
    toName?: string;
    subject: string;
    body: string;
    emailType: string;
    appointmentId?: number;
    userId?: number;
  }): Promise<void> {
    try {
      await addEmailToQueue(data);
    } catch (error) {
      console.error("[EmailService] Erro ao adicionar email à fila:", error);
      throw error;
    }
  }

  /**
   * Envia email de confirmação de agendamento
   */
  async sendAppointmentConfirmation(data: {
    toEmail: string;
    userName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    reason: string;
    appointmentId?: number;
    userId?: number;
  }): Promise<void> {
    const template = await this.getTemplate(
      "appointment_confirmation",
      this.getDefaultConfirmationTemplate(),
      {
        userName: data.userName,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason,
      }
    );

    await this.queueEmail({
      toEmail: data.toEmail,
      toName: data.userName,
      subject: template.subject,
      body: template.body,
      emailType: "appointment_confirmation",
      appointmentId: data.appointmentId,
      userId: data.userId,
    });
  }

  /**
   * Envia email de cancelamento de agendamento
   */
  async sendAppointmentCancellation(data: {
    toEmail: string;
    userName: string;
    appointmentDate: string;
    startTime: string;
    reason?: string;
    appointmentId?: number;
    userId?: number;
  }): Promise<void> {
    const template = await this.getTemplate(
      "appointment_cancellation",
      this.getDefaultCancellationTemplate(),
      {
        userName: data.userName,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        reason: data.reason || "Não informado",
      }
    );

    await this.queueEmail({
      toEmail: data.toEmail,
      toName: data.userName,
      subject: template.subject,
      body: template.body,
      emailType: "appointment_cancellation",
      appointmentId: data.appointmentId,
      userId: data.userId,
    });
  }

  /**
   * Envia notificação customizada
   */
  async sendCustomNotification(data: {
    toEmail: string;
    userName: string;
    message: string;
    appointmentId?: number;
    userId?: number;
  }): Promise<void> {
    const template = await this.getTemplate(
      "custom_notification",
      this.getDefaultNotificationTemplate(),
      {
        userName: data.userName,
        message: data.message,
      }
    );

    await this.queueEmail({
      toEmail: data.toEmail,
      toName: data.userName,
      subject: template.subject,
      body: template.body,
      emailType: "custom_notification",
      appointmentId: data.appointmentId,
      userId: data.userId,
    });
  }

  /**
   * Envia um email genérico (adiciona à fila)
   */
  async sendEmail(data: {
    to: string;
    subject: string;
    body: string;
    type?: string;
  }): Promise<void> {
    await this.queueEmail({
      toEmail: data.to,
      subject: data.subject,
      body: data.body,
      emailType: data.type || "generic",
    });
  }

  /**
   * Envia relatório diário de agendamentos para administradores
   */
  async sendDailyReport(data: {
    reportDate: string;
    appointments: Array<{
      userName: string;
      userEmail: string;
      appointmentDate: string;
      startTime: string;
      endTime: string;
      reason: string;
      phone?: string;
    }>;
  }): Promise<void> {
    try {
      const settings = await getSystemSettings();
      if (!settings) {
        console.error("[EmailService] Configurações do sistema não encontradas");
        return;
      }

      const adminEmails = settings.adminEmails.split(",").map(email => email.trim());
      
      const appointmentsList = data.appointments
        .map(
          (apt) =>
            `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${apt.userName}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${apt.userEmail}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${apt.phone || "N/A"}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${apt.startTime} - ${apt.endTime}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${apt.reason}</td>
            </tr>`
        )
        .join("");

      const body = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Diário de Agendamentos</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }
        th { background: #667eea; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📊 Relatório Diário de Agendamentos</h2>
        </div>
        <div class="content">
            <p><strong>Data do Relatório:</strong> ${data.reportDate}</p>
            <p><strong>Total de Agendamentos:</strong> ${data.appointments.length}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Horário</th>
                        <th>Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointmentsList}
                </tbody>
            </table>
        </div>
        <div class="footer">
            <p>Este é um email automático gerado pelo Sistema de Agendamento INSS.</p>
        </div>
    </div>
</body>
</html>`;

      for (const adminEmail of adminEmails) {
        await this.queueEmail({
          toEmail: adminEmail,
          subject: `Relatório Diário de Agendamentos - ${data.reportDate}`,
          body,
          emailType: "daily_report",
        });
      }

      console.log(`[EmailService] Relatório diário enviado para ${adminEmails.length} administrador(es)`);
    } catch (error) {
      console.error("[EmailService] Erro ao enviar relatório diário:", error);
      throw error;
    }
  }
}

// Exporta instância singleton
export const emailService = new EmailService();
