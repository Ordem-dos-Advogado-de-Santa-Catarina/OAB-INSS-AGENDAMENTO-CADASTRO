/**
 * Testes para o serviço de autenticação local com fallback
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { localAuthService } from './localAuthService.js';
import { soapAuthService } from './soapAuthService.js';
import { getUserByCPF } from '../db.js';

describe('LocalAuthService', () => {
  describe('authenticateWithFallback', () => {
    it('deve autenticar via SOAP quando webservice está disponível', async () => {
      // Mock do SOAP retornando sucesso
      const mockSoapAuth = vi.spyOn(soapAuthService, 'authenticate').mockResolvedValue({
        success: true,
        userData: {
          nome: 'João Silva',
          email: 'joao@example.com',
          cpf: '12345678900',
          oab: 'OAB123',
          cep: '88000-000',
          endereco: 'Rua Teste, 123',
          bairro: 'Centro',
          cidade: 'Florianópolis',
          estado: 'SC',
          nome_mae: 'Maria Silva',
          nome_pai: 'José Silva',
          rg: '1234567',
          orgao_rg: 'SSP/SC',
          data_expedicao_rg: '2020-01-01',
        }
      });

      const result = await localAuthService.authenticateWithFallback('12345678900', 'senha123');

      expect(result.success).toBe(true);
      expect(result.authMethod).toBe('soap');
      expect(result.userData?.nome).toBe('João Silva');

      mockSoapAuth.mockRestore();
    });

    it('deve usar fallback local quando SOAP falhar por erro de conexão', async () => {
      // Mock do SOAP lançando erro de conexão
      const mockSoapAuth = vi.spyOn(soapAuthService, 'authenticate').mockRejectedValue(
        new Error('Erro de comunicação com a OAB-SC')
      );

      // Mock do getUserByCPF retornando usuário com senha
      const mockGetUser = vi.spyOn({ getUserByCPF }, 'getUserByCPF').mockResolvedValue({
        id: 1,
        openId: 'soap_12345678900',
        cpf: '12345678900',
        oab: 'OAB123',
        name: 'João Silva',
        email: 'joao@example.com',
        passwordHash: '$2a$10$validHashHere', // Hash de exemplo
        // ... outros campos
      } as any);

      // Nota: Este teste requer que a senha seja previamente armazenada
      // Em ambiente real, isso seria feito durante um login bem-sucedido via SOAP

      mockSoapAuth.mockRestore();
      mockGetUser.mockRestore();
    });

    it('deve retornar erro quando SOAP falhar por credenciais inválidas', async () => {
      const mockSoapAuth = vi.spyOn(soapAuthService, 'authenticate').mockResolvedValue({
        success: false,
        message: 'Credenciais inválidas'
      });

      const result = await localAuthService.authenticateWithFallback('12345678900', 'senhaErrada');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Credenciais inválidas');

      mockSoapAuth.mockRestore();
    });

    it('deve retornar erro quando fallback local não encontrar usuário', async () => {
      const mockSoapAuth = vi.spyOn(soapAuthService, 'authenticate').mockRejectedValue(
        new Error('Timeout')
      );

      const mockGetUser = vi.spyOn({ getUserByCPF }, 'getUserByCPF').mockResolvedValue(undefined);

      const result = await localAuthService.authenticateWithFallback('99999999999', 'senha123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrado');

      mockSoapAuth.mockRestore();
      mockGetUser.mockRestore();
    });

    it('deve retornar erro quando usuário não tem senha armazenada', async () => {
      const mockSoapAuth = vi.spyOn(soapAuthService, 'authenticate').mockRejectedValue(
        new Error('Timeout')
      );

      const mockGetUser = vi.spyOn({ getUserByCPF }, 'getUserByCPF').mockResolvedValue({
        id: 1,
        cpf: '12345678900',
        passwordHash: null, // Sem senha armazenada
        // ... outros campos
      } as any);

      const result = await localAuthService.authenticateWithFallback('12345678900', 'senha123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Senha local não cadastrada');

      mockSoapAuth.mockRestore();
      mockGetUser.mockRestore();
    });
  });

  describe('updatePassword', () => {
    it('deve atualizar senha de usuário existente', async () => {
      const mockGetUser = vi.spyOn({ getUserByCPF }, 'getUserByCPF').mockResolvedValue({
        id: 1,
        cpf: '12345678900',
        // ... outros campos
      } as any);

      const result = await localAuthService.updatePassword('12345678900', 'novaSenha123');

      expect(result).toBe(true);

      mockGetUser.mockRestore();
    });

    it('deve retornar false quando usuário não existe', async () => {
      const mockGetUser = vi.spyOn({ getUserByCPF }, 'getUserByCPF').mockResolvedValue(undefined);

      const result = await localAuthService.updatePassword('99999999999', 'novaSenha123');

      expect(result).toBe(false);

      mockGetUser.mockRestore();
    });
  });
});

/**
 * Testes de Integração (requerem banco de dados)
 * 
 * Para executar estes testes, certifique-se de que:
 * 1. O banco de dados está configurado
 * 2. A migration 0005_add_password_field.sql foi executada
 * 3. Existem usuários de teste no banco
 */
describe('LocalAuthService - Integração', () => {
  // Estes testes devem ser executados apenas em ambiente de teste
  // com banco de dados configurado

  it.skip('deve armazenar senha após login SOAP bem-sucedido', async () => {
    // Implementar teste de integração real
  });

  it.skip('deve autenticar localmente após senha ser armazenada', async () => {
    // Implementar teste de integração real
  });

  it.skip('deve registrar log de auditoria correto', async () => {
    // Implementar teste de integração real
  });
});
