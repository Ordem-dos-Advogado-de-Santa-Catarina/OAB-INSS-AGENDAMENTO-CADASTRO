import { beforeEach, describe, expect, it, vi } from "vitest";
import { localAuthService } from "./localAuthService.js";
import { soapAuthService } from "./soapAuthService.js";
import { getDb, getUserByCPF } from "../db.js";

vi.mock("../db.js", () => ({
  getDb: vi.fn(),
  getUserByCPF: vi.fn(),
}));

describe("LocalAuthService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getDb).mockResolvedValue({
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })) })),
    } as never);
  });

  it("autentica via SOAP quando o webservice está disponível", async () => {
    vi.spyOn(soapAuthService, "authenticate").mockResolvedValue({
      success: true,
      userData: {
        nome: "João Silva", email: "joao@example.com", cpf: "12345678900", oab: "OAB123", cep: "88000-000",
        endereco: "Rua Teste, 123", bairro: "Centro", cidade: "Florianópolis", estado: "SC", nome_mae: "Maria Silva",
        nome_pai: "José Silva", rg: "1234567", orgao_rg: "SSP/SC", data_expedicao_rg: "2020-01-01",
      },
    });
    const result = await localAuthService.authenticateWithFallback("12345678900", "senha123");
    expect(result).toMatchObject({ success: true, authMethod: "soap" });
  });

  it("usa o fallback local quando o SOAP falha por comunicação", async () => {
    vi.spyOn(soapAuthService, "authenticate").mockRejectedValue(new Error("Timeout"));
    vi.mocked(getUserByCPF).mockResolvedValue({ id: 1, cpf: "12345678900", passwordHash: null } as never);
    const result = await localAuthService.authenticateWithFallback("12345678900", "senha123");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Senha local não cadastrada");
  });

  it("retorna a mensagem de credenciais inválidas informada pelo SOAP", async () => {
    vi.spyOn(soapAuthService, "authenticate").mockResolvedValue({ success: false, message: "Credenciais inválidas" });
    const result = await localAuthService.authenticateWithFallback("12345678900", "senhaErrada");
    expect(result).toMatchObject({ success: false, message: "Credenciais inválidas" });
  });

  it("informa quando o usuário não existe no fallback local", async () => {
    vi.spyOn(soapAuthService, "authenticate").mockRejectedValue(new Error("Timeout"));
    vi.mocked(getUserByCPF).mockResolvedValue(undefined);
    const result = await localAuthService.authenticateWithFallback("99999999999", "senha123");
    expect(result.message).toContain("não encontrado");
  });

  it("atualiza a senha de usuário existente", async () => {
    vi.mocked(getUserByCPF).mockResolvedValue({ id: 1, cpf: "12345678900" } as never);
    expect(await localAuthService.updatePassword("12345678900", "novaSenha123")).toBe(true);
  });

  it("retorna false quando o usuário não existe", async () => {
    vi.mocked(getUserByCPF).mockResolvedValue(undefined);
    expect(await localAuthService.updatePassword("99999999999", "novaSenha123")).toBe(false);
  });
});
