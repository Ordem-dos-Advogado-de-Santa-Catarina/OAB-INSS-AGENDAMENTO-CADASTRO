import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle2, Loader2, Upload, Download, AlertCircle, ExternalLink, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

type TemplateType = 'ANEXO_II' | 'DECLARACAO_BOAS_PRATICAS' | 'TERMO_ACEITE';

export default function UserForm() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    oab: "",
    phone: "",
    address: "",
    nacionalidade: "Brasileiro(a)",
    rg: "",
    dataExpedicaoRg: "",
    orgaoRg: "",
    nomePai: "",
    nomeMae: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  const [step, setStep] = useState(1); // 1: Confirmar Dados, 2: Gerar/Assinar, 3: Anexar/Enviar
  const [attachments, setAttachments] = useState<{file: File, type: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries e Mutations
  const createFormMutation = trpc.forms.create.useMutation();
  const uploadFileMutation = trpc.forms.uploadFile.useMutation();
  const submitFormMutation = trpc.forms.submit.useMutation();
  const generateDocMutation = trpc.documents.generateMyDocument.useMutation();

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        cpf: user.cpf || "",
        email: user.email || "",
        oab: user.oab || "",
        phone: user.phone ? formatPhone(user.phone) : "",
        address: (user as any).endereco || "",
        nacionalidade: (user as any).nacionalidade || "Brasileiro(a)",
        rg: (user as any).rg || "",
        dataExpedicaoRg: (user as any).dataExpedicaoRg || "",
        orgaoRg: (user as any).orgaoRg || "",
        nomePai: (user as any).nomePai || "",
        nomeMae: (user as any).nomeMae || "",
        cep: (user as any).cep || "",
        bairro: (user as any).bairro || "",
        cidade: (user as any).cidade || "",
        estado: (user as any).estado || ""
      });
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleGenerateDoc = async (templateType: TemplateType) => {
    try {
      const data = await generateDocMutation.mutateAsync({ templateType });
      const byteCharacters = atob(data.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.contentType });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Documento gerado com sucesso!`);
    } catch (error) {
      toast.error("Erro ao gerar documento");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachments(prev => {
        const filtered = prev.filter(a => a.type !== type);
        return [...filtered, { file, type }];
      });
      toast.success(`Arquivo selecionado`);
    }
  };

  const handleSubmit = async () => {
    console.log("Iniciando submissão do formulário...");
    console.log("Arquivos anexados:", attachments.length);
    
    if (attachments.length < 3) {
      toast.error("Por favor, anexe os 3 documentos assinados");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Criar o formulário
      console.log("Passo 1: Criando registro do formulário...");
      const form = await createFormMutation.mutateAsync(formData);
      const formId = form.id;
      console.log("Formulário criado com ID:", formId);

      // 2. Fazer upload real dos arquivos
      console.log("Passo 2: Iniciando upload dos arquivos...");
      for (const att of attachments) {
        console.log(`Processando arquivo: ${att.file.name} (${att.type})`);
        
        // Converter arquivo para base64
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            if (!base64) {
              reject(new Error("Falha ao converter arquivo para Base64"));
              return;
            }
            resolve(base64);
          };
          reader.onerror = () => reject(new Error("Erro na leitura do arquivo"));
          reader.readAsDataURL(att.file);
        });

        console.log(`Enviando para o servidor: ${att.file.name}...`);
        
        // Upload do arquivo para o servidor local usando a mutation correta
        const uploadResult = await uploadFileMutation.mutateAsync({
          formId,
          fileName: att.file.name,
          fileContent,
          fileType: att.type,
          contentType: att.file.type || 'application/pdf'
        });
        
        console.log(`Resposta do servidor para ${att.file.name}:`, uploadResult);
      }

      // 3. Finalizar envio
      console.log("Passo 3: Finalizando envio do formulário...");
      await submitFormMutation.mutateAsync({ id: formId });
      
      console.log("Sucesso total!");
      toast.success("Formulário enviado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("ERRO DETALHADO NO ENVIO:", error);
      toast.error(`Erro ao enviar: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documents = [
    { id: 'ANEXO_II' as TemplateType, title: 'ANEXO II TCMS - Modelo OAB', description: 'Documento principal de solicitação' },
    { id: 'DECLARACAO_BOAS_PRATICAS' as TemplateType, title: 'Declaração de Boas Práticas', description: 'Termo de conduta e segurança' },
    { id: 'TERMO_ACEITE' as TemplateType, title: 'Termo de Aceite do ACT', description: 'Aceitação dos termos do acordo' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Formulário de Cadastramento TCMS</h1>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className={step >= 1 ? "text-indigo-600" : ""}>1. Dados</span>
            <span>→</span>
            <span className={step >= 2 ? "text-indigo-600" : ""}>2. Documentos</span>
            <span>→</span>
            <span className={step >= 3 ? "text-indigo-600" : ""}>3. Envio</span>
          </div>
        </div>

        {/* Texto Informativo */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardContent className="pt-6 text-sm text-gray-700 space-y-4 leading-relaxed">
            <p className="font-semibold text-base">Bem vindo(a),</p>
            
            <p>Você está prestes a dar entrada na solicitação do seu cadastro na plataforma do <strong>INSS Digital</strong>. Nesta primeira etapa você acessa o sistema com o login e senha que possui junto a OAB/SC. Ao fim do processo, receberá um e-mail do próprio INSS com um novo login e senha da plataforma.</p>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 font-medium">
                Fique atento: É imprescindível que após imprimir e assinar o seu requerimento, antes de anexá-lo aos documentos da solicitação, também seja assinado por duas testemunhas. Sem esse reconhecimento, o documento não pode ser utilizado para abertura do processo junto ao INSS.
              </AlertDescription>
            </Alert>

            <p>Na plataforma do INSS Digital, você terá acesso ao requerimento de serviços junto à previdência para parte das cidades Catarinenses. Neste primeiro momento apenas requerimentos de segurados destas localidades estão disponíveis. <a href="https://oabsc.s3-sa-east-1.amazonaws.com/arquivo/update/331_58_5b48b6e99838a.pdf" className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1">Confira a lista aqui <ExternalLink className="h-3 w-3" /></a>.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-600" /> 
                  <a href="#" target="_blank" className="hover:text-indigo-600 transition-colors">Está com dúvidas?</a>
                </p>
                <div className="space-x-3">
                  <a href="http://www.oab-sc.org.br/arquivo/update/331_58_5b6a1797b8846.pdf" className="text-indigo-600 hover:underline">Veja aqui o passo a passo</a>
                  <span>ou</span>
                  <a href="http://www.oab-sc.org.br/arquivo/videoinss.mp4" className="text-indigo-600 hover:underline">acesse o vídeo tutorial</a>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="font-semibold mb-1">Documentos Importantes</p>
                <div className="space-x-3">
                  <a href="https://oabsc.s3.sa-east-1.amazonaws.com/arquivo/update/331_58_5aa92e9445237.doc" className="text-indigo-600 hover:underline">Termo de Responsabilidade</a>
                  <span>e</span>
                  <a href="https://oabsc.s3.sa-east-1.amazonaws.com/arquivo/update/termoderepresentacao.doc" className="text-indigo-600 hover:underline">Termo de Representação</a>
                </div>
              </div>
            </div>

            <p>Caso não lembre a senha ou a mesma expirou acesse o link <a href="https://acesso.dataprev.gov.br/clientes/?action=form-sendToken" target="_blank" className="text-indigo-600 hover:underline break-all">https://acesso.dataprev.gov.br/clientes/?action=form-sendToken</a>, informar no campo e-mail o mesmo cadastrado no sistema do INSS.</p>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="font-bold text-indigo-900 mb-2">Para expedição de SENHAS no Atendimento Presencial trazer EM ARQUIVO PDF no Pen Drive:</p>
              <ul className="list-disc list-inside space-y-1 text-indigo-800">
                <li>Termo de Responsabilidade ou Representação;</li>
                <li>Procuração;</li>
                <li>RG do Cliente;</li>
                <li>Credencial do Advogado(a).</li>
              </ul>
              <p className="mt-3 text-indigo-900">Depois de recebido a senha da DATAPREV acessar o link <a href="https://atendimento.inss.gov.br/" target="_blank" className="font-bold underline">https://atendimento.inss.gov.br/</a></p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a href="https://www.gov.br/inss/pt-br/acesso-a-informacao/avisos-sobre-sistemas" className="text-indigo-600 hover:underline flex items-center gap-1 text-xs font-medium">Certidões de Indisponibilidade <ExternalLink className="h-3 w-3" /></a>
              <a href="https://oabsc.s3.sa-east-1.amazonaws.com/arquivo/update/331_58_62e3f3476da38.pdf" className="text-indigo-600 hover:underline flex items-center gap-1 text-xs font-medium">Manual de Boas Práticas e Segurança <ExternalLink className="h-3 w-3" /></a>
            </div>

            <p className="text-red-600 font-bold uppercase text-center pt-2">
              IMPRESCINDÍVEL levar pendrive para o atendimento presencial na Seccional, tanto para juntada de documentos quanto para retirar relatórios!
            </p>
          </CardContent>
        </Card>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmação de Dados</CardTitle>
              <CardDescription>Verifique se as informações extraídas do sistema estão corretas ou ajuste-as se necessário.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Linha 1 */}
                <div className="space-y-2">
                  <Label htmlFor="name">NOME</Label>
                  <Input id="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-MAIL</Label>
                  <Input id="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nacionalidade">NACIONALIDADE</Label>
                  <Input id="nacionalidade" value={formData.nacionalidade} onChange={handleInputChange} />
                </div>

                {/* Linha 2 */}
                <div className="space-y-2">
                  <Label htmlFor="oab">OAB</Label>
                  <Input id="oab" value={formData.oab} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={formData.cpf} readOnly className="bg-gray-50" />
                </div>

                {/* Linha 3 */}
                <div className="space-y-2">
                  <Label htmlFor="rg">IDENTIDADE (RG)</Label>
                  <Input id="rg" value={formData.rg} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataExpedicaoRg">DATA DE EXPEDIÇÃO</Label>
                  <Input id="dataExpedicaoRg" value={formData.dataExpedicaoRg} onChange={handleInputChange} placeholder="AAAA-MM-DD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgaoRg">LOCAL DE EXPEDIÇÃO (ÓRGÃO)</Label>
                  <Input id="orgaoRg" value={formData.orgaoRg} onChange={handleInputChange} />
                </div>

                {/* Linha 4 */}
                <div className="space-y-2 md:col-span-1.5">
                  <Label htmlFor="nomePai">NOME DO PAI</Label>
                  <Input id="nomePai" value={formData.nomePai} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 md:col-span-1.5">
                  <Label htmlFor="nomeMae">NOME DA MÃE</Label>
                  <Input id="nomeMae" value={formData.nomeMae} onChange={handleInputChange} />
                </div>

                {/* Linha 5 */}
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" value={formData.cep} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">ENDEREÇO COMPLETO</Label>
                  <Input id="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">BAIRRO</Label>
                  <Input id="bairro" value={formData.bairro} onChange={handleInputChange} />
                </div>

                {/* Linha 6 */}
                <div className="space-y-2">
                  <Label htmlFor="estado">ESTADO (SIGLA)</Label>
                  <Input id="estado" value={formData.estado} onChange={handleInputChange} maxLength={2} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cidade">CIDADE</Label>
                  <Input id="cidade" value={formData.cidade} onChange={handleInputChange} />
                </div>

                {/* Campo Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">TELEFONE DE CONTATO</Label>
                  <Input id="phone" value={formData.phone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700">
                  Próximo Passo: Documentos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Geração de Documentos</CardTitle>
              <CardDescription>Baixe os 3 documentos abaixo, assine-os e prepare-os para anexo no próximo passo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-indigo-600" />
                      <div>
                        <p className="font-semibold">{doc.title}</p>
                        <p className="text-xs text-gray-500">{doc.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleGenerateDoc(doc.id)} disabled={generateDocMutation.isPending}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700">
                  Já assinei, quero anexar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Anexar Documentos Assinados</CardTitle>
              <CardDescription>Envie os 3 documentos que você baixou e assinou.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {documents.map((doc, idx) => (
                  <div key={doc.id} className="space-y-2">
                    <Label>{doc.title} (Assinado)</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, `signed_doc_${idx + 1}`)}
                        accept=".pdf"
                      />
                      {attachments.some(a => a.type === `signed_doc_${idx + 1}`) && (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs">
                  Ao clicar em enviar, suas informações e documentos serão encaminhados para análise da administração.
                </AlertDescription>
              </Alert>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={attachments.length < 3 || isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Finalizar e Enviar Formulário
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
