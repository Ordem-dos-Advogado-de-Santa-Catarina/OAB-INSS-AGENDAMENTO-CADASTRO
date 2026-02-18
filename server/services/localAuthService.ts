/**
 * Serviço de Autenticação Local com Fallback
 * 
 * Este serviço implementa um sistema de autenticação híbrido:
 * 1. Tenta autenticar via SOAP (webservice OAB)
 * 2. Se o webservice falhar, usa autenticação local com senha armazenada
 * 3. Quando SOAP funciona, sincroniza a senha no banco de dados
 */

import bcryptjs from 'bcryptjs';
const bcrypt = (bcryptjs as any).default || bcryptjs;
import { soapAuthService, SOAPUserData } from './soapAuthService.js';
import { getUserByCPF } from '../db.js';
import { getDb } from '../db.js';
import { users } from '../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export interface LocalAuthResult {
  success: boolean;
  userData?: SOAPUserData;
  message?: string;
  authMethod?: 'soap' | 'local';
}

export class LocalAuthService {
  /**
   * Gera hash bcrypt de uma senha
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se uma senha corresponde ao hash armazenado
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('[LocalAuth] Erro ao comparar senhas:', error);
      return false;
    }
  }

  /**
   * Armazena/atualiza o hash da senha do usuário no banco
   */
  private async storePasswordHash(cpf: string, password: string): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn('[LocalAuth] Database não disponível para armazenar senha');
        return;
      }

      const passwordHash = await this.hashPassword(password);
      
      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.cpf, cpf));

      console.log(`[LocalAuth] Senha armazenada com sucesso para CPF: ${cpf}`);
    } catch (error) {
      console.error('[LocalAuth] Erro ao armazenar hash de senha:', error);
    }
  }

  /**
   * Tenta autenticação local usando senha armazenada
   */
  private async authenticateLocal(cpf: string, password: string): Promise<LocalAuthResult> {
    try {
      const user = await getUserByCPF(cpf);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado no banco de dados local'
        };
      }

      if (!user.passwordHash) {
        return {
          success: false,
          message: 'Senha local não cadastrada. Aguarde restabelecimento do webservice OAB.'
        };
      }

      const passwordValid = await this.verifyPassword(password, user.passwordHash);
      
      if (!passwordValid) {
        return {
          success: false,
          message: 'Senha incorreta'
        };
      }

      // Monta userData a partir dos dados do banco
      const userData: SOAPUserData = {
        nome: user.name,
        email: user.email,
        cep: user.cep || '',
        endereco: user.endereco || '',
        bairro: user.bairro || '',
        cidade: user.cidade || '',
        estado: user.estado || '',
        nome_mae: user.nomeMae || '',
        nome_pai: user.nomePai || '',
        cpf: user.cpf,
        rg: user.rg || '',
        oab: user.oab,
        orgao_rg: user.orgaoRg || '',
        data_expedicao_rg: user.dataExpedicaoRg || '',
      };

      console.log(`[LocalAuth] Autenticação local bem-sucedida para CPF: ${cpf}`);

      return {
        success: true,
        userData,
        authMethod: 'local'
      };

    } catch (error) {
      console.error('[LocalAuth] Erro na autenticação local:', error);
      return {
        success: false,
        message: 'Erro ao processar autenticação local'
      };
    }
  }

  /**
   * Método principal de autenticação com fallback
   * 
   * Fluxo:
   * 1. Tenta autenticar via SOAP
   * 2. Se SOAP funcionar: armazena senha e retorna sucesso
   * 3. Se SOAP falhar: tenta autenticação local
   */
  async authenticateWithFallback(cpf: string, password: string): Promise<LocalAuthResult> {
    console.log(`[LocalAuth] Iniciando autenticação para CPF: ${cpf}`);

    // Primeira tentativa: SOAP
    try {
      const soapResult = await soapAuthService.authenticate(cpf, password);

      if (soapResult.success && soapResult.userData) {
        console.log('[LocalAuth] Autenticação SOAP bem-sucedida');
        
        // Armazena a senha para uso futuro (fallback)
        await this.storePasswordHash(cpf, password);

        return {
          success: true,
          userData: soapResult.userData,
          authMethod: 'soap'
        };
      } else {
        // SOAP retornou erro de credenciais - tentar fallback local (pode ser um usuário local_admin)
        console.log('[LocalAuth] SOAP falhou, tentando autenticação local...');
        const localResult = await this.authenticateLocal(cpf, password);
        
        if (localResult.success) {
          return localResult;
        }

        return {
          success: false,
          message: soapResult.message || 'Usuário ou senha incorretos'
        };
      }

    } catch (error: any) {
      // Erro de comunicação com SOAP - tentar fallback local
      console.warn('[LocalAuth] Erro de comunicação com SOAP, tentando autenticação local:', error.message);
      
      const localResult = await this.authenticateLocal(cpf, password);
      
      if (localResult.success) {
        console.log('[LocalAuth] Fallback local bem-sucedido');
        return localResult;
      } else {
        return {
          success: false,
          message: `Webservice OAB indisponível e autenticação local falhou: ${localResult.message}`
        };
      }
    }
  }

  /**
   * Atualiza a senha de um usuário (apenas para uso administrativo)
   */
  async updatePassword(cpf: string, newPassword: string): Promise<boolean> {
    try {
      const user = await getUserByCPF(cpf);
      if (!user) {
        console.error('[LocalAuth] Usuário não encontrado para atualização de senha');
        return false;
      }

      await this.storePasswordHash(cpf, newPassword);
      return true;
    } catch (error) {
      console.error('[LocalAuth] Erro ao atualizar senha:', error);
      return false;
    }
  }

  /**
   * Cria um novo usuário local (para administradores ou acesso sem OAB)
   */
  async createLocalUser(data: {
    cpf: string;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    oab?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database não disponível');

      // Verifica se já existe
      const existing = await getUserByCPF(data.cpf);
      if (existing) {
        return { success: false, message: 'Usuário com este CPF já existe' };
      }

      const passwordHash = await this.hashPassword(data.password);
      
      const { upsertUser } = await import("../db.js");
      
      await upsertUser({
        openId: `local_${data.cpf}`,
        cpf: data.cpf,
        name: data.name,
        email: data.email,
        oab: data.oab || `LOCAL_${data.cpf.substring(0, 5)}`,
        role: data.role,
        loginMethod: 'local_admin',
        passwordHash: passwordHash,
        lastSignedIn: new Date(),
      } as any);

      return { success: true, message: 'Usuário local criado com sucesso' };
    } catch (error: any) {
      console.error('[LocalAuth] Erro ao criar usuário local:', error);
      return { success: false, message: error.message || 'Erro interno ao criar usuário' };
    }
  }
}

export const localAuthService = new LocalAuthService();
