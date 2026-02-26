import { describe, it, expect } from "vitest";
import { SOAPAuthService } from "./soapAuthService";

describe("SOAPAuthService", () => {
  const service = new SOAPAuthService();

  describe("CPF Formatting", () => {
    it("should format CPF with dots and dash", () => {
      // Acessar método privado através de reflexão para testes
      const formatCPF = (service as any).formatCPF.bind(service);
      
      const formatted = formatCPF("11144477735");
      expect(formatted).toBe("111.444.777-35");
    });

    it("should handle CPF already formatted", () => {
      const formatCPF = (service as any).formatCPF.bind(service);
      
      const formatted = formatCPF("111.444.777-35");
      expect(formatted).toBe("111.444.777-35");
    });

    it("should handle empty CPF", () => {
      const formatCPF = (service as any).formatCPF.bind(service);
      
      const formatted = formatCPF("");
      expect(formatted).toBe("");
    });

    it("should handle invalid CPF length", () => {
      const formatCPF = (service as any).formatCPF.bind(service);
      
      const formatted = formatCPF("123");
      expect(formatted).toBe("123");
    });
  });
});
