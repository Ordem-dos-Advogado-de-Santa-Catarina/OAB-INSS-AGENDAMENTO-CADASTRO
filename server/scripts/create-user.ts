/**
 * Script CLI para criação de usuários locais/administradores
 * Uso: npx tsx server/scripts/create-user.ts <cpf> <nome> <email> <senha> <role> [oab]
 */

import { localAuthService } from '../services/localAuthService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 5) {
    console.log('\n❌ Erro: Argumentos insuficientes.');
    console.log('\nUso correto:');
    console.log('npx tsx server/scripts/create-user.ts <cpf> <nome> <email> <senha> <role> [oab]');
    console.log('\nExemplo:');
    console.log('npx tsx server/scripts/create-user.ts "12345678900" "Admin Local" "admin@email.com" "senha123" "admin"\n');
    process.exit(1);
  }

  const [cpf, name, email, password, role, oab] = args;

  if (role !== 'admin' && role !== 'user') {
    console.log('❌ Erro: A role deve ser "admin" ou "user".');
    process.exit(1);
  }

  console.log(`\n🚀 Criando usuário ${role}: ${name} (${cpf})...`);

  try {
    const result = await localAuthService.createLocalUser({
      cpf,
      name,
      email,
      password,
      role: role as 'admin' | 'user',
      oab
    });

    if (result.success) {
      console.log('✅ Sucesso:', result.message);
    } else {
      console.log('❌ Falha:', result.message);
    }
  } catch (error: any) {
    console.error('💥 Erro crítico:', error.message);
  } finally {
    process.exit(0);
  }
}

main();
