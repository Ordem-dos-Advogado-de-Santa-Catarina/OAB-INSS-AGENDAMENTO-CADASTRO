import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type TemplateType = 'ANEXO_II' | 'DECLARACAO_BOAS_PRATICAS' | 'TERMO_ACEITE';

export class DocumentService {
  private templates: Record<TemplateType, string>;
  private tempDir: string;

  constructor() {
    this.templates = {
      ANEXO_II: path.resolve(process.cwd(), 'server/templates/ANEXO_II_TCMS_modelo_OAB.odt'),
      DECLARACAO_BOAS_PRATICAS: path.resolve(process.cwd(), 'server/templates/boaspraticas.odt'),
      TERMO_ACEITE: path.resolve(process.cwd(), 'server/templates/Termo_de_aceite_do_ACT.odt')
    };
    this.tempDir = path.resolve(process.cwd(), 'temp_docs');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async generatePDF(type: TemplateType, userData: any): Promise<Buffer> {
    const timestamp = Date.now();
    const templatePath = this.templates[type];
    const tempOdtPath = path.join(this.tempDir, `${type}_${timestamp}.odt`);
    const outputPdfPath = path.join(this.tempDir, `${type}_${timestamp}.pdf`);

    try {
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template não encontrado em: ${templatePath}`);
      }

      fs.copyFileSync(templatePath, tempOdtPath);
      await this.fillOdtVariables(tempOdtPath, userData);
      
      // Converter para PDF usando LibreOffice
      await execAsync(`soffice --headless --convert-to pdf --outdir ${this.tempDir} ${tempOdtPath}`);
      
      if (!fs.existsSync(outputPdfPath)) {
        throw new Error("Falha na conversão para PDF: Arquivo de saída não gerado.");
      }

      const pdfBuffer = fs.readFileSync(outputPdfPath);
      this.cleanup(tempOdtPath, outputPdfPath);
      return pdfBuffer;
    } catch (error) {
      console.error(`[DocumentService] Erro ao gerar PDF para ${type}:`, error);
      this.cleanup(tempOdtPath, outputPdfPath);
      throw error;
    }
  }

  private async fillOdtVariables(odtPath: string, userData: any) {
    const unzipDir = `${odtPath}_extracted`;
    const contentXmlPath = path.join(unzipDir, 'content.xml');
    
    try {
      await execAsync(`unzip -d ${unzipDir} ${odtPath} content.xml`);
      let content = fs.readFileSync(contentXmlPath, 'utf8');

      const dataExpedicao = this.formatDateToBR(userData.dataExpedicaoRg || userData.data_expedicao_rg);
      const dataAtual = new Date();
      const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

      const mapping: Record<string, string> = {
        'onshow.tbsboxNome': userData.name || userData.nome || '',
        'onshow.tbsboxEmail': userData.email || '',
        'onshow.tbsboxNacionalidade': userData.nacionalidade || 'Brasileiro(a)',
        'onshow.tbsboxOab': userData.oab || '',
        'onshow.tbsboxOAB': userData.oab || '',
        'onshow.tbsboxCpf': userData.cpf || '',
        'onshow.tbsboxIdentidade': userData.rg || '',
        'onshow.tbsboxRg': userData.rg || '',
        'onshow.tbsboxDataExpedicao': dataExpedicao,
        'onshow.tbsboxLocalExpedicao': userData.orgaoRg || userData.orgao_rg || '',
        'onshow.tbsboxNomePai': userData.nomePai || userData.nome_pai || '',
        'onshow.tbsboxNomeMae': userData.nomeMae || userData.nome_mae || '',
        'onshow.tbsboxCep': userData.cep || '',
        'onshow.tbsboxEndereco': userData.address || userData.endereco || '',
        'onshow.tbsboxBairro': userData.bairro || '',
        'onshow.tbsboxEstado': (userData.estado || '').toUpperCase(),
        'onshow.tbsboxCidade': userData.cidade || '',
        'onshow.tbsboxTelefone': userData.phone || userData.telefone || '',
        'onshow.tbsSeccional': userData.estado || 'SC',
        'onshow.tbsCidadeUF': `${userData.cidade || ''}/${(userData.estado || '').toUpperCase()}`,
        'onshow.tbsDia': dataAtual.getDate().toString(),
        'onshow.tbsMes': meses[dataAtual.getMonth()],
        'onshow.tbsAno': dataAtual.getFullYear().toString(),
        'onshow.tbsboxDataAtual': dataAtual.toLocaleDateString('pt-BR'),
      };

      // Substituição direta e segura (Sem RegExp complexo para evitar SyntaxError)
      for (const [key, value] of Object.entries(mapping)) {
        const escapedValue = this.escapeXml(String(value));
        const bracketKey = `[${key}]`;
        const curlyKey = `{${key}}`;
        
        // Substituição de string global simples
        content = content.split(bracketKey).join(escapedValue);
        content = content.split(curlyKey).join(escapedValue);
      }

      // Correção especial para o prefixo "email" vs "mail" que o usuário solicitou
      for (const [key, value] of Object.entries(mapping)) {
        if (key === 'onshow.tbsboxEmail') {
          const val = this.escapeXml(String(value));
          content = content.split(`email${val}`).join(`mail${val}`);
        }
      }

      fs.writeFileSync(contentXmlPath, content);
      await execAsync(`cd ${unzipDir} && zip -u ${odtPath} content.xml`);
      
    } catch (err) {
      console.error("[DocumentService] Erro ao preencher variáveis ODT:", err);
      throw err;
    } finally {
      if (fs.existsSync(unzipDir)) {
        await execAsync(`rm -rf ${unzipDir}`);
      }
    }
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&"']/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return c;
      }
    });
  }

  private formatDateToBR(dateStr: string): string {
    if (!dateStr) return '';
    if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(dateStr)) {
      return dateStr.replace(/-/g, '/');
    }
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }
    return dateStr;
  }

  private cleanup(...files: string[]) {
    for (const file of files) {
      if (fs.existsSync(file)) {
        try { fs.unlinkSync(file); } catch (e) {}
      }
    }
  }
}

export const documentService = new DocumentService();
