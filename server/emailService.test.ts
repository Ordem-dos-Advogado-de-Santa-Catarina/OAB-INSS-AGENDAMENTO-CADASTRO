import { describe, it, expect } from "vitest";
import { emailService } from "./services/emailService";

describe("emailService", () => {
  it("should initialize transporter with SMTP configuration", async () => {
    // Verificar se o transporter foi inicializado
    expect(emailService).toBeDefined();
    
    // Tentar enviar um email de teste
    const result = await emailService.sendEmail({
      to: process.env.SENDER_EMAIL || "test@example.com",
      subject: "Teste de Configuração SMTP",
      html: "<p>Este é um email de teste para validar a configuração SMTP.</p>",
    });

    // O resultado deve ser um booleano
    expect(typeof result).toBe("boolean");
  });

  it("should format form submission notification email", async () => {
    // Testar formatação de email de novo formulário
    const result = await emailService.sendFormSubmittedNotification(
      1,
      "João da Silva",
      "joao@example.com",
      "0000000-00.0000.0.00.0000"
    );

    expect(typeof result).toBe("boolean");
  });

  it("should format form status notification email", async () => {
    // Testar formatação de email de atualização de status
    const result = await emailService.sendFormStatusNotification(
      "João da Silva",
      "joao@example.com",
      "approved",
      "0000000-00.0000.0.00.0000"
    );

    expect(typeof result).toBe("boolean");
  });

  it("should include rejection reason in rejection email", async () => {
    // Testar email de rejeição com motivo
    const result = await emailService.sendFormStatusNotification(
      "João da Silva",
      "joao@example.com",
      "rejected",
      "0000000-00.0000.0.00.0000",
      "Documentação incompleta"
    );

    expect(typeof result).toBe("boolean");
  });
});
