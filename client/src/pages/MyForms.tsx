import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

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

export default function MyForms() {
  const [, setLocation] = useLocation();
  const { data: forms, isLoading, error } = trpc.forms.getUserForms.useQuery();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      setLocation('/login');
    }
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Formulários</h1>
            <p className="text-gray-600 mt-2">Acompanhe o status de seus formulários</p>
          </div>
          <Button onClick={() => setLocation('/formulario')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Formulário
          </Button>
        </div>

        {error && (
          <Card className="p-6 bg-red-50 border-red-200 mb-6">
            <p className="text-red-800">Erro ao carregar formulários</p>
          </Card>
        )}

        {!forms || forms.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">Você ainda não enviou nenhum formulário</p>
            <Button onClick={() => setLocation('/formulario')}>
              Criar Primeiro Formulário
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <Card key={form.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Processo: {form.processNumber}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Defensor: {form.defenderName}
                    </p>
                  </div>
                  <Badge className={statusColors[form.status as keyof typeof statusColors]}>
                    {statusLabels[form.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Telefone</p>
                    <p className="font-medium">{form.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{form.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Enviado em</p>
                    <p className="font-medium">
                      {new Date(form.submittedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Atualizado em</p>
                    <p className="font-medium">
                      {new Date(form.statusChangedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {form.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded mb-4 border border-red-200">
                    <p className="text-sm font-medium text-red-800">Motivo da Rejeição:</p>
                    <p className="text-sm text-red-700">{form.rejectionReason}</p>
                  </div>
                )}

                {form.adminNotes && (
                  <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Observações do Admin:</p>
                    <p className="text-sm text-blue-700">{form.adminNotes}</p>
                  </div>
                )}

                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-4 max-h-32 overflow-y-auto">
                  <p className="font-medium mb-2">Relato:</p>
                  <p>{form.report}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation(`/formulario/${form.id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
