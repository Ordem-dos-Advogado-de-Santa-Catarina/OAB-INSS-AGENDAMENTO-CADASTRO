import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, FileText, Download, CheckCircle, XCircle, UserCheck, UserMinus, AlertCircle, Info, Search, Trash2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminFormsList() {
  const { user, loading } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRegistration, setFilterRegistration] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  const deleteFormMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      toast.success("Cadastro excluído com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao excluir cadastro: " + error.message);
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

  const getFormTypeBadge = (type: string) => {
    switch (type) {
      case "tcms_update": return <Badge className="bg-red-100 text-red-800 border-red-200">Solicitação de Atualização</Badge>;
      default: return <Badge className="bg-green-100 text-green-800 border-green-200">Cadastro Novo</Badge>;
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

  const handleDelete = async (id: number) => {
    await deleteFormMutation.mutateAsync({ id });
  };

  const getFriendlyFileName = (type: string) => {
    const mapping: Record<string, string> = {
      'ANEXO_II': 'ANEXO II TCMS - Modelo OAB (Assinado)',
      'DECLARACAO_BOAS_PRATICAS': 'Declaração de Boas Práticas (Assinado)',
      'TERMO_ACEITE': 'Termo de Aceite do ACT (Assinado)',
      'tcms_main_doc': 'Documento Principal (Solicitação de Atualização)',
      'tcms_extra_doc': 'Anexo Adicional (Solicitação de Atualização)'
    };
    return mapping[type] || type.replace(/_/g, ' ').toUpperCase();
  };

  const filteredForms = formsQuery.data?.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) || form.cpf.includes(searchTerm);
    const matchesType = filterType === "all" || form.formType === filterType;
    const matchesStatus = filterStatus === "all" || form.status === filterStatus;
    const matchesRegistration = filterRegistration === "all" || form.registrationStatus === filterRegistration;
    
    return matchesSearch && matchesType && matchesStatus && matchesRegistration;
  }) || [];

  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const paginatedForms = filteredForms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Formulários</h1>
              <p className="text-gray-600">Analise os formulários e documentos enviados pelos advogados(as).</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por Nome ou CPF..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Filter className="h-3 w-3" /> Tipo de Cadastro
              </Label>
              <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="initial">Cadastro Novo</SelectItem>
                  <SelectItem value="tcms_update">Solicitação de Atualização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Filter className="h-3 w-3" /> Status Solicitação
              </Label>
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="submitted">Enviado</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Filter className="h-3 w-3" /> Status Cadastro
              </Label>
              <Select value={filterRegistration} onValueChange={(v) => { setFilterRegistration(v); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="registered">Cadastrado</SelectItem>
                  <SelectItem value="not_registered">Não Cadastrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="ghost" 
                className="w-full text-gray-500 hover:text-indigo-600"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterStatus("all");
                  setFilterRegistration("all");
                  setCurrentPage(1);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>OAB</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.name}</TableCell>
                    <TableCell>{getFormTypeBadge(form.formType)}</TableCell>
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
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O cadastro de <strong>{form.name}</strong> será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(form.id)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                              >
                                Confirmar Exclusão
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedFormId(form.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                Detalhes da Solicitação
                                {formDetailQuery.data && getFormTypeBadge(formDetailQuery.data.formType)}
                              </DialogTitle>
                              <DialogDescription>
                                Informações enviadas pelo advogado {formDetailQuery.data?.submittedAt && `em ${new Date(formDetailQuery.data.submittedAt).toLocaleString("pt-BR")}`}
                              </DialogDescription>
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
                                    <p className="text-gray-500 mb-1 uppercase text-xs font-semibold tracking-wider">E-mail Pessoal</p>
                                    <p className="font-bold text-gray-900">{formDetailQuery.data.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-indigo-600 mb-1 uppercase text-xs font-bold tracking-wider">E-mail Notificação INSS Digital</p>
                                    <p className="font-bold text-indigo-900">{formDetailQuery.data.notificationEmail}</p>
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
                                {formDetailQuery.data.formType === "tcms_update" && (
                                  <div className="space-y-4">
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                      <h4 className="font-bold text-purple-900 mb-2">Motivo da Atualização:</h4>
                                      <p className="text-sm text-purple-800">{formDetailQuery.data.reason || "Não informado"}</p>
                                      <h4 className="font-bold text-purple-900 mt-4 mb-2">Descrição Detalhada:</h4>
                                      <p className="text-sm text-purple-800 whitespace-pre-wrap">{formDetailQuery.data.description || "Não informado"}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-3">
                                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Documentos Anexados
                                  </h4>
                                  <div className="grid grid-cols-1 gap-2">
                                    {formDetailQuery.data.attachments && formDetailQuery.data.attachments.length > 0 ? (
                                      formDetailQuery.data.attachments.map((att: any) => (
                                        <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors gap-4">
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="p-2 bg-white rounded border shrink-0">
                                              <FileText className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-bold text-gray-900 truncate" title={att.fileName}>{att.fileName}</p>
                                              <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-tight">{getFriendlyFileName(att.fileType)}</p>
                                            </div>
                                          </div>
                                          <Button variant="outline" size="sm" className="shrink-0 bg-white hover:bg-indigo-50 hover:text-indigo-700 border-gray-200" asChild>
                                            <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                              <Download className="h-4 w-4 md:mr-2" />
                                              <span className="hidden md:inline">Baixar</span>
                                            </a>
                                          </Button>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded border text-center">Nenhum documento anexado.</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                  {formDetailQuery.data.status === "submitted" && (
                                    <>
                                      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Recusar Solicitação
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Recusar Solicitação</DialogTitle>
                                            <DialogDescription>
                                              Informe o motivo da recusa. O advogado receberá um e-mail com esta informação.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="py-4">
                                            <Label htmlFor="reason">Motivo da Recusa</Label>
                                            <Textarea 
                                              id="reason" 
                                              placeholder="Ex: Documento sem assinatura das testemunhas..." 
                                              className="mt-2"
                                              value={rejectionReason}
                                              onChange={(e) => setRejectionReason(e.target.value)}
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
                                              Confirmar Recusa
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>

                                      <Button 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(formDetailQuery.data!.id)}
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Aprovar Solicitação
                                      </Button>
                                    </>
                                  )}
                                  {formDetailQuery.data.status === "approved" && (
                                    <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                      <CheckCircle className="h-5 w-5" />
                                      Solicitação Aprovada
                                    </div>
                                  )}
                                  {formDetailQuery.data.status === "rejected" && (
                                    <div className="flex items-center gap-2 text-red-600 font-medium bg-red-50 px-4 py-2 rounded-full border border-red-100">
                                      <XCircle className="h-5 w-5" />
                                      Solicitação Recusada
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> até <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredForms.length)}</span> de{' '}
                  <span className="font-medium">{filteredForms.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    variant="outline"
                    className="rounded-l-md px-2 py-2"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      className={`px-4 py-2 ${currentPage === i + 1 ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    className="rounded-r-md px-2 py-2"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
