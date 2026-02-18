import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Calendar, Lock, Mail, BarChart3, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span className="font-bold text-xl text-gray-900">Agendamento INSS</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Olá, {user?.name}</span>
                <Button onClick={() => navigate("/dashboard")} className="bg-indigo-600 hover:bg-indigo-700">
                  Painel
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/login")} className="bg-indigo-600 hover:bg-indigo-700">
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistema de Agendamento <span className="text-indigo-600">INSS</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Agende seus atendimentos de forma rápida, segura e prática. Integrado com a OAB/SC.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              Fazer Agendamento
            </Button>
            <Button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Funcionalidades Principais</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Autenticação Segura</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Login integrado com OAB/SC. Seus dados de CPF e OAB são validados automaticamente.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Calendário Interativo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Visualize horários disponíveis em tempo real e selecione o melhor para você.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Notificações por Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receba confirmações e lembretes dos seus agendamentos por email.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <CheckCircle2 className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Gerenciamento Fácil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Visualize, cancele e gerencie todos os seus agendamentos em um único lugar.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Painel Administrativo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Administradores podem gerenciar bloqueios e visualizar todos os agendamentos.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Limite Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Máximo de 2 agendamentos por mês com validações automáticas de disponibilidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Regras de Agendamento</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Horários e Dias</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Atendimento de segunda a sexta</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Horário: 08:00 - 12:00</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Duração: 30 minutos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Sem agendamento após 19h para o dia seguinte</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Limitações</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Máximo 2 agendamentos por mês</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Bloqueio de 2h após cancelamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Não é permitido agendar para hoje</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Máximo 30 dias de antecedência</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Pronto para Agendar?</h2>
          <p className="text-indigo-100 text-lg mb-8">
            Faça seu agendamento agora mesmo de forma rápida e segura.
          </p>
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100 px-8"
          >
            Entrar no Sistema
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Sobre</h3>
              <p className="text-sm">Sistema de agendamento integrado com OAB/SC para facilitar o acesso aos serviços.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contato</h3>
              <p className="text-sm">Email: centraldeatendimento@oab-sc.org.br</p>
              <p className="text-sm">Telefone: (48) 3239-3500</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Endereço</h3>
              <p className="text-sm">Rua Paschoal Apóstolo Pítsica, 4860</p>
              <p className="text-sm">Agronômica, Florianópolis - SC</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Links</h3>
              <ul className="text-sm space-y-1">
                <li><a href="https://oab-sc.org.br/politica-privacidade" target="_blank" rel="noopener noreferrer" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="https://oab-sc.org.br/termo-uso" target="_blank" rel="noopener noreferrer" className="hover:text-white">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Sistema de Agendamento INSS - OAB/SC. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
