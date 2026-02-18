import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, User, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentChatProps {
  appointmentId: number;
  isAdmin?: boolean;
}

export function AppointmentChat({ appointmentId, isAdmin = false }: AppointmentChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  const messagesQuery = trpc.messages.getMessages.useQuery(
    { appointmentId },
    { 
      refetchInterval: 3000, // Atualiza a cada 3 segundos
    }
  );

  useEffect(() => {
    if (messagesQuery.data && messagesQuery.data.length > 0) {
      markAsReadMutation.mutate({ appointmentId });
    }
  }, [appointmentId, messagesQuery.data?.length]);

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      messagesQuery.refetch();
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesQuery.data]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      appointmentId,
      content: newMessage.trim(),
    });
  };

  if (messagesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const messages = messagesQuery.data || [];

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg overflow-hidden border shadow-sm">
      {/* Header do Chat */}
      <div className="p-4 border-b bg-gray-50 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquareIcon className="h-4 w-4 text-indigo-600" />
          Mensagens do Agendamento
        </h3>
      </div>

      {/* Área de Mensagens com Scroll Independente */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full w-full p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 min-h-[300px]">
              <p className="text-sm">Nenhuma mensagem ainda.</p>
              <p className="text-xs">Inicie a conversa abaixo.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg) => {
                const isMe = isAdmin ? msg.isAdmin : !msg.isAdmin;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-900 rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.isAdmin ? (
                          <ShieldCheck className={`h-3 w-3 ${isMe ? "text-indigo-200" : "text-indigo-600"}`} />
                        ) : (
                          <User className={`h-3 w-3 ${isMe ? "text-indigo-200" : "text-gray-500"}`} />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {msg.isAdmin ? "Administrador" : "Usuário"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                      <p
                        className={`text-[10px] mt-1 text-right opacity-70`}
                      >
                        {(() => {
                          // O banco de dados MySQL/Drizzle pode estar retornando a data como string ou objeto Date
                          // Se o horário está vindo com 3 horas de atraso (ex: 11:18 em vez de 14:18),
                          // precisamos adicionar essas 3 horas manualmente para exibição.
                          const date = new Date(msg.createdAt);
                          
                          // Adiciona 3 horas (3 * 60 * 60 * 1000 ms) para compensar o fuso horário
                          const adjustedDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
                          
                          return adjustedDate.toLocaleTimeString("pt-BR", { 
                            hour: "2-digit", 
                            minute: "2-digit"
                          });
                        })()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {/* Âncora para o scroll automático */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Formulário de Envio Fixo no Rodapé */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 focus-visible:ring-indigo-600"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageSquareIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
