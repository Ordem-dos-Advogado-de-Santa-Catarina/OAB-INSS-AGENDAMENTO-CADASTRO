import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AppointmentChat } from "@/components/AppointmentChat";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Calendar, User, Loader2, AlertCircle, Inbox, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Messages() {
  const { user, loading } = useAuth();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");

  const appointmentsQuery = user?.role === 'admin' 
    ? trpc.admin.getAllAppointmentsWithStatus.useQuery()
    : trpc.appointments.getHistory.useQuery({ limit: 50 });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  const allAppointments = useMemo(() => {
    if (user?.role === 'admin') {
      return appointmentsQuery.data?.appointments || [];
    }
    // Para usuários comuns, o retorno é um array direto
    return (appointmentsQuery.data as any) || [];
  }, [appointmentsQuery.data, user?.role]);
  
  // Filtra para a Caixa de Entrada (Confirmados)
  const inboxAppointments = useMemo(() => {
    if (user?.role === 'admin') {
      return allAppointments.filter((apt: any) => apt.status === 'confirmed');
    }
    return allAppointments.filter((apt: any) => apt.status === 'confirmed');
  }, [allAppointments, user?.role]);
  
  // Filtra para Finalizados (qualquer agendamento que não esteja confirmado mas tenha mensagens ou status final)
  const historyAppointments = useMemo(() => {
    return allAppointments.filter((apt: any) => 
      ["completed", "cancelled", "no_show"].includes(apt.status) || 
      (apt.status !== 'confirmed' && apt.hasMessages)
    );
  }, [allAppointments]);

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

  const formatDate = (apt: any) => {
    if (apt.date) return apt.date;
    if (apt.appointmentDate) {
      try {
        const d = new Date(apt.appointmentDate);
        if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
      } catch (e) {}
    }
    return "";
  };

  const renderAppointmentList = (list: any[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 px-4">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Nenhuma conversa encontrada.</p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {list.map((apt: any) => (
          <button
            key={apt.id}
            onClick={() => setSelectedAppointmentId(apt.id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex flex-col gap-2 ${
              selectedAppointmentId === apt.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-gray-900">
                  {user?.role === 'admin' ? apt.userName : apt.reason}
                </span>
                {apt.hasUnreadForAdmin && (
                  <span className="text-[10px] text-indigo-600 font-bold uppercase mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                    Nova Mensagem
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                {formatDate(apt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {apt.startTime?.substring(0, 5) || apt.time}
              </div>
              {getStatusBadge(apt.status)}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Central de Mensagens</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
          <Card className="md:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Conversas
              </CardTitle>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 pt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inbox" className="text-xs flex items-center gap-2">
                    <Inbox className="h-3.5 w-3.5" />
                    Confirmados
                    {user?.role === 'admin' && inboxAppointments.length > 0 && (
                      <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center bg-indigo-600 text-[10px]">
                        {inboxAppointments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs flex items-center gap-2">
                    <History className="h-3.5 w-3.5" />
                    Finalizados
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-y-auto mt-2">
                <TabsContent value="inbox" className="m-0">
                  {renderAppointmentList(inboxAppointments)}
                </TabsContent>
                <TabsContent value="all" className="m-0">
                  {renderAppointmentList(historyAppointments)}
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedAppointmentId ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <AppointmentChat 
                  appointmentId={selectedAppointmentId} 
                  isAdmin={user?.role === 'admin'} 
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <MessageSquare className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Selecione uma conversa</h3>
                <p className="text-sm text-center max-w-xs mt-2">
                  Escolha um agendamento na lista ao lado para visualizar as mensagens e tirar dúvidas.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
