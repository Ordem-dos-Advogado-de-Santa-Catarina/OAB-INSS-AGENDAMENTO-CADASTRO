import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FormData {
  id: number;
  name: string;
  cpf: string;
  email: string;
  oab: string;
  formType: "initial" | "tcms_update";
  description?: string | null;
  status: "draft" | "submitted" | "approved" | "rejected";
  registrationStatus: "not_registered" | "registered";
  rejectionReason?: string | null;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function FormStatus() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [expandedFormId, setExpandedFormId] = useState<number | null>(null);

  const formsQuery = trpc.forms.getMine.useQuery(undefined, {
    enabled: !!user && user.role !== "admin",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading) {
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

  const forms = (formsQuery.data || []) as FormData[];

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

  const getStatusDescription = (status: string): string => {
    switch (status) {
      case "draft":
        return "Seu formulário está em rascunho e ainda não foi enviado para análise.";
      case "submitted":
        return "Seu formulário foi enviado e está aguardando análise pela administração.";
      case "approved":
        return "Parabéns! Seu formulário foi aprovado pela administração.";
      case "rejected":
        return "Seu formulário foi rejeitado. Verifique o motivo abaixo e envie novamente.";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "submitted":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Status Cadastro INSS</h1>
            <p className="text-gray-600 mt-1">Acompanhe o status de seus cadastros INSS TCMS</p>
          </div>
          <Button
            onClick={() => navigate("/forms/new")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Novo Formulário
          </Button>
        </div>

        {/* Empty State */}
        {forms.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum cadastro encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Você ainda não enviou nenhum cadastro. Clique no botão abaixo para começar.
              </p>
              <Button
                onClick={() => navigate("/forms/new")}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Criar Novo Formulário
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Forms List */}
        {forms.length > 0 && (
          <div className="space-y-4">
            {forms.map((form) => (
              <Card key={form.id} className="overflow-hidden">
                <Collapsible
                  open={expandedFormId === form.id}
                  onOpenChange={(open) => setExpandedFormId(open ? form.id : null)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full">
                      <CardHeader className="pb-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 text-left">
                            <div className="mt-1">
                              {getStatusIcon(form.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <CardTitle className="text-lg">
                                  Formulário #{form.id}
                                </CardTitle>
                                {getStatusBadge(form.status)}
                                {getRegistrationBadge(form.registrationStatus)}
                              </div>
                              <CardDescription className="text-sm">
                                <span className="font-medium text-gray-700">OAB:</span> {form.oab} •
                                <span className="font-medium text-gray-700 ml-2">CPF:</span> {form.cpf}
                              </CardDescription>
                              <p className="text-xs text-gray-500 mt-2">
                                Criado em {new Date(form.createdAt).toLocaleDateString("pt-BR")}
                                {form.submittedAt && (
                                  <>
                                    {" • "}
                                    Enviado em {new Date(form.submittedAt).toLocaleDateString("pt-BR")}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {expandedFormId === form.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 space-y-4">
                      {/* Status Description */}
                      <Alert className={`${form.status === "approved"
                          ? "bg-green-50 border-green-200 text-green-800"
                          : form.status === "rejected"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : form.status === "submitted"
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : "bg-gray-50 border-gray-200 text-gray-800"
                        }`}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {getStatusDescription(form.status)}
                        </AlertDescription>
                      </Alert>

                      {/* Rejection Reason */}
                      {form.status === "rejected" && form.rejectionReason && (
                        <div className="bg-white border border-red-200 rounded-lg p-4">
                          <h4 className="font-semibold text-red-900 mb-2">Motivo da Rejeição:</h4>
                          <p className="text-red-800 text-sm">{form.rejectionReason}</p>
                        </div>
                      )}

                      {/* Form Details */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900">Informações do Formulário</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Nome:</span>
                            <p className="font-medium text-gray-900">{form.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium text-gray-900">{form.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">OAB:</span>
                            <p className="font-medium text-gray-900">{form.oab}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">CPF:</span>
                            <p className="font-medium text-gray-900">{form.cpf}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {form.status === "draft" && (
                          <Button
                            onClick={() => navigate(`/forms/new?id=${form.id}`)}
                            variant="outline"
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Formulário
                          </Button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Legend */}
        {forms.length > 0 && (
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Legenda de Status do Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Rascunho</p>
                    <p className="text-gray-600">Cadastro em edição, ainda não enviado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Enviado</p>
                    <p className="text-gray-600">Aguardando análise da administração</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Aprovado</p>
                    <p className="text-gray-600">Cadastro aprovado com sucesso</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Rejeitado</p>
                    <p className="text-gray-600">Revise o motivo e envie novamente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
