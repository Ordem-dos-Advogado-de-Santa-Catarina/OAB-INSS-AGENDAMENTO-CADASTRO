import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, XCircle, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyAppointments() {
  const { user } = useAuth();
  const historyQuery = trpc.appointments.getHistory.useQuery({ limit: 50 });
  const [activeTab, setActiveTab] = useState("confirmed");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState("");

  const cancelMutation = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso");
      historyQuery.refetch();
      setCancellingId(null);
      setCancellationReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar agendamento");
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Atendido</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
      case "no_show":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Não Compareceu</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const canReschedule = (createdAtStr: string) => {
    const createdAt = new Date(createdAtStr);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = diffMs / (1000 * 60);
    return diffMins >= 30;
  };

  const confirmedAppointments = historyQuery.data?.filter((apt: any) => apt.status === "confirmed") || [];
  const finishedAppointments = historyQuery.data?.filter((apt: any) => ["completed", "cancelled", "no_show"].includes(apt.status)) || [];

  const renderTable = (appointments: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Horário</th>
            <th className="px-4 py-3">Motivo</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {appointments.map((apt: any) => (
            <tr key={apt.id} className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(apt.appointmentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {apt.startTime ? apt.startTime.substring(0, 5) : '--:--'}
                </div>
              </td>
              <td className="px-4 py-3">{apt.reason}</td>
              <td className="px-4 py-3">{getStatusBadge(apt.status)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {apt.status === "confirmed" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        onClick={() => setReschedulingId(apt.id)}
                        disabled={!canReschedule(apt.createdAt)}
                        title={!canReschedule(apt.createdAt) ? "Disponível 30 min após o agendamento" : ""}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Remarcar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setCancellingId(apt.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Meus Agendamentos</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "confirmed" ? "Agendamentos Confirmados" : "Agendamentos Finalizados"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <>
                  <TabsContent value="confirmed" className="m-0">
                    {confirmedAppointments.length > 0 ? (
                      renderTable(confirmedAppointments)
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Você não possui agendamentos confirmados.</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="finished" className="m-0">
                    {finishedAppointments.length > 0 ? (
                      renderTable(finishedAppointments)
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Você não possui agendamentos finalizados ou cancelados.</p>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Dialog de Confirmação de Cancelamento */}
      <Dialog open={cancellingId !== null} onOpenChange={(open) => {
        if (!open) {
          setCancellingId(null);
          setCancellationReason("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cancelamento</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo do cancelamento. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="reason">Motivo do Cancelamento</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Imprevisto profissional, problema de saúde, etc."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingId(null)}>Voltar</Button>
            <Button 
              variant="destructive" 
              onClick={() => cancellingId && cancelMutation.mutate({ 
                appointmentId: cancellingId, 
                reason: cancellationReason 
              })}
              disabled={cancelMutation.isPending || !cancellationReason.trim()}
            >
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Remarcação (Placeholder para lógica futura) */}
      <Dialog open={reschedulingId !== null} onOpenChange={() => setReschedulingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remarcar Atendimento</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário para o seu atendimento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
               Nota: Para remarcar, selecione um novo horário no painel principal ou entre em contato.
             </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedulingId(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
