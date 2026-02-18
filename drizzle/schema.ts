import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  datetime,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * USERS TABLE - Sincronizado com autenticação SOAP OAB/SC
 */
export const users = mysqlTable(
  "users",
  {
    id: int("ID").autoincrement().primaryKey(),
    openId: varchar("OPENID", { length: 64 }).notNull().unique(),
    cpf: varchar("CPF", { length: 14 }).notNull().unique(),
    oab: varchar("OAB", { length: 20 }).notNull().unique(),
    name: text("NAME").notNull(),
    email: varchar("EMAIL", { length: 320 }).notNull(),
    phone: varchar("PHONE", { length: 20 }),
    cep: varchar("CEP", { length: 10 }),
    endereco: text("ENDERECO"),
    bairro: varchar("BAIRRO", { length: 100 }),
    cidade: varchar("CIDADE", { length: 100 }),
    estado: varchar("ESTADO", { length: 2 }),
    nomeMae: text("NOMEMAE"),
    nomePai: text("NOMEPAI"),
    rg: varchar("RG", { length: 20 }),
    orgaoRg: varchar("ORGAORG", { length: 20 }),
    dataExpedicaoRg: varchar("DATAEXPEDICAORG", { length: 10 }),
    role: mysqlEnum("ROLE", ["user", "admin"]).default("user").notNull(),
    isActive: boolean("ISACTIVE").default(true).notNull(),
    loginMethod: varchar("LOGINMETHOD", { length: 64 }),
    passwordHash: varchar("PASSWORD_HASH", { length: 255 }),
    createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
    updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("LASTSIGNEDIN").defaultNow().notNull(),
  },
  (table) => ({
    cpfIdx: index("cpf_idx").on(table.cpf),
    oabIdx: index("oab_idx").on(table.oab),
    emailIdx: index("email_idx").on(table.email),
  })
);

/**
 * APPOINTMENTS TABLE
 */
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("ID").autoincrement().primaryKey(),
    userId: int("USERID").notNull(),
    appointmentDate: datetime("APPOINTMENTDATE").notNull(),
    startTime: varchar("STARTTIME", { length: 8 }).notNull(),
    endTime: varchar("ENDTIME", { length: 8 }).notNull(),
    reason: varchar("REASON", { length: 100 }).notNull(),
    notes: text("NOTES"),
    status: mysqlEnum("STATUS", ["pending", "confirmed", "completed", "cancelled", "no_show"]).default("pending").notNull(),
    cancelledAt: timestamp("CANCELLEDAT"),
    cancellationReason: text("CANCELLATIONREASON"),
    createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
    updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    appointmentDateIdx: index("appointmentDate_idx").on(table.appointmentDate),
    statusIdx: index("status_idx").on(table.status),
    // Garante que não existam dois agendamentos confirmados/pendentes no mesmo horário
    uniqueAppointmentIdx: uniqueIndex("unique_appointment_idx").on(table.appointmentDate, table.startTime),
  })
);

/**
 * BLOCKED_SLOTS TABLE
 */
export const blockedSlots = mysqlTable(
  "blocked_slots",
  {
    id: int("ID").autoincrement().primaryKey(),
    blockedDate: datetime("BLOCKEDDATE").notNull(),
    startTime: varchar("STARTTIME", { length: 8 }).notNull(),
    endTime: varchar("ENDTIME", { length: 8 }).notNull(),
    blockType: mysqlEnum("BLOCKTYPE", ["full_day", "time_slot"]).notNull(),
    reason: text("REASON").notNull(),
    createdBy: int("CREATEDBY").notNull(),
    createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
    updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
  }
);

/**
 * APPOINTMENT_LIMITS TABLE
 */
export const appointmentLimits = mysqlTable(
  "appointment_limits",
  {
    id: int("ID").autoincrement().primaryKey(),
    userId: int("USERID").notNull().unique(),
    monthlyLimit: int("MONTHLYLIMIT").default(999).notNull(),
    currentMonth: varchar("CURRENTMONTH", { length: 7 }).notNull(),
    appointmentsThisMonth: int("APPOINTMENTSTHISMONTH").default(0).notNull(),
    lastCancellationAt: timestamp("LASTCANCELLATIONAT"),
    createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
    updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
  }
);

/**
 * AUDIT_LOG TABLE
 */
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("ID").autoincrement().primaryKey(),
    userId: int("USERID"),
    action: varchar("ACTION", { length: 50 }).notNull(),
    entityType: varchar("ENTITYTYPE", { length: 50 }).notNull(),
    entityId: int("ENTITYID"),
    details: text("DETAILS"),
    ipAddress: varchar("IPADDRESS", { length: 45 }),
    createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
  }
);

/**
 * EMAIL_QUEUE TABLE
 */
export const emailQueue = mysqlTable(
  "email_queue",
  {
    id: int("ID").autoincrement().primaryKey(),
    toEmail: varchar("TOEMAIL", { length: 320 }).notNull(),
    toName: varchar("TONAME", { length: 255 }),
    subject: varchar("SUBJECT", { length: 255 }).notNull(),
    body: text("BODY").notNull(),
    emailType: varchar("EMAILTYPE", { length: 50 }).notNull(),
    appointmentId: int("APPOINTMENTID"),
    userId: int("USERID"),
    status: mysqlEnum("STATUS", ["pending", "sent", "failed"]).default("pending").notNull(),
    sentAt: timestamp("SENTAT"),
    failureReason: text("FAILUREREASON"),
    retryCount: int("RETRYCOUNT").default(0).notNull(),
    createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
    updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
  }
);

/**
 * SYSTEM_SETTINGS TABLE
 */
export const systemSettings = mysqlTable("system_settings", {
  id: int("ID").autoincrement().primaryKey(),
  workingHoursStart: varchar("WORKINGHOURSSTART", { length: 8 }).default("08:00:00").notNull(),
  workingHoursEnd: varchar("WORKINGHOURSEND", { length: 8 }).default("12:00:00").notNull(),
  appointmentDurationMinutes: int("APPOINTMENTDURATIONMINUTES").default(30).notNull(),
  monthlyLimitPerUser: int("MONTHLYLIMITPERUSER").default(999).notNull(),
  cancellationBlockingHours: int("CANCELLATIONBLOCKINGHOURS").default(2).notNull(),
  minCancellationLeadTimeHours: int("MINCANCELLATIONLEADTIMEHOURS").default(5).notNull(),
  maxAdvancedBookingDays: int("MAXADVANCEDBOOKINGDAYS").default(30).notNull(),
  blockingTimeAfterHours: varchar("BLOCKINGTIMEAFTERHOURS", { length: 8 }).default("19:00:00").notNull(),
  institutionName: varchar("INSTITUTIONNAME", { length: 255 }).default("OAB/SC").notNull(),
  institutionAddress: text("INSTITUTIONADDRESS"),
  institutionPhone: varchar("INSTITUTIONPHONE", { length: 20 }),
  senderEmail: varchar("SENDEREMAIL", { length: 320 }).notNull(),
  senderName: varchar("SENDERNAME", { length: 255 }).notNull(),
  adminEmails: text("ADMINEMAILS").notNull(),
  dailyReportTime: varchar("DAILYREPORTTIME", { length: 5 }).default("19:00").notNull(),
  dailyReportEnabled: boolean("DAILYREPORTENABLED").default(true).notNull(),
  // Configurações SMTP
  smtpHost: varchar("SMTPHOST", { length: 255 }).default("smtp.gmail.com").notNull(),
  smtpPort: int("SMTPPORT").default(587).notNull(),
  smtpSecure: boolean("SMTPSECURE").default(false).notNull(),
  smtpUser: varchar("SMTPUSER", { length: 320 }),
  smtpPassword: text("SMTPPASSWORD"),
  updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
});

/**
 * EMAIL_TEMPLATES TABLE - Modelos de email customizáveis
 */
export const emailTemplates = mysqlTable("email_templates", {
  id: int("ID").autoincrement().primaryKey(),
  slug: varchar("SLUG", { length: 50 }).notNull().unique(), // appointment_confirmation, appointment_cancellation, etc.
  name: varchar("NAME", { length: 100 }).notNull(),
  subject: varchar("SUBJECT", { length: 255 }).notNull(),
  body: text("BODY").notNull(),
  variables: text("VARIABLES"), // Descrição das variáveis disponíveis (ex: {userName}, {date})
  updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
});

/**
 * APPOINTMENT_MESSAGES TABLE - Chat entre usuário e administrador
 */
export const appointmentMessages = mysqlTable("appointment_messages", {
  id: int("ID").autoincrement().primaryKey(),
  appointmentId: int("APPOINTMENTID").notNull(),
  senderId: int("SENDERID").notNull(),
  message: text("MESSAGE").notNull(),
  isAdmin: boolean("ISADMIN").default(false).notNull(),
  isRead: boolean("ISREAD").default(false).notNull(),
  createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
}, (table) => ({
  appointmentIdx: index("appointment_idx").on(table.appointmentId),
}));

/**
 * USER_FORMS TABLE - Formulários preenchidos pelos usuários
 */
export const userForms = mysqlTable("user_forms", {
  id: int("ID").autoincrement().primaryKey(),
  userId: int("USERID").notNull(),
  // Dados extraídos/confirmados
  name: text("NAME").notNull(),
  cpf: varchar("CPF", { length: 14 }).notNull(),
  email: varchar("EMAIL", { length: 320 }).notNull(),
  oab: varchar("OAB", { length: 20 }).notNull(),
  phone: varchar("PHONE", { length: 20 }),
  address: text("ADDRESS"),
  nacionalidade: varchar("NACIONALIDADE", { length: 100 }),
  rg: varchar("RG", { length: 20 }),
  dataExpedicaoRg: varchar("DATAEXPEDICAORG", { length: 10 }),
  orgaoRg: varchar("ORGAORG", { length: 50 }),
  nomePai: text("NOMEPAI"),
  nomeMae: text("NOMEMAE"),
  cep: varchar("CEP", { length: 10 }),
  bairro: varchar("BAIRRO", { length: 100 }),
  cidade: varchar("CIDADE", { length: 100 }),
  estado: varchar("ESTADO", { length: 2 }),
  // Status do formulário
  status: mysqlEnum("STATUS", ["draft", "submitted", "approved", "rejected"]).default("draft").notNull(),
  registrationStatus: mysqlEnum("REGISTRATIONSTATUS", ["not_registered", "registered"]).default("not_registered").notNull(),
  rejectionReason: text("REJECTIONREASON"),
  submittedAt: timestamp("SUBMITTEDAT"),
  createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
  updatedAt: timestamp("UPDATEDAT").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("form_userId_idx").on(table.userId),
  statusIdx: index("form_status_idx").on(table.status),
}));

/**
 * FORM_ATTACHMENTS TABLE - Documentos anexados aos formulários
 */
export const formAttachments = mysqlTable("form_attachments", {
  id: int("ID").autoincrement().primaryKey(),
  formId: int("FORMID").notNull(),
  fileName: varchar("FILENAME", { length: 255 }).notNull(),
  fileUrl: text("FILEURL").notNull(),
  fileType: varchar("FILETYPE", { length: 50 }).notNull(), // 'signed_doc_1', 'signed_doc_2', 'signed_doc_3', etc.
  createdAt: timestamp("CREATEDAT").defaultNow().notNull(),
}, (table) => ({
  formIdIdx: index("formId_idx").on(table.formId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserForm = typeof userForms.$inferSelect;
export type InsertUserForm = typeof userForms.$inferInsert;
export type FormAttachment = typeof formAttachments.$inferSelect;
export type InsertFormAttachment = typeof formAttachments.$inferInsert;
