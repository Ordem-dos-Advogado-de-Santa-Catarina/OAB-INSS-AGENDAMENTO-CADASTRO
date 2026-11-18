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
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11 ? `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}` : cpf;
};

interface UserData {
  nome: string; email: string; cpf: string; oab: string; telefone: string;
  endereco: string; cep: string; cidade: string; estado: string; bairro: string;
}

export default function FormSubmission() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ processNumber: '', report: '', defenderName: '', contactPhone: '', contactEmail: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { setLocation('/login'); return; }
    try {
      const parsed = JSON.parse(stored) as UserData;
      setUserData(parsed);
      setFormData((prev) => ({ ...prev, contactPhone: parsed.telefone || '', contactEmail: parsed.email || '' }));
    } catch (parseError) {
      console.error('Erro ao carregar dados do usuário:', parseError);
      setLocation('/login');
    }
  }, [setLocation]);

  const createFormMutation = trpc.forms.create.useMutation();
  const submitFormMutation = trpc.forms.submit.useMutation();
  const isPending = createFormMutation.isPending || submitFormMutation.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!userData) return;
    if (!formData.processNumber.trim()) return setError('Número do processo é obrigatório');
    if (formData.report.trim().length < 10) return setError('Relato deve ter no mínimo 10 caracteres');
    if (!formData.defenderName.trim()) return setError('Nome do defensor é obrigatório');
    if (!formData.contactPhone.trim()) return setError('Telefone de contato é obrigatório');
    if (!formData.contactEmail.trim()) return setError('Email de contato é obrigatório');

    try {
      const created = await createFormMutation.mutateAsync({
        name: userData.nome,
        cpf: userData.cpf,
        email: userData.email,
        notificationEmail: formData.contactEmail,
        oab: userData.oab,
        phone: formData.contactPhone,
        address: userData.endereco,
        cep: userData.cep,
        bairro: userData.bairro,
        cidade: userData.cidade,
        estado: userData.estado,
        formType: 'initial',
        reason: formData.processNumber,
        description: `Defensor responsável: ${formData.defenderName}\n\n${formData.report}`,
      });
      await submitFormMutation.mutateAsync({ id: created.id });
      setSuccess(true);
      window.setTimeout(() => setLocation('/my-forms'), 2000);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Erro ao enviar formulário');
    }
  };

  if (!userData) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8"><div className="mx-auto max-w-2xl"><Card className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">Novo Formulário</h1><p className="mt-2 text-gray-600">Preencha os dados abaixo para submeter sua solicitação.</p></div>
      {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
      {success ? <div className="flex flex-col items-center py-12 text-center"><CheckCircle className="mb-4 h-12 w-12 text-green-600" /><h2 className="text-xl font-semibold">Formulário enviado com sucesso</h2><p className="mt-2 text-gray-600">Você será redirecionado para seus formulários.</p></div> : <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg bg-blue-50 p-4"><h2 className="mb-3 font-semibold text-gray-900">Seus dados integrados</h2><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-gray-600">Nome</p><p className="font-medium">{userData.nome}</p></div><div><p className="text-gray-600">OAB</p><p className="font-medium">{userData.oab}</p></div><div><p className="text-gray-600">CPF</p><p className="font-medium">{formatCPF(userData.cpf)}</p></div><div><p className="text-gray-600">Email</p><p className="font-medium">{userData.email}</p></div></div></div>
        <div><label htmlFor="processNumber" className="mb-2 block text-sm font-medium">Número do processo</label><Input id="processNumber" value={formData.processNumber} onChange={(e) => setFormData({ ...formData, processNumber: e.target.value })} /></div>
        <div><label htmlFor="defenderName" className="mb-2 block text-sm font-medium">Defensor responsável</label><Input id="defenderName" value={formData.defenderName} onChange={(e) => setFormData({ ...formData, defenderName: e.target.value })} /></div>
        <div><label htmlFor="contactPhone" className="mb-2 block text-sm font-medium">Telefone de contato</label><Input id="contactPhone" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} /></div>
        <div><label htmlFor="contactEmail" className="mb-2 block text-sm font-medium">Email de contato</label><Input id="contactEmail" type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} /></div>
        <div><label htmlFor="report" className="mb-2 block text-sm font-medium">Relato da solicitação</label><Textarea id="report" rows={6} value={formData.report} onChange={(e) => setFormData({ ...formData, report: e.target.value })} /></div>
        <Button type="submit" disabled={isPending} className="w-full">{isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar formulário'}</Button>
      </form>}
    </Card></div></div>
  );
}
