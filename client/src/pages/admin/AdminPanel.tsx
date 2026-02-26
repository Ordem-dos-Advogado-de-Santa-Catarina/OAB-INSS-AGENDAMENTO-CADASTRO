import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, LogOut, Settings, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  analyzing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  analyzing: 'Em Análise',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
  }
  return cpf;
};

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const { data: forms, isLoading, refetch } = trpc.admin.getAllForms.useQuery();
  const { data: currentAdminEmails } = trpc.admin.getAdminEmails.useQuery();
  
  const updateStatusMutation = trpc.admin.updateFormStatus.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedForm(null);
      setNewStatus('');
      setRejectionReason('');
      setAdminNotes('');
    },
  });

  const updateEmailsMutation = trpc.admin.updateAdminEmails.useMutation({
    onSuccess: () => {
      setNewEmail('');
    },
  });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      setLocation('/login');
    }
  }, [setLocation]);

  useEffect(() => {
    if (currentAdminEmails) {
      setAdminEmails(currentAdminEmails);
    }
  }, [currentAdminEmails]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setLocation('/login');
  };

  const handleAddEmail = () => {
    if (newEmail && !adminEmails.includes(newEmail)) {
      const updatedEmails = [...adminEmails, newEmail];
      setAdminEmails(updatedEmails);
      updateEmailsMutation.mutate({ emails: updatedEmails });
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    const updatedEmails = adminEmails.filter(e => e !== email);
    setAdminEmails(updatedEmails);
    updateEmailsMutation.mutate({ emails: updatedEmails });
  };

  const handleUpdateStatus = () => {
    if (!selectedForm || !newStatus) return;

    updateStatusMutation.mutate({
      formId: selectedForm.id,
      status: newStatus as any,
      rejectionReason: rejectionReason || undefined,
      adminNotes: adminNotes || undefined,
    });
  };

  const filteredForms = forms?.filter((form) =>
    form.processNumber.includes(searchTerm) ||
    form.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.userEmail.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Gerenciar formulários recebidos</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {showSettings && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Administradores</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emails de Administradores
                </label>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="email"
                    placeholder="novo@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button onClick={handleAddEmail} disabled={updateEmailsMutation.isPending}>
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {adminEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-2 px-3 py-2">
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <Input
            type="text"
            placeholder="Buscar por processo, nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </Card>

        {!filteredForms || filteredForms.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Nenhum formulário encontrado</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredForms.map((form) => (
              <Card key={form.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {form.userName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Processo: {form.processNumber}
                    </p>
                  </div>
                  <Badge className={statusColors[form.status as keyof typeof statusColors]}>
                    {statusLabels[form.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{form.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Telefone</p>
                    <p className="font-medium">{form.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">CPF</p>
                    <p className="font-medium">{formatCPF(form.userCpf)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">OAB</p>
                    <p className="font-medium">{form.userOab}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-4 max-h-32 overflow-y-auto">
                  <p className="font-medium mb-2">Relato:</p>
                  <p>{form.report}</p>
                </div>

                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-4">
                  <p className="font-medium mb-2">Defensor Responsável:</p>
                  <p>{form.defenderName}</p>
                </div>

                {form.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded mb-4 border border-red-200">
                    <p className="text-sm font-medium text-red-800">Motivo da Rejeição:</p>
                    <p className="text-sm text-red-700">{form.rejectionReason}</p>
                  </div>
                )}

                {form.adminNotes && (
                  <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Observações:</p>
                    <p className="text-sm text-blue-700">{form.adminNotes}</p>
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedForm(form)}>
                      Atualizar Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Atualizar Status do Formulário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Novo Status</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="analyzing">Em Análise</SelectItem>
                            <SelectItem value="approved">Aprovado</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newStatus === 'rejected' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Motivo da Rejeição
                          </label>
                          <Textarea
                            placeholder="Explique por que o formulário foi rejeitado..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Observações (Opcional)
                        </label>
                        <Textarea
                          placeholder="Adicione observações para o usuário..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleUpdateStatus}
                        disabled={updateStatusMutation.isPending}
                        className="w-full"
                      >
                        {updateStatusMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Atualizando...
                          </>
                        ) : (
                          'Atualizar Status'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
