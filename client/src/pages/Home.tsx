import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Lock,
  Mail,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const features = [
  {
    icon: ShieldCheck,
    eyebrow: "Proteção",
    title: "Acesso seguro",
    description: "Autenticação integrada e validação dos dados para proteger cada solicitação.",
  },
  {
    icon: Calendar,
    eyebrow: "Praticidade",
    title: "Agenda em tempo real",
    description: "Consulte os horários disponíveis e escolha o melhor momento para o atendimento.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Controle",
    title: "Tudo organizado",
    description: "Acompanhe cadastros, documentos e agendamentos em um único painel.",
  },
];

const rules = [
  "Atendimento de segunda a sexta-feira",
  "Horários disponíveis das 08h às 12h",
  "Atendimentos com duração de 30 minutos",
  "Até 2 agendamentos por mês",
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToLogin = () => {
    setMenuOpen(false);
    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  const scrollToFeatures = () => {
    setMenuOpen(false);
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#063b66]/95 text-white shadow-lg shadow-slate-900/10 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Voltar ao início"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#063b66] shadow-sm transition-transform group-hover:scale-105">
              <Calendar className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-200">OAB/SC</span>
              <span className="block text-sm font-bold tracking-tight sm:text-base">Agendamento INSS</span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
            <button type="button" onClick={scrollToFeatures} className="text-sm font-medium text-blue-100 transition-colors hover:text-white">
              Como funciona
            </button>
            <a href="#regras" className="text-sm font-medium text-blue-100 transition-colors hover:text-white">
              Regras
            </a>
            <a href="#contato" className="text-sm font-medium text-blue-100 transition-colors hover:text-white">
              Atendimento
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && <span className="max-w-[180px] truncate text-sm text-blue-100">Olá, {user?.name?.split(" ")[0]}</span>}
            <Button onClick={goToLogin} className="h-10 rounded-lg bg-[#c9212a] px-5 font-semibold text-white shadow-md shadow-red-950/20 hover:bg-[#a91820]">
              {isAuthenticated ? "Acessar painel" : "Entrar no sistema"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#052f52] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <button type="button" onClick={scrollToFeatures} className="rounded-lg px-3 py-3 text-left text-sm text-blue-100 hover:bg-white/10">Como funciona</button>
              <a href="#regras" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-blue-100 hover:bg-white/10">Regras</a>
              <a href="#contato" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-blue-100 hover:bg-white/10">Atendimento</a>
              <Button onClick={goToLogin} className="mt-2 h-11 bg-[#c9212a] font-semibold hover:bg-[#a91820]">{isAuthenticated ? "Acessar painel" : "Entrar no sistema"}</Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#063b66]">
          <div className="absolute -right-40 -top-40 -z-10 h-[480px] w-[480px] rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-64 left-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-[#c9212a]/20 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.12)]" />
                Atendimento institucional OAB/SC
              </div>
              <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Seu atendimento no INSS, com mais <span className="text-blue-200">clareza e segurança.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-blue-100 sm:text-lg">
                Faça solicitações, consulte horários e acompanhe seus atendimentos em uma experiência simples, segura e centralizada.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button onClick={goToLogin} size="lg" className="h-12 rounded-lg bg-[#c9212a] px-6 font-semibold text-white shadow-lg shadow-red-950/25 hover:bg-[#a91820]">
                  {isAuthenticated ? "Ir para meu painel" : "Começar agora"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={scrollToFeatures} variant="outline" size="lg" className="h-12 rounded-lg border-white/30 bg-white/5 px-6 font-semibold text-white hover:bg-white/15 hover:text-white">
                  Conheça o serviço
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-blue-100">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Processo digital</span>
                <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-300" /> Dados protegidos</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-5 rounded-[2rem] bg-white/10 blur-2xl" />
              <div className="relative rounded-2xl border border-white/15 bg-white p-5 shadow-2xl shadow-slate-950/25 sm:p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c9212a]">Portal de atendimento</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">Tudo em um só lugar</h2>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3 text-[#063b66]"><Calendar className="h-5 w-5" /></div>
                </div>
                <div className="space-y-3 py-5">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700"><FileCheck2 className="h-4 w-4" /></span>
                    <div><p className="text-sm font-semibold text-slate-800">Cadastro INSS</p><p className="text-xs text-slate-500">Envie e acompanhe seus dados</p></div>
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="rounded-lg bg-blue-100 p-2 text-[#063b66]"><Clock3 className="h-4 w-4" /></span>
                    <div><p className="text-sm font-semibold text-slate-800">Agendamento</p><p className="text-xs text-slate-500">Escolha o melhor horário</p></div>
                    <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="rounded-lg bg-red-100 p-2 text-[#c9212a]"><Mail className="h-4 w-4" /></span>
                    <div><p className="text-sm font-semibold text-slate-800">Notificações</p><p className="text-xs text-slate-500">Receba atualizações importantes</p></div>
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="rounded-xl bg-[#063b66] p-4 text-white">
                  <p className="text-xs font-medium text-blue-200">Atendimento organizado</p>
                  <p className="mt-1 text-sm font-semibold">Mais autonomia para sua rotina profissional.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white" aria-label="Benefícios">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3"><div className="rounded-lg bg-blue-50 p-2.5 text-[#063b66]"><Users className="h-5 w-5" /></div><div><p className="text-lg font-bold text-slate-900">Atendimento centralizado</p><p className="text-sm text-slate-500">Informações sempre acessíveis</p></div></div>
            <div className="flex items-center gap-3"><div className="rounded-lg bg-red-50 p-2.5 text-[#c9212a]"><BarChart3 className="h-5 w-5" /></div><div><p className="text-lg font-bold text-slate-900">Acompanhamento simples</p><p className="text-sm text-slate-500">Status claro em cada etapa</p></div></div>
            <div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700"><Lock className="h-5 w-5" /></div><div><p className="text-lg font-bold text-slate-900">Ambiente protegido</p><p className="text-sm text-slate-500">Segurança em primeiro lugar</p></div></div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9212a]">Como funciona</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Uma jornada mais simples para o seu atendimento</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Recursos pensados para reduzir etapas e deixar você no controle das suas solicitações.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
                <div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#063b66] transition-colors group-hover:bg-[#063b66] group-hover:text-white"><feature.icon className="h-6 w-6" /></div><span className="text-sm font-bold text-slate-300">0{index + 1}</span></div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#c9212a]">{feature.eyebrow}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="regras" className="bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9212a]">Antes de agendar</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Regras claras para você se organizar</h2>
              <p className="mt-5 max-w-lg leading-7 text-slate-600">Consulte as condições do serviço antes de escolher seu horário. Assim, seu atendimento acontece com mais previsibilidade.</p>
              <Button onClick={goToLogin} className="mt-7 bg-[#063b66] font-semibold hover:bg-[#052f52]">Consultar disponibilidade <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {rules.map((rule) => <div key={rule} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#f7f9fc] p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><span className="text-sm font-medium leading-6 text-slate-700">{rule}</span></div>)}
            </div>
          </div>
        </section>

        <section className="bg-[#063b66] py-16 text-center text-white sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Pronto para começar?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tenha mais praticidade no seu atendimento</h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">Acesse o sistema e faça sua solicitação de forma rápida, segura e organizada.</p>
            <Button onClick={goToLogin} size="lg" className="mt-8 bg-white px-7 font-semibold text-[#063b66] hover:bg-blue-50">{isAuthenticated ? "Acessar meu painel" : "Entrar no sistema"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </section>
      </main>

      <footer id="contato" className="bg-[#032a49] py-12 text-blue-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
          <div><div className="flex items-center gap-3 text-white"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#063b66]"><Calendar className="h-4 w-4" /></span><span className="font-bold">Agendamento INSS</span></div><p className="mt-4 max-w-sm text-sm leading-6 text-blue-200">Sistema institucional de atendimento e agendamento integrado à OAB/SC.</p></div>
          <div><h3 className="font-semibold text-white">Atendimento</h3><p className="mt-3 text-sm leading-6 text-blue-200">centraldeatendimento@oab-sc.org.br<br />(48) 3239-3500</p></div>
          <div><h3 className="font-semibold text-white">Endereço</h3><p className="mt-3 text-sm leading-6 text-blue-200">Rua Paschoal Apóstolo Pítsica, 4860<br />Agronômica, Florianópolis - SC</p></div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-5 pt-6 text-xs text-blue-300 sm:px-8 lg:px-10">© 2026 Sistema de Agendamento INSS - OAB/SC. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
