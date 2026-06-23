
import { drizzle } from "drizzle-orm/mysql2";
import { users, appointments, blockedSlots } from "../../drizzle/schema.js";
import * as fs from 'fs';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import * as path from 'path';

/**
 * Função auxiliar para tratar datas sem sofrer com fuso horário (timezone).
 * Converte a string YYYY-MM-DD para um objeto Date ao meio-dia local para evitar retroceder um dia.
 */
function parseLocalDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  // Se for apenas data YYYY-MM-DD, adicionamos o meio-dia para evitar problemas de fuso
  if (dateStr.length === 10) {
    return new Date(`${dateStr}T12:00:00`);
  }
  // Se for data e hora YYYY-MM-DD HH:MM:SS, tratamos normalmente
  return new Date(dateStr);
}

async function migrate() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("❌ Erro: Variável de ambiente DATABASE_URL não definida.");
    process.exit(1);
  }

  console.log("🚀 Iniciando processo de migração (com correção de Timezone)...");
  const db = drizzle(DATABASE_URL);

  const jsonPath = './server/scripts/legacy_data.json';
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Erro: Arquivo de dados não encontrado em ${jsonPath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const userMap = new Map<number, number>(); // id_legado -> id_novo

  // --- 1. Migrar Usuários ---
  console.log(`\n👥 Migrando usuários (${rawData.usuarios.length} encontrados)...`);
  let usersMigrated = 0;
  let usersSkipped = 0;

  for (const legacyUser of rawData.usuarios) {
    const isCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(legacyUser.cpf_oab);
    if (!isCpf) {
      console.log(`  ⚠️ Pulando admin/inválido: ${legacyUser.cpf_oab}`);
      usersSkipped++;
      continue;
    }

    try {
      const existing = await db.select().from(users).where(eq(users.cpf, legacyUser.cpf_oab)).limit(1);
      let newUserId: number;
      if (existing.length > 0) {
        newUserId = existing[0].id;
        console.log(`  ℹ️ Usuário já existe: ${legacyUser.cpf_oab} (ID: ${newUserId})`);
      } else {
        const [result] = await db.insert(users).values({
          openId: nanoid(32),
          cpf: legacyUser.cpf_oab,
          oab: legacyUser.oab || "N/A",
          name: legacyUser.nome || "Usuário Migrado",
          email: legacyUser.email || "migrado@oab-sc.org.br",
          phone: legacyUser.telefone || "",
          role: "user",
          isActive: true,
          createdAt: parseLocalDate(legacyUser.criado_em) || new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date()
        });
        newUserId = (result as any).insertId;
        console.log(`  ✅ Inserido: ${legacyUser.cpf_oab} (Novo ID: ${newUserId})`);
      }
      userMap.set(legacyUser.id, newUserId);
      usersMigrated++;
    } catch (err) {
      console.error(`  ❌ Erro ao migrar usuário ${legacyUser.cpf_oab}:`, err);
    }
  }

  // --- 2. Migrar Bloqueios ---
  console.log(`\n🚫 Migrando bloqueios (${rawData.bloqueios.length} encontrados)...`);
  let blocksMigrated = 0;
  for (const legacyBlock of rawData.bloqueios) {
    try {
      await db.insert(blockedSlots).values({
        blockedDate: parseLocalDate(legacyBlock.data_bloqueio)!,
        startTime: legacyBlock.hora_inicio_bloqueio || "00:00:00",
        endTime: legacyBlock.hora_fim_bloqueio || "23:59:59",
        blockType: legacyBlock.tipo === 'data' ? 'full_day' : 'time_slot',
        reason: legacyBlock.motivo_bloqueio || "Bloqueio Migrado",
        createdBy: 1, 
        createdAt: parseLocalDate(legacyBlock.criado_em) || new Date(),
        updatedAt: new Date()
      });
      blocksMigrated++;
    } catch (err) {
      console.error(`  ❌ Erro ao migrar bloqueio de ${legacyBlock.data_bloqueio}:`, err);
    }
  }

  // --- 3. Migrar Agendamentos ---
  console.log(`\n📅 Migrando agendamentos (${rawData.agendamentos.length} encontrados)...`);
  let apptsMigrated = 0;
  let apptsSkipped = 0;

  for (const legacyAgend of rawData.agendamentos) {
    const newUserId = userMap.get(legacyAgend.id_usuario);
    if (!newUserId) {
      apptsSkipped++;
      continue;
    }

    let newStatus: "pending" | "confirmed" | "completed" | "cancelled" | "no_show" = "confirmed";
    if (legacyAgend.status === 'Cancelado') {
      newStatus = "cancelled";
    } else if (legacyAgend.status_atendimento === 'Atendido') {
      newStatus = "completed";
    } else if (legacyAgend.status_atendimento === 'Não Compareceu') {
      newStatus = "no_show";
    }

    try {
      await db.insert(appointments).values({
        userId: newUserId,
        appointmentDate: parseLocalDate(legacyAgend.data_agendamento)!,
        startTime: legacyAgend.hora_inicio,
        endTime: legacyAgend.hora_fim,
        reason: legacyAgend.motivo || "Atendimento",
        notes: legacyAgend.observacao || "",
        status: newStatus,
        cancelledAt: parseLocalDate(legacyAgend.data_cancelamento),
        cancellationReason: legacyAgend.motivo_cancelamento || null,
        createdAt: parseLocalDate(legacyAgend.criado_em) || new Date(),
        updatedAt: new Date()
      });
      apptsMigrated++;
    } catch (err) {
      if ((err as any).code !== 'ER_DUP_ENTRY') {
        console.error(`  ❌ Erro no agendamento ${legacyAgend.id}:`, err);
      }
    }
  }

  console.log(`\n📊 Resumo da Migração Corrigida:`);
  console.log(`- Usuários: ${usersMigrated} processados.`);
  console.log(`- Agendamentos: ${apptsMigrated} migrados com data corrigida.`);
  console.log(`- Bloqueios: ${blocksMigrated} migrados.`);
  console.log(`\n🎉 Processo concluído! Verifique as datas no sistema.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error("\n💥 Erro fatal na migração:", err);
  process.exit(1);
});
