import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileText, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

const statusLabels: Record<string, string> = { draft: "Rascunho", submitted: "Em análise", approved: "Aprovado", rejected: "Rejeitado" };
const statusColors: Record<string, string> = { draft: "bg-slate-100 text-slate-700", submitted: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };

type FormStatus = "draft" | "submitted" | "approved" | "rejected";

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState<{ id: number; name: string; cpf: string; email: string; oab: string; status: FormStatus; formType: string; reason: string | null; submittedAt: Date | null } | null>(null);
  const [newStatus, setNewStatus] = useState<FormStatus>("submitted");
  const [rejectionReason, setRejectionReason] = useState("");
  const formsQuery = trpc.forms.getAll.useQuery();
  const updateStatusMutation = trpc.forms.updateStatus.useMutation({ onSuccess: () => { void formsQuery.refetch(); setSelectedForm(null); setRejectionReason(""); } });

  const filteredForms = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return formsQuery.data ?? [];
    return (formsQuery.data ?? []).filter((form) => [form.name, form.cpf, form.email, form.oab].some((value) => value.toLowerCase().includes(term)));
  }, [formsQuery.data, searchTerm]);

  const handleUpdateStatus = () => {
    if (!selectedForm) return;
    updateStatusMutation.mutate({ id: selectedForm.id, status: newStatus, rejectionReason: rejectionReason || undefined });
  };

  if (formsQuery.isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#063b66]" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-8 sm:p-8"><div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9212a]">Gestão administrativa</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Cadastros INSS e TCMS</h1><p className="mt-1 text-slate-600">Analise e atualize as solicitações recebidas.</p></div><Button variant="outline" onClick={() => void formsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Atualizar</Button></div>
      <Card><CardContent className="p-4"><div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Buscar por nome, CPF, OAB ou email..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div></CardContent></Card>
      {formsQuery.error ? <Card className="border-red-200 bg-red-50"><CardContent className="py-8 text-center text-red-700">Não foi possível carregar os formulários.</CardContent></Card> : filteredForms.length === 0 ? <Card><CardContent className="flex flex-col items-center py-16 text-center"><FileText className="mb-4 h-10 w-10 text-slate-300" /><p className="font-medium text-slate-700">Nenhum formulário encontrado.</p></CardContent></Card> : <div className="space-y-4">
        {filteredForms.map((form) => <Card key={form.id} className="transition-shadow hover:shadow-md"><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle className="text-lg">{form.name}</CardTitle><p className="mt-1 text-sm text-slate-500">{form.formType === "tcms_update" ? "Atualização TCMS" : "Cadastro INSS"} · #{form.id}</p></div><Badge className={statusColors[form.status] ?? "bg-slate-100 text-slate-700"}>{statusLabels[form.status] ?? form.status}</Badge></CardHeader><CardContent><div className="grid gap-4 text-sm sm:grid-cols-4"><div><p className="text-slate-500">CPF</p><p className="font-medium">{form.cpf}</p></div><div><p className="text-slate-500">OAB</p><p className="font-medium">{form.oab}</p></div><div><p className="text-slate-500">Email</p><p className="truncate font-medium">{form.email}</p></div><div><p className="text-slate-500">Enviado em</p><p className="font-medium">{form.submittedAt ? new Date(form.submittedAt).toLocaleDateString("pt-BR") : "Rascunho"}</p></div></div>{form.reason && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Motivo: {form.reason}</p>}<Dialog><DialogTrigger asChild><Button className="mt-5" onClick={() => { setSelectedForm(form); setNewStatus(form.status); }} >Atualizar status</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Atualizar status do cadastro</DialogTitle></DialogHeader><div className="space-y-4"><label className="block text-sm font-medium">Novo status<select className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newStatus} onChange={(event) => setNewStatus(event.target.value as FormStatus)}><option value="draft">Rascunho</option><option value="submitted">Em análise</option><option value="approved">Aprovado</option><option value="rejected">Rejeitado</option></select></label>{newStatus === "rejected" && <label className="block text-sm font-medium">Motivo da rejeição<Textarea className="mt-2" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={4} /></label>}<Button className="w-full" onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>{updateStatusMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar status"}</Button></div></DialogContent></Dialog></CardContent></Card>)}
      </div>}
    </div></div>
  );
}
