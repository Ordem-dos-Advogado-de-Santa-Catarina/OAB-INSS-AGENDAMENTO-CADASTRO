/**
 * Serviço de Autenticação SOAP com OAB/SC - Versão Corrigida (XML Root + Inadimplente)
 */

import soapRequest from 'easy-soap-request';
import { parseStringPromise } from 'xml2js';

export interface SOAPUserData {
  nome: string;
  email: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  nome_mae: string;
  nome_pai: string;
  cpf: string;
  rg: string;
  oab: string;
  orgao_rg: string;
  data_expedicao_rg: string;
  // Campo adicionado para controle no routers.ts
  Inadimplente?: string; 
}

interface SOAPAuthResponse {
  success: boolean;
  userData?: SOAPUserData;
  message?: string;
}

export class SOAPAuthService {
  private wsdlUrl: string = 'https://servicos.oab-sc.org.br/WSAutenticar/WSAutenticar.asmx';

  async authenticate(usuario: string, senha: string): Promise<SOAPAuthResponse> {
    try {
      if (!usuario || !senha) {
        return { success: false, message: "Usuário e senha são obrigatórios." };
      }

      console.log(`[SOAPAuth] Enviando para OAB: ${usuario}`);

      const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/Autenticar',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Autenticar xmlns="http://tempuri.org/">
      <Usuario>${usuario}</Usuario>
      <Senha>${senha}</Senha>
    </Autenticar>
  </soap:Body>
</soap:Envelope>`;

      const { response } = await soapRequest({
        url: this.wsdlUrl,
        headers,
        xml,
        timeout: 20000
      });

      const { body } = response;
      const parsedXml = await parseStringPromise(body);

      const envelope = parsedXml['soap:Envelope'] || parsedXml['soap:envelope'] || parsedXml['Envelope'];
      const soapBody = envelope['soap:Body'] || envelope['soap:body'] || envelope['Body'];
      const authResponse = soapBody[0]['AutenticarResponse'];
      const resultEncoded = authResponse[0]['AutenticarResult'][0];

      const decodedXmlString = resultEncoded
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      console.log("[SOAPAuth] Resposta decodificada:", decodedXmlString);

      const userXml = await parseStringPromise(decodedXmlString);

      // --- CORREÇÃO PRINCIPAL AQUI ---
      // Verifica se existe uma tag raiz <XML> e entra nela se necessário
      const root = userXml.XML ? userXml.XML : userXml;

      // Pega o status do local correto
      const status = root.Status ? root.Status[0] : (root.Cadastro && root.Cadastro[0].Status ? root.Cadastro[0].Status[0] : null);

      console.log(`[SOAPAuth] Status identificado: ${status}`);

      if (status === 'OK') {
        const cadastro = root.Cadastro ? root.Cadastro[0] : null;

        if (!cadastro) {
           return { success: false, message: "XML inválido: Tag Cadastro não encontrada." };
        }

        let endereco = cadastro.Logradouro ? cadastro.Logradouro[0] : '';
        if (cadastro.Numero && cadastro.Numero[0] !== '0' && cadastro.Numero[0] !== '') {
          endereco += `, ${cadastro.Numero[0]}`;
        }
        if (cadastro.Complemento && cadastro.Complemento[0]) {
          endereco += ` - ${cadastro.Complemento[0]}`;
        }

        const userData: SOAPUserData = {
          nome: cadastro.Nome ? cadastro.Nome[0] : '',
          email: cadastro.EMail ? cadastro.EMail[0] : '',
          cep: cadastro.CEP ? cadastro.CEP[0] : '',
          endereco: endereco,
          bairro: cadastro.Bairro ? cadastro.Bairro[0] : '',
          cidade: cadastro.Municipio ? cadastro.Municipio[0] : '',
          estado: cadastro.Estado ? cadastro.Estado[0] : '',
          nome_mae: cadastro.NomeMae ? cadastro.NomeMae[0] : '',
          nome_pai: cadastro.NomePai ? cadastro.NomePai[0] : '',
          cpf: cadastro.CPFCNPJ ? cadastro.CPFCNPJ[0] : '',
          rg: cadastro.RG ? cadastro.RG[0] : '',
          oab: cadastro.RegistroConselho ? cadastro.RegistroConselho[0] : '',
          orgao_rg: cadastro.OrgaoEmissorRG ? cadastro.OrgaoEmissorRG[0] : '',
          data_expedicao_rg: cadastro.DataEmissaoRG ? this.formatDate(cadastro.DataEmissaoRG[0]) : '',
          // Campo mapeado para validação
          Inadimplente: cadastro.Inadimplente ? cadastro.Inadimplente[0] : 'Não', 
        };

        return { success: true, userData };
      }

      // RETORNAR A MENSAGEM EXATA DO SERVIDOR
      return {
        success: false,
        message: status || "Falha na autenticação (Status desconhecido)"
      };

    } catch (error) {
      console.error("[SOAPAuth] Erro Crítico:", error);
      return { success: false, message: "Erro de comunicação com a OAB-SC." };
    }
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }
}

export const soapAuthService = new SOAPAuthService();