import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getSystemSettings, updateSystemSettings } from "../db";

export const systemRouter = router({
  getSettings: adminProcedure.query(async () => {
    return await getSystemSettings();
  }),

  updateSettings: adminProcedure
    .input(z.object({
      workingHoursStart: z.string(),
      workingHoursEnd: z.string(),
      appointmentDurationMinutes: z.number(),
      monthlyLimitPerUser: z.number(),
      cancellationBlockingHours: z.number(),
      minCancellationLeadTimeHours: z.number(),
      maxAdvancedBookingDays: z.number(),
      blockingTimeAfterHours: z.string(),
      institutionName: z.string(),
      institutionAddress: z.string().optional(),
      institutionPhone: z.string().optional(),
      senderEmail: z.string().email(),
      senderName: z.string(),
      adminEmails: z.string(),
      dailyReportTime: z.string(),
      dailyReportEnabled: z.boolean(),
      smtpHost: z.string(),
      smtpPort: z.number(),
      smtpSecure: z.boolean(),
      smtpUser: z.string().optional(),
      smtpPassword: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await updateSystemSettings(input);
      return { success: true };
    }),

  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
