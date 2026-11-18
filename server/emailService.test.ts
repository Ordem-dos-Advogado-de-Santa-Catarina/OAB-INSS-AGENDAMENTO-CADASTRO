import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailService } from "./services/emailService";

describe("emailService", () => {
  beforeEach(() => {
    vi.spyOn(emailService, "queueEmail").mockResolvedValue(undefined);
  });

  it("deve aceitar e enfileirar um email HTML", async () => {
    const result = await emailService.sendEmail({
      to: process.env.SENDER_EMAIL || "test@example.com",
      subject: "Teste de configuração",
      html: "<p>Teste</p>",
    });
    expect(result).toBe(true);
    expect(emailService.queueEmail).toHaveBeenCalled();
  });

  it("deve formatar a notificação de envio de formulário", async () => {
    const result = await emailService.sendFormSubmittedNotification(1, "João da Silva", "joao@example.com", "0000000-00.0000.0.00.0000");
    expect(result).toBe(true);
  });

  it("deve formatar a notificação de aprovação", async () => {
    const result = await emailService.sendFormStatusNotification("João da Silva", "joao@example.com", "approved", "0000000-00.0000.0.00.0000");
    expect(result).toBe(true);
  });

  it("deve incluir o motivo em uma notificação de rejeição", async () => {
    const result = await emailService.sendFormStatusNotification("João da Silva", "joao@example.com", "rejected", "0000000-00.0000.0.00.0000", "Documentação incompleta");
    expect(result).toBe(true);
  });
});
