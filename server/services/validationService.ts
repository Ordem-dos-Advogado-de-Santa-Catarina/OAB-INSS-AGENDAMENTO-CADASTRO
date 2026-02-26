/**
 * Serviço de Validação de Dados
 * Validações de CPF, telefone, email, etc.
 */

export class ValidationService {
  /**
   * Valida CPF
   */
  static isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    // Calcula primeiro dígito verificador
    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
      return false;
    }

    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
      return false;
    }

    return true;
  }

  /**
   * Valida telefone brasileiro
   */
  static isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    // Aceita telefones com 10 ou 11 dígitos
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  }

  /**
   * Valida email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Formata CPF para exibição
   */
  static formatCPF(cpf: string): string {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return cpf;
    return `${cleanCPF.substring(0, 3)}.${cleanCPF.substring(3, 6)}.${cleanCPF.substring(6, 9)}-${cleanCPF.substring(9)}`;
  }

  /**
   * Formata telefone para exibição
   */
  static formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6)}`;
    }
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`;
    }
    return phone;
  }

  /**
   * Remove caracteres especiais de CPF
   */
  static cleanCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Remove caracteres especiais de telefone
   */
  static cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }
}

export const validationService = new ValidationService();
