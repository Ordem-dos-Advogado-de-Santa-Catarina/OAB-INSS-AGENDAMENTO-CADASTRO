import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Eye, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  submitted: "Em análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export default function MyForms() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: forms, isLoading, error } = trpc.forms.getMine.useQuery(undefined, { enabled: !!user });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9212a]">Área do advogado</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Meus formulários</h1>
            <p className="mt-1 text-slate-600">Acompanhe suas solicitações de cadastro e atualização.</p>
          </div>
          <Button onClick={() => navigate("/forms/new")} className="bg-[#063b66] hover:bg-[#052f52]"><Plus className="mr-2 h-4 w-4" />Novo formulário</Button>
        </div>

        {isLoading ? (
          <Card><CardContent className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#063b66]" /></CardContent></Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50"><CardContent className="py-8 text-center text-red-700">Não foi possível carregar seus formulários.</CardContent></Card>
        ) : !forms || forms.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-16 text-center"><FileText className="mb-4 h-10 w-10 text-slate-300" /><p className="font-medium text-slate-700">Você ainda não possui formulários.</p><p className="mt-1 text-sm text-slate-500">Comece um novo cadastro para acompanhar seu andamento aqui.</p><Button onClick={() => navigate("/forms/new")} className="mt-5">Criar primeiro formulário</Button></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <Card key={form.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div><CardTitle className="text-lg">{form.name}</CardTitle><p className="mt-1 text-sm text-slate-500">{form.formType === "tcms_update" ? "Atualização TCMS" : "Cadastro INSS"} · #{form.id}</p></div>
                  <Badge className={statusColors[form.status] ?? "bg-slate-100 text-slate-700"}>{statusLabels[form.status] ?? form.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 text-sm sm:grid-cols-3"><div><p className="text-slate-500">CPF</p><p className="font-medium text-slate-800">{form.cpf}</p></div><div><p className="text-slate-500">OAB</p><p className="font-medium text-slate-800">{form.oab}</p></div><div><p className="text-slate-500">Enviado em</p><p className="font-medium text-slate-800">{form.submittedAt ? new Date(form.submittedAt).toLocaleDateString("pt-BR") : "Ainda não enviado"}</p></div></div>
                  <Button variant="outline" size="sm" className="mt-5" onClick={() => navigate(`/forms/${form.id}`)}><Eye className="mr-2 h-4 w-4" />Ver detalhes</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
