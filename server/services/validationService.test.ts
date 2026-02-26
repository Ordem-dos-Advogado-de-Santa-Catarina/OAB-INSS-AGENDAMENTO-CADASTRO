import { describe, it, expect } from "vitest";
import { ValidationService } from "./validationService";

describe("ValidationService", () => {
  describe("CPF Validation", () => {
    it("should validate a correct CPF", () => {
      const validCPF = "11144477735"; // Valid CPF
      expect(ValidationService.isValidCPF(validCPF)).toBe(true);
    });

    it("should reject invalid CPF with wrong length", () => {
      expect(ValidationService.isValidCPF("123")).toBe(false);
    });

    it("should reject CPF with all same digits", () => {
      expect(ValidationService.isValidCPF("11111111111")).toBe(false);
    });

    it("should format CPF correctly", () => {
      const formatted = ValidationService.formatCPF("11144477735");
      expect(formatted).toBe("111.444.777-35");
    });

    it("should clean CPF removing special characters", () => {
      const cleaned = ValidationService.cleanCPF("111.444.777-35");
      expect(cleaned).toBe("11144477735");
    });
  });

  describe("Phone Validation", () => {
    it("should validate a 10-digit phone", () => {
      expect(ValidationService.isValidPhone("1133334444")).toBe(true);
    });

    it("should validate an 11-digit phone", () => {
      expect(ValidationService.isValidPhone("11933334444")).toBe(true);
    });

    it("should reject invalid phone length", () => {
      expect(ValidationService.isValidPhone("123")).toBe(false);
    });

    it("should format 10-digit phone correctly", () => {
      const formatted = ValidationService.formatPhone("1133334444");
      expect(formatted).toBe("(11) 3333-4444");
    });

    it("should format 11-digit phone correctly", () => {
      const formatted = ValidationService.formatPhone("11933334444");
      expect(formatted).toBe("(11) 93333-4444");
    });

    it("should clean phone removing special characters", () => {
      const cleaned = ValidationService.cleanPhone("(11) 93333-4444");
      expect(cleaned).toBe("11933334444");
    });
  });

  describe("Email Validation", () => {
    it("should validate a correct email", () => {
      expect(ValidationService.isValidEmail("test@example.com")).toBe(true);
    });

    it("should reject email without @", () => {
      expect(ValidationService.isValidEmail("testexample.com")).toBe(false);
    });

    it("should reject email without domain", () => {
      expect(ValidationService.isValidEmail("test@")).toBe(false);
    });

    it("should reject email without local part", () => {
      expect(ValidationService.isValidEmail("@example.com")).toBe(false);
    });
  });
});
