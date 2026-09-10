import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DocumentosEscritas() {
  const documentos = [
    {
      title: "Termo de Responsabilidade",
      description: "Documento obrigatório para requerimento de senhas no atendimento presencial.",
      path: "/documents/termo_de_responsabilidade.doc",
      fileName: "termo_de_responsabilidade.doc"
    },
    {
      title: "Termo de Representação",
      description: "Documento utilizado para representação junto ao INSS Digital.",
      path: "/documents/termo_de_representacao.doc",
      fileName: "termo_de_representacao.doc"
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Escritas Documentos</h1>
          <p className="text-gray-600 mt-1">Acesse e baixe os documentos importantes para seus processos.</p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Estes documentos são essenciais para a formalização de requerimentos e atendimento presencial. 
            Certifique-se de preenchê-los corretamente antes do envio ou apresentação.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentos.map((doc, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{doc.title}</CardTitle>
                </div>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  asChild
                  className="w-full bg-[#004a80] hover:bg-[#003366] text-white"
                >
                  <a href={doc.path} download={doc.fileName}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Documento
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-50 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Links Úteis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-sm font-medium">Lista de Cidades Atendidas</span>
              <a 
                href="https://oabsc.s3-sa-east-1.amazonaws.com/arquivo/update/331_58_5b48b6e99838a.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
              >
                Acessar <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-sm font-medium">Passo a Passo INSS Digital</span>
              <a 
                href="http://www.oab-sc.org.br/arquivo/update/331_58_5b6a1797b8846.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
              >
                Acessar <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
