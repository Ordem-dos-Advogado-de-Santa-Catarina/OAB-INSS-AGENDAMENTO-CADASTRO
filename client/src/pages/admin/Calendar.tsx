import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, MapPin, FileText, ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function AdminCalendar() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [viewDayModalOpen, setViewDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const sendNotificationMutation = trpc.admin.sendCustomNotification.useMutation({
    onSuccess: () => {
      toast.success("Notificação enviada com sucesso!");
      setNotificationModalOpen(false);
      setNotificationMessage("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar notificação");
    },
    onSettled: () => {
      setIsSendingNotification(false);
    }
  });

  const calendarQuery = trpc.admin.getCalendarAppointments.useQuery({
    month: currentMonth.getMonth(),
    year: currentMonth.getFullYear()
  });

  const publicBlocksQuery = trpc.appointments.getPublicBlocks.useQuery({
    month: currentMonth.getMonth(),
    year: currentMonth.getFullYear()
  });

  if (loading) return null;
  if (!user || user.role !== 'admin') {
    navigate("/dashboard");
    return null;
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const appointmentsByDay = calendarQuery.data?.appointments.reduce((acc: any, apt: any) => {
    if (!acc[apt.day]) acc[apt.day] = [];
    acc[apt.day].push(apt);
    return acc;
  }, {}) || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendário de Agendamentos</h1>
            <p className="text-gray-600 mt-1">Visão mensal de todos os atendimentos confirmados</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center capitalize">{monthName}</span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-lg">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-[120px]">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-r border-b bg-gray-50/50" />
              ))}
              {days.map(day => {
                const dayApts = appointmentsByDay[day] || [];
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
                const dayBlocks = publicBlocksQuery.data?.blocks.filter(b => b.day === day) || [];
                const isFullDayBlocked = dayBlocks.some(b => b.blockType === "full_day");
                const isPartialBlocked = dayBlocks.length > 0 && !isFullDayBlocked;
                const blockData = dayBlocks[0];
                
                return (
                  <div 
                    key={day} 
                    onClick={() => {
                      if (dayApts.length > 0 || isPartialBlocked) {
                        setSelectedDay(day);
                        setViewDayModalOpen(true);
                      }
                    }}
                    className={`border-r border-b p-2 transition-colors hover:bg-gray-50 overflow-y-auto cursor-pointer ${
                      isToday ? 'bg-indigo-50/30' : ''
                    } ${
                      isFullDayBlocked ? 'bg-red-50 hover:bg-red-100' : ''
                    } ${
                      isPartialBlocked ? 'bg-amber-50 hover:bg-amber-100' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-bold ${
                        isToday 
                          ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' 
                          : isFullDayBlocked 
                            ? 'text-red-600' 
                            : isPartialBlocked
                              ? 'text-amber-600'
                              : 'text-gray-700'
                      }`}>
                        {day}
                      </span>
                      {dayApts.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-indigo-100 text-indigo-700 border-indigo-200">
                          {dayApts.length}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {isFullDayBlocked && (
                        <div className="text-[9px] font-bold text-red-600 bg-red-100 px-1 py-0.5 rounded mb-1 truncate" title={blockData.reason}>
                          BLOQUEIO TOTAL: {blockData.reason}
                        </div>
                      )}
                      {isPartialBlocked && (
                        <div className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1 py-0.5 rounded mb-1 truncate" title={blockData.reason}>
                          BLOQUEIO PARCIAL: {blockData.startTime.substring(0, 5)} - {blockData.endTime.substring(0, 5)}
                        </div>
                      )}
                      {dayApts.map((apt: any) => (
                        <button
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApt(apt);
                          }}
                          className="w-full text-left px-1.5 py-0.5 text-[10px] rounded bg-white border border-gray-200 truncate hover:border-indigo-400 hover:shadow-sm transition-all"
                        >
                          <span className="font-bold text-indigo-600 mr-1">{apt.startTime.substring(0, 5)}</span>
                          {apt.userName}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Lista do Dia */}
      <Dialog open={viewDayModalOpen} onOpenChange={(open) => !open && setViewDayModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              Agendamentos - Dia {selectedDay}
            </DialogTitle>
            <DialogDescription>
              Lista completa de atendimentos para este dia.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 py-4">
            {selectedDay && appointmentsByDay[selectedDay]?.map((apt: any) => (
              <div 
                key={apt.id} 
                onClick={() => {
                  setSelectedApt(apt);
                  setViewDayModalOpen(false);
                }}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-sm">
                    {apt.startTime.substring(0, 5)}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{apt.userName}</p>
                    <p className="text-xs text-gray-500">{apt.reason}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDayModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedApt} onOpenChange={(open) => !open && setSelectedApt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>

          {selectedApt && (
            <div className="space-y-6 py-4">
              {/* Status e Data */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Data e Hora</p>
                  <p className="text-sm font-semibold flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    {selectedApt.dateFormatted} às {selectedApt.startTime.substring(0, 5)}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">Confirmado</Badge>
              </div>

              {/* Informações do Usuário */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  Informações do Usuário
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nome:</span>
                    <span className="font-medium">{selectedApt.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CPF:</span>
                    <span className="font-medium">{selectedApt.userCpf}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">OAB:</span>
                    <span className="font-medium">{selectedApt.userOab}</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 mt-1">
                    <Phone className="h-3.5 w-3.5" /> {selectedApt.userPhone || "Não informado"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-3.5 w-3.5" /> {selectedApt.userEmail}
                  </div>
                  {selectedApt.userCidade && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-3.5 w-3.5" /> {selectedApt.userCidade}/{selectedApt.userEstado}
                    </div>
                  )}
                </div>
              </div>

              {/* Detalhes do Serviço */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Detalhes do Serviço
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Motivo:</p>
                    <p className="text-sm font-medium">{selectedApt.reason}</p>
                  </div>
                  {selectedApt.notes && (
                    <div>
                      <p className="text-xs text-gray-500">Observações:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border italic">
                        "{selectedApt.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedApt(null)} className="flex-1">Fechar</Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                  onClick={() => setNotificationModalOpen(true)}
                >
                  <Mail className="h-4 w-4 mr-2" /> Notificar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Envio de Notificação */}
      <Dialog open={notificationModalOpen} onOpenChange={(open) => {
        if (!open) {
          setNotificationModalOpen(false);
          setNotificationMessage("");
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-indigo-600" />
              Enviar Notificação por E-mail
            </DialogTitle>
            <DialogDescription>
              A mensagem abaixo será enviada para o e-mail de <strong>{selectedApt?.userName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagem</label>
              <Textarea 
                placeholder="Ex: Por favor, traga a documentação original do INSS..."
                className="min-h-[150px]"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                O usuário receberá esta mensagem formatada em um e-mail oficial do sistema.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationModalOpen(false)}>Cancelar</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!notificationMessage.trim() || isSendingNotification}
              onClick={() => {
                setIsSendingNotification(true);
                sendNotificationMutation.mutate({
                  appointmentId: selectedApt.id,
                  message: notificationMessage
                });
              }}
            >
              {isSendingNotification ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar E-mail
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
