import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  ClipboardList, 
  Lock, 
  Settings, 
  Users, 
  Calendar as CalendarIcon, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // Criar uma data no formato correto para evitar problemas de timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Estatísticas básicas para o dashboard
  const dailyQuery = trpc.admin.getDailyAppointments.useQuery(
    { date: today },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  if (loading) return null;
  if (!user || user.role !== 'admin') {
    navigate("/dashboard");
    return null;
  }

  // Calcular estatísticas com verificação de dados
  const appointments = dailyQuery.data?.appointments || [];
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const adminActions = [
    {
      title: "Atendimentos do Dia",
      description: "Visualize e gerencie a lista de atendimentos para hoje.",
      icon: ClipboardList,
      path: "/admin/daily",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Gerenciar Bloqueios",
      description: "Bloqueie datas ou horários específicos na agenda.",
      icon: Lock,
      path: "/admin/blocks",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Configurações do Sistema",
      description: "Ajuste horários, limites e informações da instituição.",
      icon: Settings,
      path: "/admin/settings",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-1">Bem-vindo, {user.name}. Gerencie o sistema de agendamentos aqui.</p>
        </div>

        {/* Cards de Estatísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              {dailyQuery.isLoading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Hoje</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              {dailyQuery.isLoading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Confirmados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              {dailyQuery.isLoading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Atendidos</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              {dailyQuery.isLoading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cancelados</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mensagem de erro se houver */}
        {dailyQuery.isError && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-600">
                Erro ao carregar estatísticas. Por favor, tente recarregar a página.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ações Administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminActions.map((action) => (
            <Card key={action.path} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(action.path)}>
              <CardHeader>
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <CardTitle>{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="p-0 h-auto text-indigo-600 hover:text-indigo-700 hover:bg-transparent">
                  Acessar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de Atalho Rápido */}
        <Card className="bg-indigo-600 text-white border-none overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Precisa de ajuda com a agenda?</CardTitle>
            <CardDescription className="text-indigo-100">
              Você pode visualizar o calendário completo de agendamentos para ter uma visão mensal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="secondary" 
              className="bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={() => navigate("/admin/daily")}
            >
              Ver Calendário Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function ShieldCheck(props: any) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
