import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
  }
  return cpf;
};

interface UserData {
  nome: string;
  email: string;
  cpf: string;
  oab: string;
  telefone: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  bairro: string;
}

export default function FormSubmission() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    processNumber: '',
    report: '',
    defenderName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
        setFormData(prev => ({
          ...prev,
          contactPhone: parsed.telefone,
          contactEmail: parsed.email,
        }));
      } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
        setLocation('/login');
      }
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  const submitFormMutation = trpc.forms.submit.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setLocation('/meus-formularios');
        }, 2000);
      } else {
        setError(data.message || 'Erro ao enviar formulário');
      }
    },
    onError: (error) => {
      setError(error.message || 'Erro ao enviar formulário');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.processNumber.trim()) {
      setError('Número do processo é obrigatório');
      return;
    }

    if (formData.report.trim().length < 10) {
      setError('Relato deve ter no mínimo 10 caracteres');
      return;
    }

    if (!formData.defenderName.trim()) {
      setError('Nome do defensor é obrigatório');
      return;
    }

    if (!formData.contactPhone.trim()) {
      setError('Telefone de contato é obrigatório');
      return;
    }

    if (!formData.contactEmail.trim()) {
      setError('Email de contato é obrigatório');
      return;
    }

    submitFormMutation.mutate({
      ...formData,
      userCpf: userData?.cpf,
      userOab: userData?.oab,
      userPhone: userData?.telefone,
      userAddress: userData?.endereco,
    });
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Novo Formulário</h1>
            <p className="text-gray-600 mt-2">Preencha os dados abaixo para submeter seu formulário</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Seus Dados (Integrados)</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Nome</p>
                <p className="font-medium">{userData.nome}</p>
              </div>
              <div>
                <p className="text-gray-600">OAB</p>
                <p className="font-medium">{userData.oab}</p>
              </div>
              <div>
                <p className="text-gray-600">CPF</p>
                <p className="font-medium">{formatCPF(userData.cpf)}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Cidade</p>
                <p className="font-medium">{userData.cidade}</p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <p className="font-medium">{userData.estado}</p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Formulário enviado com sucesso! Redirecionando...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Processo *
              </label>
              <Input
                type="text"
                placeholder="Ex: 0000000-00.0000.0.00.0000"
                value={formData.processNumber}
                onChange={(e) => setFormData({ ...formData, processNumber: e.target.value })}
                disabled={submitFormMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relato/Descrição *
              </label>
              <Textarea
                placeholder="Descreva detalhadamente o caso..."
                value={formData.report}
                onChange={(e) => setFormData({ ...formData, report: e.target.value })}
                disabled={submitFormMutation.isPending}
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 10 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Defensor Público Responsável *
              </label>
              <Input
                type="text"
                placeholder="Nome do defensor público"
                value={formData.defenderName}
                onChange={(e) => setFormData({ ...formData, defenderName: e.target.value })}
                disabled={submitFormMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone de Contato *
              </label>
              <Input
                type="tel"
                placeholder="(XX) XXXXX-XXXX"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                disabled={submitFormMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Contato *
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                disabled={submitFormMutation.isPending}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={submitFormMutation.isPending}
              >
                {submitFormMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Formulário'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/meus-formularios')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
