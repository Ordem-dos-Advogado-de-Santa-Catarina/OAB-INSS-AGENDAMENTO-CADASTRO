import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Settings as SettingsIcon, Save, Loader2, Clock, Building, Mail, Shield, Server } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  
  const settingsQuery = trpc.system.getSettings.useQuery();
  const updateSettingsMutation = trpc.system.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso");
      settingsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações");
    }
  });

  const [formData, setFormData] = useState({
    workingHoursStart: "08:00:00",
    workingHoursEnd: "12:00:00",
    appointmentDurationMinutes: 30,
    monthlyLimitPerUser: 2,
    cancellationBlockingHours: 2,
    minCancellationLeadTimeHours: 5,
    maxAdvancedBookingDays: 30,
    blockingTimeAfterHours: "19:00:00",
    institutionName: "OAB/SC",
    institutionAddress: "",
    institutionPhone: "",
    senderEmail: "",
    senderName: "",
    adminEmails: "[]",
    dailyReportTime: "19:00",
    dailyReportEnabled: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setFormData({
        workingHoursStart: settingsQuery.data.workingHoursStart,
        workingHoursEnd: settingsQuery.data.workingHoursEnd,
        appointmentDurationMinutes: settingsQuery.data.appointmentDurationMinutes,
        monthlyLimitPerUser: settingsQuery.data.monthlyLimitPerUser,
        cancellationBlockingHours: settingsQuery.data.cancellationBlockingHours,
        minCancellationLeadTimeHours: settingsQuery.data.minCancellationLeadTimeHours || 5,
        maxAdvancedBookingDays: settingsQuery.data.maxAdvancedBookingDays,
        blockingTimeAfterHours: settingsQuery.data.blockingTimeAfterHours,
        institutionName: settingsQuery.data.institutionName,
        institutionAddress: settingsQuery.data.institutionAddress || "",
        institutionPhone: settingsQuery.data.institutionPhone || "",
        senderEmail: settingsQuery.data.senderEmail,
        senderName: settingsQuery.data.senderName,
        adminEmails: settingsQuery.data.adminEmails,
        dailyReportTime: settingsQuery.data.dailyReportTime || "19:00",
        dailyReportEnabled: settingsQuery.data.dailyReportEnabled ?? true,
        smtpHost: settingsQuery.data.smtpHost || "smtp.gmail.com",
        smtpPort: settingsQuery.data.smtpPort || 587,
        smtpSecure: settingsQuery.data.smtpSecure ?? false,
        smtpUser: settingsQuery.data.smtpUser || "",
        smtpPassword: settingsQuery.data.smtpPassword || "",
      });
    }
  }, [settingsQuery.data]);

  if (loading) return null;
  if (!user || user.role !== 'admin') {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
	      [name]: e.target.type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : name.includes('Limit') || name.includes('Duration') || name.includes('Days') || name.includes('Hours') && !name.includes('working') && !name.includes('blocking') 
            ? parseInt(value, 10) 
            : value
	    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="h-8 w-8 text-indigo-600" />
              Configurações do Sistema
            </h1>
            <p className="text-gray-600 mt-1">Gerencie as regras de negócio e informações da instituição.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Regras de Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                Regras de Agendamento
              </CardTitle>
              <CardDescription>Defina horários e limites para os usuários.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHoursStart">Início do Expediente</Label>
                <Input id="workingHoursStart" name="workingHoursStart" type="time" step="1" value={formData.workingHoursStart} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHoursEnd">Fim do Expediente</Label>
                <Input id="workingHoursEnd" name="workingHoursEnd" type="time" step="1" value={formData.workingHoursEnd} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentDurationMinutes">Duração do Atendimento (minutos)</Label>
                <Input id="appointmentDurationMinutes" name="appointmentDurationMinutes" type="number" value={formData.appointmentDurationMinutes} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyLimitPerUser">Limite Mensal por Usuário</Label>
                <Input id="monthlyLimitPerUser" name="monthlyLimitPerUser" type="number" value={formData.monthlyLimitPerUser} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationBlockingHours">Antecedência Mínima para Cancelar (horas)</Label>
                <Input id="cancellationBlockingHours" name="cancellationBlockingHours" type="number" value={formData.cancellationBlockingHours} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdvancedBookingDays">Limite de Antecedência para Agendar (dias)</Label>
                <Input id="maxAdvancedBookingDays" name="maxAdvancedBookingDays" type="number" value={formData.maxAdvancedBookingDays} onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          {/* Informações da Instituição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-500" />
                Instituição
              </CardTitle>
              <CardDescription>Dados que aparecerão nos documentos e e-mails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">Nome da Instituição</Label>
                <Input id="institutionName" name="institutionName" value={formData.institutionName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institutionAddress">Endereço</Label>
                <Textarea id="institutionAddress" name="institutionAddress" value={formData.institutionAddress} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institutionPhone">Telefone de Contato</Label>
                <Input id="institutionPhone" name="institutionPhone" value={formData.institutionPhone} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-500" />
                Notificações e E-mail
              </CardTitle>
              <CardDescription>Configure quem envia e quem recebe os alertas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nome do Remetente</Label>
                  <Input id="senderName" name="senderName" value={formData.senderName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">E-mail do Remetente</Label>
                  <Input id="senderEmail" name="senderEmail" type="email" value={formData.senderEmail} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
	                <Label htmlFor="adminEmails">E-mails dos Administradores (JSON Array)</Label>
	                <Input id="adminEmails" name="adminEmails" value={formData.adminEmails} onChange={handleChange} placeholder='["admin@exemplo.com"]' required />
	                <p className="text-[10px] text-gray-400">Formato: ["email1@teste.com", "email2@teste.com"]</p>
	              </div>
                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dailyReportEnabled">Relatório Diário Automático</Label>
                      <p className="text-xs text-gray-500">Enviar lista de atendimentos do dia seguinte para admins.</p>
                    </div>
                    <input 
                      id="dailyReportEnabled" 
                      name="dailyReportEnabled" 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      checked={formData.dailyReportEnabled} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyReportTime">Horário de Envio do Relatório</Label>
                    <Input 
                      id="dailyReportTime" 
                      name="dailyReportTime" 
                      type="time" 
                      value={formData.dailyReportTime} 
                      onChange={handleChange} 
                      disabled={!formData.dailyReportEnabled}
                    />
                    <p className="text-[10px] text-gray-400">O relatório contém os agendamentos marcados para o próximo dia útil.</p>
                  </div>
                </div>
		            </CardContent>
		          </Card>

          {/* Configurações SMTP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-500" />
                Servidor SMTP
              </CardTitle>
              <CardDescription>Configure o servidor de e-mail para envio de notificações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input id="smtpHost" name="smtpHost" value={formData.smtpHost} onChange={handleChange} placeholder="smtp.gmail.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Porta SMTP</Label>
                  <Input id="smtpPort" name="smtpPort" type="number" value={formData.smtpPort} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Usuário SMTP</Label>
                <Input id="smtpUser" name="smtpUser" type="email" value={formData.smtpUser} onChange={handleChange} placeholder="seu-email@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Senha SMTP</Label>
                <Input id="smtpPassword" name="smtpPassword" type="password" value={formData.smtpPassword} onChange={handleChange} placeholder="Senha de aplicativo" />
                <p className="text-[10px] text-gray-400">Para Gmail, use uma senha de aplicativo gerada em https://myaccount.google.com/apppasswords</p>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  id="smtpSecure" 
                  name="smtpSecure" 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={formData.smtpSecure} 
                  onChange={handleChange} 
                />
                <Label htmlFor="smtpSecure" className="text-sm font-normal">
                  Usar conexão segura (TLS/SSL)
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/admin")}>Cancelar</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
