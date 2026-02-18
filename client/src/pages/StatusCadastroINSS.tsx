import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ClipboardList, Info, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function StatusCadastroINSS() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const myFormsQuery = trpc.forms.getMyForms.useQuery(undefined, {
    enabled: !!user && user.role !== "admin"
  });

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
    navigate("/login");
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enviado</Badge>;
      case "approved": return <Badge className="bg-green-100 text-green-800 border-green-200">Aprovado</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeitado</Badge>;
      default: return <Badge variant="outline">Rascunho</Badge>;
    }
  };

  const getRegistrationStatusBadge = (status: string) => {
    switch (status) {
      case "registered": return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Cadastrado</Badge>;
      default: return <Badge variant="outline" className="text-gray-500">Não Cadastrado</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Status Cadastro INSS</h1>
          <p className="text-gray-600 mt-1">Acompanhe aqui o andamento dos seus pedidos de cadastramento.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Histórico de Formulários
              </CardTitle>
              <CardDescription>Status atualizado da análise e do registro no sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/forms/new")}>
              Novo Formulário
            </Button>
          </CardHeader>
          <CardContent>
            {myFormsQuery.isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
            ) : myFormsQuery.data && myFormsQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Data de Envio</th>
                      <th className="px-4 py-3">Status Análise</th>
                      <th className="px-4 py-3">Status Cadastro</th>
                      <th className="px-4 py-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {myFormsQuery.data.map((form) => (
                      <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">#{form.id}</td>
                        <td className="px-4 py-3">
                          {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString("pt-BR") : "N/A"}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(form.status)}</td>
                        <td className="px-4 py-3">{getRegistrationStatusBadge(form.registrationStatus)}</td>
                        <td className="px-4 py-3">
                          {form.status === "rejected" && form.rejectionReason ? (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded text-xs">
                              <Info className="h-3 w-3 flex-shrink-0" />
                              <span>{form.rejectionReason}</span>
                            </div>
                          ) : form.status === "approved" ? (
                            <span className="text-green-600 text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Aprovado com sucesso
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Aguardando análise</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Você ainda não enviou nenhum formulário.</p>
                <Button variant="link" className="text-indigo-600 mt-2" onClick={() => navigate("/forms/new")}>
                  Clique aqui para iniciar seu primeiro formulário
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
