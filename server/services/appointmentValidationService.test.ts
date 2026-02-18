import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppointmentValidationService } from "./appointmentValidationService";
import * as db from "../db";

// Mock do módulo db
vi.mock("../db", () => ({
  getAppointmentsByDate: vi.fn(),
  getBlockedSlotsForDate: vi.fn(),
  getOrCreateAppointmentLimit: vi.fn(),
  getUserAppointments: vi.fn(),
  getSystemSettings: vi.fn(),
}));

describe("AppointmentValidationService", () => {
  let service: AppointmentValidationService;

  beforeEach(() => {
    service = new AppointmentValidationService();
    vi.clearAllMocks();
  });

  describe("validateDateTime", () => {
    it("deve rejeitar agendamento no dia atual", async () => {
      const today = new Date();
      today.setHours(10, 0, 0);

      const result = await service.validateDateTime(today, "09:00:00", 1);

      expect(result).not.toBeNull();
      expect(result?.code).toBe("PAST_DATE");
    });

    it("deve rejeitar agendamento em fins de semana", async () => {
      // Próximo domingo
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + ((0 - sunday.getDay() + 7) % 7 || 7));
      sunday.setHours(10, 0, 0);

      const result = await service.validateDateTime(sunday, "09:00:00", 1);

      expect(result).not.toBeNull();
      expect(result?.code).toBe("WEEKEND");
    });

    it("deve rejeitar horário fora do expediente", async () => {
      vi.mocked(db.getSystemSettings).mockResolvedValue({
        id: 1,
        workingHoursStart: "08:00:00",
        workingHoursEnd: "12:00:00",
        appointmentDurationMinutes: 30,
        monthlyLimitPerUser: 2,
        cancellationBlockingHours: 2,
        maxAdvancedBookingDays: 30,
        blockingTimeAfterHours: "19:00:00",
        institutionName: "OAB/SC",
        institutionAddress: null,
        institutionPhone: null,
        senderEmail: "noreply@oabsc.org.br",
        senderName: "OAB/SC",
        adminEmails: "[]",
        updatedAt: new Date(),
      } as any);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0);

      // Horário fora do expediente (13:00)
      const result = await service.validateDateTime(tomorrow, "13:00:00", 1);

      expect(result).not.toBeNull();
      expect(result?.code).toBe("OUTSIDE_WORKING_HOURS");
    });

    it("deve aceitar horário válido", async () => {
      vi.mocked(db.getSystemSettings).mockResolvedValue({
        id: 1,
        workingHoursStart: "08:00:00",
        workingHoursEnd: "12:00:00",
        appointmentDurationMinutes: 30,
        monthlyLimitPerUser: 2,
        cancellationBlockingHours: 2,
        maxAdvancedBookingDays: 30,
        blockingTimeAfterHours: "19:00:00",
        institutionName: "OAB/SC",
        institutionAddress: null,
        institutionPhone: null,
        senderEmail: "noreply@oabsc.org.br",
        senderName: "OAB/SC",
        adminEmails: "[]",
        updatedAt: new Date(),
      } as any);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0);

      // Horário válido (09:00)
      const result = await service.validateDateTime(tomorrow, "09:00:00", 1);

      expect(result).toBeNull();
    });
  });

  describe("validateMonthlyLimit", () => {
    it("deve rejeitar quando limite mensal foi atingido", async () => {
      vi.mocked(db.getOrCreateAppointmentLimit).mockResolvedValue({
        id: 1,
        userId: 1,
        monthlyLimit: 2,
        currentMonth: "2026-01",
        appointmentsThisMonth: 2,
        lastCancellationAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.getSystemSettings).mockResolvedValue({
        id: 1,
        workingHoursStart: "08:00:00",
        workingHoursEnd: "12:00:00",
        appointmentDurationMinutes: 30,
        monthlyLimitPerUser: 2,
        cancellationBlockingHours: 2,
        maxAdvancedBookingDays: 30,
        blockingTimeAfterHours: "19:00:00",
        institutionName: "OAB/SC",
        institutionAddress: null,
        institutionPhone: null,
        senderEmail: "noreply@oabsc.org.br",
        senderName: "OAB/SC",
        adminEmails: "[]",
        updatedAt: new Date(),
      } as any);

      const result = await service.validateMonthlyLimit(1);

      expect(result).not.toBeNull();
      expect(result?.code).toBe("MONTHLY_LIMIT_EXCEEDED");
    });

    it("deve aceitar quando limite mensal não foi atingido", async () => {
      vi.mocked(db.getOrCreateAppointmentLimit).mockResolvedValue({
        id: 1,
        userId: 1,
        monthlyLimit: 2,
        currentMonth: "2026-01",
        appointmentsThisMonth: 1,
        lastCancellationAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.getSystemSettings).mockResolvedValue({
        id: 1,
        workingHoursStart: "08:00:00",
        workingHoursEnd: "12:00:00",
        appointmentDurationMinutes: 30,
        monthlyLimitPerUser: 2,
        cancellationBlockingHours: 2,
        maxAdvancedBookingDays: 30,
        blockingTimeAfterHours: "19:00:00",
        institutionName: "OAB/SC",
        institutionAddress: null,
        institutionPhone: null,
        senderEmail: "noreply@oabsc.org.br",
        senderName: "OAB/SC",
        adminEmails: "[]",
        updatedAt: new Date(),
      } as any);

      const result = await service.validateMonthlyLimit(1);

      expect(result).toBeNull();
    });
  });

  describe("validateCancellationBlock", () => {
    it("deve bloquear agendamento dentro de 2 horas após cancelamento", async () => {
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 1); // 1 hora atrás

      vi.mocked(db.getOrCreateAppointmentLimit).mockResolvedValue({
        id: 1,
        userId: 1,
        monthlyLimit: 2,
        currentMonth: "2026-01",
        appointmentsThisMonth: 0,
        lastCancellationAt: twoHoursAgo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.getSystemSettings).mockResolvedValue({
        id: 1,
        workingHoursStart: "08:00:00",
        workingHoursEnd: "12:00:00",
        appointmentDurationMinutes: 30,
        monthlyLimitPerUser: 2,
        cancellationBlockingHours: 2,
        maxAdvancedBookingDays: 30,
        blockingTimeAfterHours: "19:00:00",
        institutionName: "OAB/SC",
        institutionAddress: null,
        institutionPhone: null,
        senderEmail: "noreply@oabsc.org.br",
        senderName: "OAB/SC",
        adminEmails: "[]",
        updatedAt: new Date(),
      } as any);

      const result = await service.validateCancellationBlock(1);

      expect(result).not.toBeNull();
      expect(result?.code).toBe("CANCELLATION_BLOCK");
    });

    it("deve permitir agendamento após 2 horas do cancelamento", async () => {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

      vi.mocked(db.getOrCreateAppointmentLimit).mockResolvedValue({
        id: 1,
        userId: 1,
        monthlyLimit: 2,
        currentMonth: "2026-01",
        appointmentsThisMonth: 0,
        lastCancellationAt: threeHoursAgo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(db.getSystemSettings).mockResolvedValue({
        id: 1,
        workingHoursStart: "08:00:00",
        workingHoursEnd: "12:00:00",
        appointmentDurationMinutes: 30,
        monthlyLimitPerUser: 2,
        cancellationBlockingHours: 2,
        maxAdvancedBookingDays: 30,
        blockingTimeAfterHours: "19:00:00",
        institutionName: "OAB/SC",
        institutionAddress: null,
        institutionPhone: null,
        senderEmail: "noreply@oabsc.org.br",
        senderName: "OAB/SC",
        adminEmails: "[]",
        updatedAt: new Date(),
      } as any);

      const result = await service.validateCancellationBlock(1);

      expect(result).toBeNull();
    });
  });

  describe("calculateEndTime", () => {
    it("deve calcular corretamente a hora de término", () => {
      const endTime = service.calculateEndTime("09:00:00", 30);
      expect(endTime).toBe("09:30:00");
    });

    it("deve calcular corretamente com duração maior", () => {
      const endTime = service.calculateEndTime("10:45:00", 60);
      expect(endTime).toBe("11:45:00");
    });
  });
});
