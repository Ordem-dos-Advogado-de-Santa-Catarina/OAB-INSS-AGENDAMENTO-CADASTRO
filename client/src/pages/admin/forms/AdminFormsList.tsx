import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, FileText, Download, CheckCircle, XCircle, UserCheck, UserMinus, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminFormsList() {
  const { user, loading } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formsQuery = trpc.forms.getAll.useQuery(undefined, {
    enabled: !!user && user.role === "admin"
  });

  const formDetailQuery = trpc.forms.getById.useQuery(
    { id: selectedFormId as number },
    { enabled: !!selectedFormId }
  );

  const updateStatusMutation = trpc.forms.updateStatus.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      formDetailQuery.refetch();
      toast.success("Status atualizado com sucesso");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const updateRegistrationStatusMutation = trpc.forms.updateRegistrationStatus.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      formDetailQuery.refetch();
      toast.success("Status de cadastro atualizado");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status de cadastro: " + error.message);
    }
  });

  if (loading || formsQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
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
      case "registered": return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 cursor-pointer">Cadastrado</Badge>;
      default: return <Badge variant="outline" className="text-gray-500 cursor-pointer">Não Cadastrado</Badge>;
    }
  };

  const handleApprove = async (id: number) => {
    setIsProcessing(true);
    await updateStatusMutation.mutateAsync({ id, status: "approved" });
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Por favor, informe o motivo da recusa.");
      return;
    }
    if (!selectedFormId) return;

    setIsProcessing(true);
    await updateStatusMutation.mutateAsync({ 
      id: selectedFormId, 
      status: "rejected", 
      rejectionReason 
    });
  };

  const toggleRegistrationStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "registered" ? "not_registered" : "registered";
    await updateRegistrationStatusMutation.mutateAsync({ id, registrationStatus: newStatus });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Formulários</h1>
          <p className="text-gray-600">Analise os formulários e documentos enviados pelos advogados(as).</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>OAB</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formsQuery.data?.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.name}</TableCell>
                    <TableCell>{form.cpf}</TableCell>
                    <TableCell>{form.oab}</TableCell>
                    <TableCell>
                      {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString("pt-BR") : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(form.status)}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="inline-block hover:opacity-80 transition-opacity" title="Clique para alterar status">
                            {getRegistrationStatusBadge(form.registrationStatus)}
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar alteração de status?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Deseja realmente alterar o status de cadastro para <strong>{form.registrationStatus === 'registered' ? 'Não Cadastrado' : 'Cadastrado'}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toggleRegistrationStatus(form.id, form.registrationStatus)}>
                              Confirmar Alteração
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedFormId(form.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Formulário</DialogTitle>
                            <DialogDescription>Informações e documentos enviados por {form.name}</DialogDescription>
                          </DialogHeader>
                          
                          {formDetailQuery.isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                          ) : formDetailQuery.data ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm border-b pb-6">
                                <div>
                                  <p className="text-gray-500 mb-1 uppercase text-xs font-semibold tracking-wider">Nome Completo</p>
                                  <p className="font-bold text-gray-900">{formDetailQuery.data.name}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1 uppercase text-xs font-semibold tracking-wider">CPF</p>
                                  <p className="font-bold text-gray-900">{formDetailQuery.data.cpf}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1 uppercase text-xs font-semibold tracking-wider">E-mail</p>
                                  <p className="font-bold text-gray-900">{formDetailQuery.data.email}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1 uppercase text-xs font-semibold tracking-wider">Telefone</p>
                                  <p className="font-bold text-gray-900">{formDetailQuery.data.phone || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-gray-500 mb-1 uppercase text-xs font-semibold tracking-wider">Endereço</p>
                                  <p className="font-bold text-gray-900">{formDetailQuery.data.address || "N/A"}</p>
                                </div>
                              </div>

                              {formDetailQuery.data.status === "rejected" && formDetailQuery.data.rejectionReason && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                  <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Motivo da Recusa Anterior:
                                  </div>
                                  <p className="text-sm text-red-600">{formDetailQuery.data.rejectionReason}</p>
                                </div>
                              )}

                              <div className="space-y-3">
                                <h4 className="font-bold text-sm text-gray-700">Documentos Anexados</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {formDetailQuery.data.attachments.map((att) => (
                                    <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded">
                                          <FileText className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{att.fileName}</span>
                                      </div>
                                      <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                                        <a href={att.fileUrl} target="_blank" rel="noreferrer">
                                          <Download className="h-5 w-5" />
                                        </a>
                                      </Button>
                                    </div>
                                  ))}
                                  {formDetailQuery.data.attachments.length === 0 && (
                                    <p className="text-sm text-gray-500 italic p-4 text-center border rounded-lg border-dashed">Nenhum documento anexado.</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-4 border-t">
                                <div className="flex gap-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className={formDetailQuery.data.registrationStatus === 'registered' ? "bg-indigo-50 text-indigo-700 border-indigo-200" : ""}
                                      >
                                        {formDetailQuery.data.registrationStatus === 'registered' ? (
                                          <><UserCheck className="h-4 w-4 mr-2" /> Cadastrado</>
                                        ) : (
                                          <><UserMinus className="h-4 w-4 mr-2" /> Marcar como Cadastrado</>
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar alteração de status?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Deseja realmente alterar o status de cadastro para <strong>{formDetailQuery.data.registrationStatus === 'registered' ? 'Não Cadastrado' : 'Cadastrado'}</strong>?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => toggleRegistrationStatus(form.id, formDetailQuery.data.registrationStatus)}>
                                          Confirmar Alteração
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                                <div className="flex gap-3">
                                  <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rejeitar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Motivo da Recusa</DialogTitle>
                                        <DialogDescription>
                                          Informe o motivo da recusa. Este texto será enviado por e-mail para o advogado(a).
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="py-4">
                                        <Textarea 
                                          placeholder="Descreva aqui o motivo da recusa (ex: Documento ilegível, falta de assinatura...)"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          rows={5}
                                        />
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancelar</Button>
                                        <Button 
                                          variant="destructive" 
                                          onClick={handleReject}
                                          disabled={isProcessing}
                                        >
                                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                          Confirmar Recusa e Enviar E-mail
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(form.id)}
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                    Aprovar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {formsQuery.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum formulário enviado até o momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
