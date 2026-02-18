import { getDb, getSystemSettings } from "../db";
import { appointments, users } from "../../drizzle/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { emailService } from "./emailService";

export class CronService {
  /**
   * Executa a rotina de envio do relatório diário
   */
  async runDailyReport() {
    console.log("[CronService] Iniciando processamento do relatório diário...");
    
    const settings = await getSystemSettings();
    if (!settings || !settings.dailyReportEnabled) {
      console.log("[CronService] Relatório diário desabilitado nas configurações.");
      return;
    }

    const db = await getDb();
    if (!db) {
      console.error("[CronService] Banco de dados indisponível.");
      return;
    }

    // Calcula a data de amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);
    
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Busca agendamentos de amanhã
    const tomorrowAppointments = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        reason: appointments.reason,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.userId, users.id))
      .where(
        and(
          gte(appointments.appointmentDate, startOfTomorrow),
          lte(appointments.appointmentDate, endOfTomorrow),
          eq(appointments.status, "confirmed")
        )
      )
      .orderBy(asc(appointments.startTime));

    if (tomorrowAppointments.length === 0) {
      console.log("[CronService] Nenhum agendamento para amanhã. Pulando envio.");
      return;
    }

    // Envia o relatório
    await emailService.sendDailyReport({
      reportDate: tomorrow.toLocaleDateString("pt-BR"),
      appointments: tomorrowAppointments.map(apt => ({
        userName: apt.userName,
        userEmail: apt.userEmail,
        appointmentDate: apt.appointmentDate.toLocaleDateString("pt-BR"),
        startTime: apt.startTime.substring(0, 5),
        endTime: apt.endTime.substring(0, 5),
        reason: apt.reason,
        phone: apt.userPhone || undefined,
      })),
    });

    console.log(`[CronService] Relatório enviado com ${tomorrowAppointments.length} agendamentos.`);
  }

  /**
   * Verifica se é o horário de enviar o relatório
   * Chamado periodicamente (ex: a cada 15 minutos)
   */
  async checkAndRun() {
    console.log("[CronService] Executando verificações periódicas...");
    // 1. Atualiza status de "Não Compareceu" (No Show)
    try {
      const { updateNoShowStatus } = await import("../db");
      await updateNoShowStatus();
    } catch (err) {
      console.error("[CronService] Erro ao atualizar status no-show:", err);
    }

    // 2. Verifica e envia relatório diário
    const settings = await getSystemSettings();
    if (!settings || !settings.dailyReportEnabled) {
      console.log("[CronService] Relatório diário desativado ou configurações não encontradas.");
      return;
    }

    const now = new Date();
    const currentHourMin = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
    
    // Se o horário atual for igual ao configurado (considerando a janela do cron)
    if (currentHourMin === settings.dailyReportTime) {
      await this.runDailyReport();
    }
  }
}

export const cronService = new CronService();
