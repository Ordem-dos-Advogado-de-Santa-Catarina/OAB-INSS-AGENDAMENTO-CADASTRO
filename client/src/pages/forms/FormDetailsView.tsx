import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface FormData {
  id: number;
  userId: number;
  name: string;
  cpf: string;
  email: string;
  notificationEmail: string;
  oab: string;
  phone?: string;
  address?: string;
  nacionalidade?: string;
  rg?: string;
  dataExpedicaoRg?: string;
  orgaoRg?: string;
  nomePai?: string;
  nomeMae?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  registrationStatus: "not_registered" | "registered";
  rejectionReason?: string | null;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    createdAt: Date;
  }>;
}

export default function FormDetailsView() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const [form, setForm] = useState<FormData | null>(null);

  // Extrair o ID do formulário da URL
  const formId = parseInt(location.split("/").pop() || "0", 10);

  const formQuery = trpc.forms.getById.useQuery(
    { id: formId },
    {
      enabled: !!user && formId > 0,
      onSuccess: (data) => {
        setForm(data as FormData);
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao carregar formulário");
      },
    }
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading || formQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (formQuery.isError || !form) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate("/forms/status")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Formulário não encontrado</p>
                  <p className="text-sm">
                    O formulário que você está tentando visualizar não existe ou você não tem permissão para acessá-lo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            <Clock className="h-3 w-3 mr-1" />
            Rascunho
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <FileText className="h-3 w-3 mr-1" />
            Enviado
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRegistrationBadge = (status: string) => {
    switch (status) {
      case "registered":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Cadastrado
          </Badge>
        );
      case "not_registered":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Não Cadastrado
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/forms/status")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            {form.status === "draft" && (
              <Button
                onClick={() => navigate(`/forms/new?id=${form.id}`)}
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Título e Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900">
              Formulário #{form.id}
            </h1>
            {getStatusBadge(form.status)}
            {getRegistrationBadge(form.registrationStatus)}
          </div>
          <p className="text-gray-600">
            Criado em {new Date(form.createdAt).toLocaleDateString("pt-BR")}
            {form.submittedAt && (
              <>
                {" • "}
                Enviado em {new Date(form.submittedAt).toLocaleDateString("pt-BR")}
              </>
            )}
          </p>
        </div>

        {/* Alerta de Status */}
        {form.status === "rejected" && form.rejectionReason && (
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Motivo da Rejeição:</p>
              <p>{form.rejectionReason}</p>
            </AlertDescription>
          </Alert>
        )}

        {form.status === "approved" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Parabéns! Seu formulário foi aprovado pela administração.
            </AlertDescription>
          </Alert>
        )}

        {form.status === "submitted" && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Seu formulário foi enviado e está aguardando análise pela administração.
            </AlertDescription>
          </Alert>
        )}

        {form.status === "draft" && (
          <Alert className="bg-gray-50 border-gray-200 text-gray-800">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Seu formulário está em rascunho e ainda não foi enviado para análise.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados cadastrados no formulário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{form.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email Pessoal</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{form.email}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <label className="text-xs font-bold text-indigo-600 uppercase">E-mail Notificação INSS Digital</label>
                <p className="text-lg font-bold text-indigo-900 mt-1">{form.notificationEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">CPF</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{form.cpf}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">OAB</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{form.oab}</p>
              </div>
              {form.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{form.phone}</p>
                </div>
              )}
              {form.rg && (
                <div>
                  <label className="text-sm font-medium text-gray-600">RG</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{form.rg}</p>
                </div>
              )}
              {form.nacionalidade && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nacionalidade</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{form.nacionalidade}</p>
                </div>
              )}
              {form.nomePai && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome do Pai</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{form.nomePai}</p>
                </div>
              )}
              {form.nomeMae && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome da Mãe</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{form.nomeMae}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        {(form.address || form.cep || form.bairro || form.cidade || form.estado) && (
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Informações de localização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Endereço</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{form.address}</p>
                  </div>
                )}
                {form.cep && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">CEP</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{form.cep}</p>
                  </div>
                )}
                {form.bairro && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bairro</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{form.bairro}</p>
                  </div>
                )}
                {form.cidade && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cidade</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{form.cidade}</p>
                  </div>
                )}
                {form.estado && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{form.estado}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documentos Anexados */}
        {form.attachments && form.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Documentos Anexados</CardTitle>
              <CardDescription>
                {form.attachments.length} arquivo(s) anexado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {form.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {attachment.fileType} • Enviado em{" "}
                          {new Date(attachment.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = attachment.fileUrl;
                        link.download = attachment.fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex-shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sem Anexos */}
        {(!form.attachments || form.attachments.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="pt-6 pb-6 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum documento anexado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
