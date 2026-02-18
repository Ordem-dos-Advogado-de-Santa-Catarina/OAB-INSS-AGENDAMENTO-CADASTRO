/**
 * Serviço de Validações de Agendamento
 * 
 * Centraliza todas as regras de negócio para validação de agendamentos
 */

import {
  getDb,
  getAppointmentsByDate,
  getBlockedSlotsForDate,
  getOrCreateAppointmentLimit,
  getUserAppointments,
  getSystemSettings,
} from "../db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { appointments } from "../../drizzle/schema";

export interface ValidationError {
  valid: false;
  message: string;
  code: string;
}

export interface ValidationSuccess {
  valid: true;
  availableSlots: string[];
}

export type ValidationResult = ValidationError | ValidationSuccess;

export class AppointmentValidationService {
  /**
   * Valida se uma data/hora é válida para agendamento
   */
  async validateDateTime(
    appointmentDate: Date,
    startTime: string,
    userId: number
  ): Promise<ValidationError | null> {
    // Validação 1: Não permite agendamento no dia atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDateOnly = new Date(appointmentDate);
    appointmentDateOnly.setHours(0, 0, 0, 0);

    if (appointmentDateOnly.getTime() <= today.getTime()) {
      return {
        valid: false,
        message: "Não é permitido agendar para o dia atual ou datas passadas",
        code: "PAST_DATE",
      };
    }

    // Validação 2: Não permite fins de semana
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        valid: false,
        message: "Agendamentos não são permitidos nos fins de semana",
        code: "WEEKEND",
      };
    }

    // Validação 3: Valida horário de expediente
    const settings = await getSystemSettings();
    const workStart = settings?.workingHoursStart || "08:00:00";
    const workEnd = settings?.workingHoursEnd || "12:00:00";

    if (startTime < workStart || startTime >= workEnd) {
      return {
        valid: false,
        message: `Horários disponíveis: ${workStart} às ${workEnd}`,
        code: "OUTSIDE_WORKING_HOURS",
      };
    }

    // Validação 4: Não permite agendamento após 19h para o dia seguinte
    const blockingTime = settings?.blockingTimeAfterHours || "19:00:00";
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    if (currentTime >= blockingTime) {
      const tomorrowOnly = new Date();
      tomorrowOnly.setDate(tomorrowOnly.getDate() + 1);
      tomorrowOnly.setHours(0, 0, 0, 0);

      if (appointmentDateOnly.getTime() === tomorrowOnly.getTime()) {
        return {
          valid: false,
          message: "Agendamentos para o dia seguinte não são permitidos após 19h",
          code: "AFTER_HOURS_NEXT_DAY",
        };
      }
    }

    return null;
  }

  /**
   * Valida limite mensal de agendamentos
   * Regra: Considera apenas agendamentos confirmados ou atendidos no mês da data solicitada.
   */
  async validateMonthlyLimit(userId: number, targetDate: Date): Promise<ValidationError | null> {
    const db = await getDb();
    if (!db) return null;

    // Define o início e fim do mês baseado na data do agendamento solicitado
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Busca todos os agendamentos do usuário no mês da data solicitada
    const monthAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, userId),
          gte(appointments.appointmentDate, startOfMonth),
          lte(appointments.appointmentDate, endOfMonth)
        )
      );

    // Conta agendamentos confirmados e atendidos (limite total do mês)
    const relevantAppointments = monthAppointments.filter(
      apt => apt.status === "confirmed" || apt.status === "completed"
    ).length;
    
    const settings = await getSystemSettings();
    const monthlyLimit = settings?.monthlyLimitPerUser || 2;

    if (relevantAppointments >= monthlyLimit) {
      // Regra Especial: Se atingiu o limite do mês, verifica se a nova data é pelo menos 30 dias após o último agendamento
      const allUserAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.userId, userId),
            sql`${appointments.status} IN ('confirmed', 'completed')`
          )
        )
        .orderBy(sql`${appointments.appointmentDate} DESC`)
        .limit(1);

      if (allUserAppointments.length > 0) {
        const lastAptDate = new Date(allUserAppointments[0].appointmentDate);
        const diffTime = targetDate.getTime() - lastAptDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
          const availableDate = new Date(lastAptDate);
          availableDate.setDate(availableDate.getDate() + 30);
          
          return {
            valid: false,
            message: `Você já atingiu o limite mensal. Para um novo agendamento, escolha uma data a partir de ${availableDate.toLocaleDateString("pt-BR")} (30 dias após seu último agendamento).`,
            code: "MONTHLY_LIMIT_EXCEEDED_WITH_QUARANTINE",
          };
        }
        
        // Se passou dos 30 dias, permite o agendamento mesmo que tecnicamente "estoure" o limite do mês civil
        return null;
      }

      return {
        valid: false,
        message: `Você já atingiu o limite de ${monthlyLimit} agendamentos este mês.`,
        code: "MONTHLY_LIMIT_EXCEEDED",
      };
    }

    return null;
  }

  /**
   * Valida bloqueio de 2 horas após cancelamento
   */
  async validateCancellationBlock(userId: number): Promise<ValidationError | null> {
    const limit = await getOrCreateAppointmentLimit(userId);
    const settings = await getSystemSettings();
    const blockingHours = settings?.cancellationBlockingHours || 2;

    if (limit.lastCancellationAt) {
      const now = new Date();
      const timeSinceCancellation = (now.getTime() - limit.lastCancellationAt.getTime()) / (1000 * 60 * 60);

      if (timeSinceCancellation < blockingHours) {
        const remainingMinutes = Math.ceil((blockingHours - timeSinceCancellation) * 60);
        return {
          valid: false,
          message: `Você precisa aguardar ${remainingMinutes} minutos antes de fazer um novo agendamento`,
          code: "CANCELLATION_BLOCK",
        };
      }
    }

    return null;
  }

  /**
   * Obtém horários disponíveis para uma data específica
   */
  async getAvailableSlots(appointmentDate: Date): Promise<{ slots: string[], isFullDayBlocked: boolean, blockReason?: string }> {
    const settings = await getSystemSettings();
    const workStart = settings?.workingHoursStart || "08:00:00";
    const workEnd = settings?.workingHoursEnd || "12:00:00";
    const durationMinutes = settings?.appointmentDurationMinutes || 30;

    // Converte horas em minutos
    const [startHour, startMin] = workStart.split(":").map(Number);
    const [endHour, endMin] = workEnd.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    // Gera slots disponíveis
    const slots: string[] = [];
    for (let i = startTotalMinutes; i + durationMinutes <= endTotalMinutes; i += durationMinutes) {
      const hour = Math.floor(i / 60);
      const min = i % 60;
      slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`);
    }

    // Remove slots bloqueados
    const blockedSlots = await getBlockedSlotsForDate(appointmentDate);
    const bookedAppointments = await getAppointmentsByDate(appointmentDate);

    const fullDayBlock = blockedSlots.find(b => b.blockType === "full_day");

    const availableSlots = slots.filter((slot) => {
      // Verifica bloqueios
      const isBlocked = blockedSlots.some((blocked) => {
        if (blocked.blockType === "full_day") {
          return true;
        }
        return slot >= blocked.startTime && slot < blocked.endTime;
      });

      if (isBlocked) return false;

      // Verifica agendamentos já existentes
      const isBooked = bookedAppointments.some(
        (apt) => apt.startTime === slot
      );

      return !isBooked;
    });

    return {
      slots: availableSlots,
      isFullDayBlocked: !!fullDayBlock,
      blockReason: fullDayBlock?.reason || undefined
    };
  }

  /**
   * Valida se um slot está disponível
   */
  async isSlotAvailable(appointmentDate: Date, startTime: string): Promise<boolean> {
    const { slots } = await this.getAvailableSlots(appointmentDate);
    return slots.includes(startTime);
  }

  /**
   * Realiza validação completa de um agendamento
   */
  async validateAppointment(
    appointmentDate: Date,
    startTime: string,
    userId: number
  ): Promise<ValidationResult> {
    // Validação de data/hora
    const dateTimeError = await this.validateDateTime(appointmentDate, startTime, userId);
    if (dateTimeError) {
      return dateTimeError;
    }

    // Validação de limite mensal
    const monthlyError = await this.validateMonthlyLimit(userId, appointmentDate);
    if (monthlyError) {
      return monthlyError;
    }

    // Validação de bloqueio de cancelamento
    const cancellationError = await this.validateCancellationBlock(userId);
    if (cancellationError) {
      return cancellationError;
    }

    // Validação de disponibilidade do slot
    const isAvailable = await this.isSlotAvailable(appointmentDate, startTime);
    if (!isAvailable) {
      return {
        valid: false,
        message: "Este horário não está mais disponível",
        code: "SLOT_NOT_AVAILABLE",
      };
    }

    // Obtém slots disponíveis para retorno
    const { slots } = await this.getAvailableSlots(appointmentDate);

    return {
      valid: true,
      availableSlots: slots,
    };
  }

  /**
   * Calcula hora de término do agendamento
   */
  calculateEndTime(startTime: string, durationMinutes: number = 30): string {
    const [hour, min, sec] = startTime.split(":").map(Number);
    const totalMinutes = hour * 60 + min + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMin = totalMinutes % 60;

    return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  /**
   * Valida se o cancelamento está dentro do prazo permitido (12 horas de antecedência)
   */
  async validateCancellationLeadTime(appointmentId: number): Promise<ValidationError | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select({
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
      })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (result.length === 0) {
      return {
        valid: false,
        message: "Agendamento não encontrado",
        code: "NOT_FOUND",
      };
    }

    const apt = result[0];
    const [hours, minutes] = apt.startTime.split(":").map(Number);
    
    const appointmentDateTime = new Date(apt.appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffInMilliseconds = appointmentDateTime.getTime() - now.getTime();
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    const minLeadTime = 12; // Regra solicitada: 12 horas

    if (diffInHours < minLeadTime) {
      return {
        valid: false,
        message: `O cancelamento só é permitido com no mínimo ${minLeadTime} horas de antecedência.`,
        code: "CANCELLATION_LEAD_TIME_EXCEEDED",
      };
    }

    return null;
  }
}

// Exporta instância singleton
export const appointmentValidationService = new AppointmentValidationService();
