import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc.js";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import {
  getUserByCPF,
  createAppointment,
  getUserAppointments,
  getUpcomingAppointments,
  cancelAppointment,
  incrementAppointmentCount,
  updateLastCancellation,
  logAuditAction,
  getDb,
  updateUserPhone,
  getAppointmentsByDate,
  createUserForm,
  getUserForm,
  getUserFormsByUserId,
  getAllUserForms,
  updateUserFormStatus,
  createFormAttachment,
  getFormAttachments,
} from "./db.js";
import { eq, and, gte, lte, asc, desc, ne, sql } from "drizzle-orm";
import { users, appointments, blockedSlots, appointmentMessages, emailTemplates, userForms, formAttachments } from "../drizzle/schema.js";
import { soapAuthService } from "./services/soapAuthService.js";
import { localAuthService } from "./services/localAuthService.js";
import { appointmentValidationService } from "./services/appointmentValidationService.js";
import { emailService } from "./services/emailService.js";
import { documentService } from "./services/documentService.js";

export const appRouter = router({
  system: systemRouter,

  appointments: router({
    getPublicBlocks: publicProcedure
      .input(z.object({ 
        month: z.number(), 
        year: z.number() 
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const startDate = new Date(input.year, input.month, 1);
        const endDate = new Date(input.year, input.month + 1, 0, 23, 59, 59);

        const results = await db
          .select()
          .from(blockedSlots)
          .where(
            and(
              gte(blockedSlots.blockedDate, startDate),
              lte(blockedSlots.blockedDate, endDate)
            )
          );

        return {
          blocks: results.map(b => ({
            id: b.id,
            day: b.blockedDate.getDate(),
            reason: b.reason,
            blockType: b.blockType,
            startTime: b.startTime,
            endTime: b.endTime
          }))
        };
      }),

    getAvailableSlots: publicProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input }) => {
        return await appointmentValidationService.getAvailableSlots(input.date);
      }),

    create: protectedProcedure
      .input(z.object({
        appointmentDate: z.date(),
        startTime: z.string(),
        endTime: z.string(),
        reason: z.string(),
        phone: z.string().min(1, "Telefone é obrigatório"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const validation = await appointmentValidationService.validateAppointment(
          input.appointmentDate,
          input.startTime,
          ctx.user.id
        );

        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.message,
          });
        }

        // Atualiza telefone do usuário se necessário
        await updateUserPhone(ctx.user.id, input.phone);

        const appointmentId = await createAppointment({
          userId: ctx.user.id,
          appointmentDate: input.appointmentDate,
          startTime: input.startTime,
          endTime: input.endTime,
          reason: input.reason,
          notes: input.notes,
        });

        await incrementAppointmentCount(ctx.user.id);

        await logAuditAction({
          userId: ctx.user.id,
          action: "CREATE_APPOINTMENT",
          entityType: "appointment",
          entityId: appointmentId,
          ipAddress: ctx.req.ip,
        });

        return { success: true, id: appointmentId };
      }),

    getUpcoming: protectedProcedure.query(async ({ ctx }) => {
      const results = await getUpcomingAppointments(ctx.user.id);
      
      const formattedAppointments = results.map(apt => ({
        ...apt,
        date: apt.appointmentDate.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
        time: apt.startTime ? apt.startTime.substring(0, 5) : "--:--"
      }));

      return { appointments: formattedAppointments };
    }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

      const results = await getUserAppointments(ctx.user.id);

      const appointmentsWithDetails = await Promise.all(results.map(async (apt) => {
        // Verifica se o agendamento possui QUALQUER mensagem
        const anyMessage = await db
          .select({ id: appointmentMessages.id })
          .from(appointmentMessages)
          .where(eq(appointmentMessages.appointmentId, apt.id))
          .limit(1);
        
        return {
          ...apt,
          hasMessages: anyMessage.length > 0
        };
      }));

      return appointmentsWithDetails;
    }),

    cancel: protectedProcedure
      .input(z.object({ appointmentId: z.number(), reason: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Se não for admin, valida o tempo de antecedência
        if (ctx.user.role !== "admin") {
          const leadTimeError = await appointmentValidationService.validateCancellationLeadTime(input.appointmentId);
          if (leadTimeError) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: leadTimeError.message,
            });
          }
        }

        await cancelAppointment(input.appointmentId, input.reason);
        
        // Só atualiza o bloqueio de cancelamento se não for admin
        if (ctx.user.role !== "admin") {
          await updateLastCancellation(ctx.user.id);
        }

        await logAuditAction({
          userId: ctx.user.id,
          action: "CANCEL_APPOINTMENT",
          entityType: "appointment",
          entityId: input.appointmentId,
          details: `Motivo: ${input.reason}`,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const { maxAge, ...clearOptions } = cookieOptions;
      ctx.res.clearCookie(COOKIE_NAME, clearOptions);
      return {
        success: true,
      } as const;
    }),

    createLocalUser: adminProcedure
      .input(z.object({
        cpf: z.string().min(1, "CPF obrigatório"),
        name: z.string().min(1, "Nome obrigatório"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        role: z.enum(["user", "admin"]),
        oab: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await localAuthService.createLocalUser(input);
        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      }),

    loginWithSOAP: publicProcedure
      .input(
        z.object({
          cpf: z.string().min(1, "CPF obrigatório"),
          password: z.string().min(1, "Senha obrigatória"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Usa autenticação com fallback (SOAP -> Local)
          const authResult = await localAuthService.authenticateWithFallback(input.cpf, input.password);

          if (!authResult.success || !authResult.userData) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: authResult.message || "Credenciais inválidas",
            });
          }

          const userData = authResult.userData;
          const statusInadimplente = (userData as any).Inadimplente;

          // Só valida inadimplência se for login via SOAP (OAB)
          if (authResult.authMethod === 'soap' && statusInadimplente && statusInadimplente.trim() === 'Sim') {
              throw new TRPCError({
                  code: 'UNAUTHORIZED',
                  message: 'Acesso negado: Regularize sua situação com a OAB'
              });
          }

          let user = await getUserByCPF(userData.cpf);
          const { upsertUser } = await import("./db.js");
          
          const userPayload = {
            openId: authResult.authMethod === 'soap' ? `soap_${userData.cpf}` : `local_${userData.cpf}`,
            cpf: userData.cpf,
            oab: userData.oab,
            name: userData.nome,
            email: userData.email,
            cep: userData.cep,
            endereco: userData.endereco,
            bairro: userData.bairro,
            cidade: userData.cidade,
            estado: userData.estado,
            nomeMae: userData.nome_mae,
            nomePai: userData.nome_pai,
            rg: userData.rg,
            orgaoRg: userData.orgao_rg,
            dataExpedicaoRg: userData.data_expedicao_rg,
            loginMethod: authResult.authMethod === 'soap' ? "soap" : (user?.loginMethod || "local_admin"),
            role: user?.role, // Preserva a role se o usuário já existir
            lastSignedIn: new Date(),
          };

          await upsertUser(userPayload);
          user = await getUserByCPF(userData.cpf);

          if (!user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Erro ao criar usuário",
            });
          }

          const { sdk } = await import("./_core/sdk.js");
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name,
            expiresInMs: 365 * 24 * 60 * 60 * 1000,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: 365 * 24 * 60 * 60 * 1000,
          });

          await logAuditAction({
            userId: user.id,
            action: authResult.authMethod === 'soap' ? "LOGIN_SOAP" : "LOGIN_LOCAL_FALLBACK",
            entityType: "user",
            entityId: user.id,
            details: `Método: ${authResult.authMethod}`,
            ipAddress: ctx.req.ip,
          });

          return {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              oab: user.oab,
              role: user.role,
            },
          };
        } catch (error) {
          console.error("[Auth] Erro ao fazer login SOAP:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao processar login",
          });
        }
      }),
  }),

  documents: router({
    generateMyDocument: protectedProcedure
      .input(z.object({ 
        templateType: z.enum(['ANEXO_II', 'DECLARACAO_BOAS_PRATICAS', 'TERMO_ACEITE']) 
      }))
      .mutation(async ({ input, ctx }) => {
      try {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        const fullUser = await getUserByCPF(user.cpf);
        if (!fullUser) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });

        // Mapeia o nome do arquivo com base no template
        const filenames: Record<string, string> = {
          ANEXO_II: 'ANEXO_II_TCMS_modelo_OAB',
          DECLARACAO_BOAS_PRATICAS: 'Declaração_de_boas_práticas',
          TERMO_ACEITE: 'Termo_de_aceite_do_ACT'
        };

        const buffer = await documentService.generatePDF(input.templateType, fullUser);
        
        return {
          filename: `${filenames[input.templateType]}_${fullUser.name.replace(/\s+/g, '_')}.pdf`,
          content: buffer.toString('base64'),
          contentType: 'application/pdf'
        };
      } catch (error) {
        console.error("[Documents] Erro ao gerar documento:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar documento PDF",
        });
      }
    })
  }),

  messages: router({
    getMessages: protectedProcedure
      .input(z.object({ appointmentId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const results = await db
          .select()
          .from(appointmentMessages)
          .where(eq(appointmentMessages.appointmentId, input.appointmentId))
          .orderBy(asc(appointmentMessages.createdAt));

        return results;
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        appointmentId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const isAdmin = ctx.user.role === "admin";

        await db.insert(appointmentMessages).values({
          appointmentId: input.appointmentId,
          senderId: ctx.user.id,
          message: input.content,
          isAdmin,
          isRead: false,
        });

        return { success: true };
      }),

    hasUnreadMessages: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { hasUnread: false };

      const isAdmin = ctx.user.role === "admin";

      const results = await db
        .select({ id: appointmentMessages.id })
        .from(appointmentMessages)
        .where(
          and(
            eq(appointmentMessages.isAdmin, !isAdmin),
            eq(appointmentMessages.isRead, false),
            isAdmin 
              ? sql`1=1` 
              : eq(appointmentMessages.senderId, ctx.user.id)
          )
        )
        .limit(1);

      return { hasUnread: results.length > 0 };
    }),

    markAsRead: protectedProcedure
      .input(z.object({ appointmentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const isAdmin = ctx.user.role === "admin";

        await db
          .update(appointmentMessages)
          .set({ isRead: true })
          .where(
            and(
              eq(appointmentMessages.appointmentId, input.appointmentId),
              eq(appointmentMessages.isAdmin, !isAdmin),
              eq(appointmentMessages.isRead, false)
            )
          );

        return { success: true };
      }),
  }),

  admin: router({
    getCalendarAppointments: adminProcedure
      .input(z.object({ 
        month: z.number(), 
        year: z.number() 
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const startDate = new Date(input.year, input.month, 1);
        const endDate = new Date(input.year, input.month + 1, 0, 23, 59, 59);

        const results = await db
          .select({
            id: appointments.id,
            appointmentDate: appointments.appointmentDate,
            startTime: appointments.startTime,
            reason: appointments.reason,
            status: appointments.status,
            userName: users.name,
            userCpf: users.cpf,
            userOab: users.oab,
            userEmail: users.email,
            userPhone: users.phone,
          })
          .from(appointments)
          .leftJoin(users, eq(appointments.userId, users.id))
          .where(
            and(
              gte(appointments.appointmentDate, startDate),
              lte(appointments.appointmentDate, endDate),
              eq(appointments.status, "confirmed")
            )
          )
          .orderBy(asc(appointments.appointmentDate), asc(appointments.startTime));

        return {
          appointments: results.map(apt => ({
            ...apt,
            day: apt.appointmentDate.getDate(),
            dateFormatted: apt.appointmentDate.toLocaleDateString("pt-BR"),
          }))
        };
      }),

    getDailyAppointments: adminProcedure
      .input(z.object({ date: z.date().optional() }))
      .query(async ({ input }) => {
        const date = input.date || new Date();
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const results = await db
          .select({
            id: appointments.id,
            appointmentDate: appointments.appointmentDate,
            startTime: appointments.startTime,
            endTime: appointments.endTime,
            reason: appointments.reason,
            notes: appointments.notes,
            status: appointments.status,
            cancellationReason: appointments.cancellationReason,
            cancelledAt: appointments.cancelledAt,
            userName: users.name,
            userCpf: users.cpf,
            userOab: users.oab,
            userEmail: users.email,
            userPhone: users.phone,
            userCidade: users.cidade,
            userEstado: users.estado,
          })
          .from(appointments)
          .leftJoin(users, eq(appointments.userId, users.id))
          .where(
            and(
              gte(appointments.appointmentDate, startOfDay),
              lte(appointments.appointmentDate, endOfDay),
              eq(appointments.status, "confirmed")
            )
          )
          .orderBy(asc(appointments.startTime));

        return {
          appointments: results.map((apt) => ({
            id: apt.id,
            date: apt.appointmentDate.toLocaleDateString("pt-BR"),
            startTime: apt.startTime, // Puxa diretamente o StartTime do banco
            time: apt.startTime,      // Mantém compatibilidade com o campo 'time'
            reason: apt.reason,
            notes: apt.notes,
            status: apt.status,
            cancellationReason: apt.cancellationReason,
            cancelledAt: apt.cancelledAt?.toLocaleDateString("pt-BR"),
            userName: apt.userName || "Usuário não encontrado",
            userCpf: apt.userCpf,
            userOab: apt.userOab,
            userEmail: apt.userEmail,
            userPhone: apt.userPhone,
            userCidade: apt.userCidade,
            userEstado: apt.userEstado,
          })),
        };
      }),

    getAllAppointments: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const results = await db
          .select({
            id: appointments.id,
            appointmentDate: appointments.appointmentDate,
            startTime: appointments.startTime,
            reason: appointments.reason,
            status: appointments.status,
            userName: users.name,
          })
          .from(appointments)
          .leftJoin(users, eq(appointments.userId, users.id))
          .where(eq(appointments.status, "confirmed")) // Filtra apenas confirmados para notificações
          .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime));

        const appointmentsWithUnread = await Promise.all(results.map(async (apt) => {
          const unread = await db
            .select({ id: appointmentMessages.id })
            .from(appointmentMessages)
            .where(
              and(
                eq(appointmentMessages.appointmentId, apt.id),
                eq(appointmentMessages.isAdmin, false),
                eq(appointmentMessages.isRead, false)
              )
            )
            .limit(1);
          
          if (unread.length === 0) return null; // Se não tem mensagem não lida, ignora

          return {
            id: apt.id,
            date: apt.appointmentDate.toLocaleDateString("pt-BR"),
            time: apt.startTime,
            userName: apt.userName,
          };
        }));

        return appointmentsWithUnread.filter(Boolean);
      }),

    getBlockedSlots: adminProcedure
      .input(z.object({ 
        all: z.boolean().optional().default(true)
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Por padrão, trazemos todos os bloqueios de hoje em diante para gerenciamento
        const results = await db
          .select()
          .from(blockedSlots)
          .where(gte(blockedSlots.blockedDate, now))
          .orderBy(asc(blockedSlots.blockedDate), asc(blockedSlots.startTime));

        return results;
      }),

    createBlock: adminProcedure
      .input(z.object({
        blockedDate: z.date(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        blockType: z.enum(["full_day", "morning", "afternoon", "period", "time_slot"]),
        endDate: z.date().optional(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        if (input.blockType === "period" && input.endDate) {
          const start = new Date(input.blockedDate);
          const end = new Date(input.endDate);
          const blocks = [];
          let current = new Date(start);
          
          while (current <= end) {
            blocks.push({
              blockedDate: new Date(current),
              startTime: input.startTime || "00:00:00",
              endTime: input.endTime || "23:59:59",
              blockType: "full_day" as const,
              reason: input.reason || "Bloqueio de período",
              createdBy: ctx.user.id,
            });
            current.setDate(current.getDate() + 1);
          }
          
          if (blocks.length > 0) {
            await db.insert(blockedSlots).values(blocks);
          }
        } else {
          await db.insert(blockedSlots).values({
            blockedDate: input.blockedDate,
            startTime: input.startTime || "00:00:00",
            endTime: input.endTime || "23:59:59",
            blockType: (input.blockType === "period" || input.blockType === "morning" || input.blockType === "afternoon") ? "full_day" : input.blockType,
            reason: input.reason || "Bloqueio de agenda",
            createdBy: ctx.user.id,
          });
        }

        await logAuditAction({
          userId: ctx.user.id,
          action: "CREATE_BLOCK",
          entityType: "blocked_slot",
          details: `Bloqueio em ${input.blockedDate.toLocaleDateString("pt-BR")} (${input.blockType})`,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    deleteBlock: adminProcedure
      .input(z.object({ blockId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        await db.delete(blockedSlots).where(eq(blockedSlots.id, input.blockId));

        await logAuditAction({
          userId: ctx.user.id,
          action: "DELETE_BLOCK",
          entityType: "blocked_slot",
          entityId: input.blockId,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    sendCustomNotification: adminProcedure
      .input(z.object({
        appointmentId: z.number(),
        message: z.string().min(1, "Mensagem é obrigatória"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const appointmentData = await db
          .select({
            id: appointments.id,
            userId: appointments.userId,
            userName: users.name,
            userEmail: users.email,
          })
          .from(appointments)
          .leftJoin(users, eq(appointments.userId, users.id))
          .where(eq(appointments.id, input.appointmentId))
          .limit(1);

        if (appointmentData.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agendamento não encontrado" });
        }

        const apt = appointmentData[0];
        
        await emailService.sendCustomNotification({
          toEmail: apt.userEmail || "",
          userName: apt.userName || "Usuário",
          message: input.message,
          appointmentId: apt.id,
          userId: apt.userId || undefined
        });

        await logAuditAction({
          userId: ctx.user.id,
          action: "SEND_NOTIFICATION",
          entityType: "appointment",
          entityId: input.appointmentId,
          details: `Notificação enviada: ${input.message.substring(0, 50)}...`,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    saveEmailTemplate: adminProcedure
      .input(z.object({
        slug: z.string(),
        subject: z.string().min(1, "Assunto é obrigatório"),
        body: z.string().min(1, "Conteúdo é obrigatório"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        await db
          .update(emailTemplates)
          .set({ 
            subject: input.subject,
            body: input.body,
            updatedAt: new Date()
          })
          .where(eq(emailTemplates.slug, input.slug));

        await logAuditAction({
          userId: ctx.user.id,
          action: "UPDATE_EMAIL_TEMPLATE",
          entityType: "email_template",
          details: `Template de e-mail (${input.slug}) atualizado`,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    getAllAppointmentsWithStatus: adminProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const results = await db
          .select({
            id: appointments.id,
            appointmentDate: appointments.appointmentDate,
            startTime: appointments.startTime,
            reason: appointments.reason,
            status: appointments.status,
            userName: users.name,
          })
          .from(appointments)
          .leftJoin(users, eq(appointments.userId, users.id))
          .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime));

        const appointmentsWithDetails = await Promise.all(results.map(async (apt) => {
          // Verifica se existem mensagens não lidas para o admin (enviadas pelo usuário)
          const unread = await db
            .select({ id: appointmentMessages.id })
            .from(appointmentMessages)
            .where(
              and(
                eq(appointmentMessages.appointmentId, apt.id),
                eq(appointmentMessages.isAdmin, false),
                eq(appointmentMessages.isRead, false)
              )
            )
            .limit(1);
          
          // Verifica se o agendamento possui QUALQUER mensagem (para a aba Histórico)
          const anyMessage = await db
            .select({ id: appointmentMessages.id })
            .from(appointmentMessages)
            .where(eq(appointmentMessages.appointmentId, apt.id))
            .limit(1);
          
          return {
            ...apt,
            date: apt.appointmentDate.toLocaleDateString("pt-BR"),
            hasUnreadForAdmin: unread.length > 0,
            hasMessages: anyMessage.length > 0
          };
        }));

        return { appointments: appointmentsWithDetails };
      }),

    getSystemSettings: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

      const settings = await db.select().from(systemSettings).limit(1);
      return settings[0];
    }),

    updateSystemSettings: adminProcedure
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
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        await db.update(systemSettings).set({
          ...input,
          updatedAt: new Date(),
        });

        await logAuditAction({
          userId: ctx.user.id,
          action: "UPDATE_SYSTEM_SETTINGS",
          entityType: "system_settings",
          details: "Configurações do sistema atualizadas",
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    getEmailTemplates: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

      return await db.select().from(emailTemplates);
    }),

    getAuditLogs: adminProcedure
      .input(z.object({ limit: z.number().optional().default(50) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        const results = await db
          .select({
            id: auditLogs.id,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            details: auditLogs.details,
            createdAt: auditLogs.createdAt,
            userName: users.name,
          })
          .from(auditLogs)
          .leftJoin(users, eq(auditLogs.userId, users.id))
          .orderBy(desc(auditLogs.createdAt))
          .limit(input.limit);

        return results.map(log => ({
          ...log,
          createdAt: log.createdAt.toLocaleString("pt-BR"),
        }));
      }),

    updateStatus: adminProcedure
      .input(z.object({
        appointmentId: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });

        await db
          .update(appointments)
          .set({ 
            status: input.status,
            updatedAt: new Date()
          })
          .where(eq(appointments.id, input.appointmentId));

        await logAuditAction({
          userId: ctx.user.id,
          action: "UPDATE_APPOINTMENT_STATUS",
          entityType: "appointment",
          entityId: input.appointmentId,
          details: `Status alterado para: ${input.status}`,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),

  forms: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        cpf: z.string(),
        email: z.string(),
        oab: z.string(),
        phone: z.string().optional(),
        address: z.string().optional(),
        nacionalidade: z.string().optional(),
        rg: z.string().optional(),
        dataExpedicaoRg: z.string().optional(),
        orgaoRg: z.string().optional(),
        nomePai: z.string().optional(),
        nomeMae: z.string().optional(),
        cep: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Se um telefone foi fornecido no formulário, atualiza o cadastro permanente do usuário
        if (input.phone) {
          await updateUserPhone(ctx.user.id, input.phone);
        }

        const formId = await createUserForm({
          userId: ctx.user.id,
          ...input,
          status: "draft",
        });
        return { success: true, id: formId };
      }),

    getMine: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFormsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const form = await getUserForm(input.id);
        if (!form) throw new TRPCError({ code: "NOT_FOUND" });
        if (form.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        const attachments = await getFormAttachments(input.id);
        return { ...form, attachments };
      }),

    submit: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const form = await getUserForm(input.id);
        if (!form || form.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        await updateUserFormStatus(input.id, "submitted");
        return { success: true };
      }),

    uploadFile: protectedProcedure
      .input(z.object({
        formId: z.number(),
        fileName: z.string(),
        fileContent: z.string(), // Base64 encoded file
        fileType: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const form = await getUserForm(input.formId);
        if (!form || form.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Import node modules
        const fs = await import("fs");
        const path = await import("path");
        
        // Ensure directory exists
        const dir = path.join(process.cwd(), "server/uploads", input.formId.toString());
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Decode base64 and save to local filesystem
        const fileBuffer = Buffer.from(input.fileContent, 'base64');
        const fileName = `${Date.now()}_${input.fileName}`;
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, fileBuffer);
        
        // Build local URL
        const url = `/uploads/${input.formId}/${fileName}`;
        
        // Save attachment record with local URL
        await createFormAttachment({
          formId: input.formId,
          fileName: input.fileName,
          fileUrl: url,
          fileType: input.fileType,
        });
        
        return { success: true, url };
      }),

    addAttachment: protectedProcedure
      .input(z.object({
        formId: z.number(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const form = await getUserForm(input.formId);
        if (!form || form.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        await createFormAttachment(input);
        return { success: true };
      }),

    // Admin routes
    getAll: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const results = await db
        .select({
          id: userForms.id,
          name: userForms.name,
          cpf: userForms.cpf,
          email: userForms.email,
          oab: userForms.oab,
          status: userForms.status,
          registrationStatus: userForms.registrationStatus,
          submittedAt: userForms.submittedAt,
          createdAt: userForms.createdAt,
        })
        .from(userForms)
        .orderBy(desc(userForms.createdAt));
        
      return results;
    }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "submitted", "approved", "rejected"]),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(userForms)
          .set({ 
            status: input.status,
            rejectionReason: input.status === "rejected" ? input.rejectionReason : null,
            updatedAt: new Date()
          })
          .where(eq(userForms.id, input.id));

        // Se for rejeitado, enviar e-mail
        if (input.status === "rejected") {
          const form = await getUserForm(input.id);
          if (form) {
            await emailService.sendEmail({
              to: form.email,
              subject: "Atualização sobre seu Formulário de Cadastramento TCMS",
              body: `
                <h2>Olá, ${form.name}</h2>
                <p>Informamos que seu formulário de cadastramento foi analisado e <strong>não pôde ser aprovado</strong> neste momento.</p>
                <p><strong>Motivo da Recusa:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 10px 0;">
                  ${input.rejectionReason || "Não especificado."}
                </div>
                <p>Por favor, acesse o sistema para realizar os ajustes necessários e enviar novamente.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe OAB/SC</p>
              `,
              type: "form_rejection"
            });
          }
        }

        return { success: true };
      }),

    updateRegistrationStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        registrationStatus: z.enum(["not_registered", "registered"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        await db
          .update(userForms)
          .set({ 
            registrationStatus: input.registrationStatus,
            updatedAt: new Date()
          })
          .where(eq(userForms.id, input.id));
          
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
