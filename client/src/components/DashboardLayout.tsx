import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users, CalendarDays, ClipboardList, ShieldCheck, Lock, Mail, MessageSquare, FileText, CheckCircle } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Painel Principal", path: "/dashboard" },
  { icon: FileText, label: "Cadastro OAB INSS", path: "/forms/new" },
  { icon: ClipboardList, label: "Solicitação TCMS", path: "/forms/tcms" },
  { icon: CheckCircle, label: "Status Cadastro INSS", path: "/forms/status" },
  { icon: CalendarDays, label: "Meus Agendamentos", path: "/my-appointments" },
  { icon: MessageSquare, label: "Mensagens", path: "/messages" },
];

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Painel Principal", path: "/admin" },
  { icon: FileText, label: "Cadastros INSS TCMS", path: "/admin/forms" },
  { icon: CalendarDays, label: "Calendário", path: "/admin/calendar" },
  { icon: ClipboardList, label: "Atendimentos do Dia", path: "/admin/daily" },
  { icon: MessageSquare, label: "Mensagens", path: "/messages" },
  { icon: Lock, label: "Gerenciar Bloqueios", path: "/admin/blocks" },
  { icon: Mail, label: "Modelos de E-mail", path: "/admin/email-settings" },
  { icon: ShieldCheck, label: "Configurações", path: "/admin/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white rounded-xl shadow-lg border">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#004a80] rounded-full flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-center text-gray-900">
              Sessão Expirada
            </h1>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              Sua sessão não é mais válida. Por favor, realize o login novamente para acessar o sistema.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full bg-[#004a80] hover:bg-[#003366] text-white shadow-lg hover:shadow-xl transition-all"
          >
            Ir para o Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-gray-200"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-20 justify-center border-b border-gray-100 bg-[#004a80]">
            <div className="flex items-center gap-3 px-3 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-5 w-5 text-white" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold tracking-tight truncate text-white uppercase text-sm">
                    OAB/SC Agendamento
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-white">
            <SidebarMenu className="px-2 py-4">
              {/* Seção de Usuário - Oculta para Administradores */}
              {user?.role !== 'admin' && (
                <>
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Área do(a) Advogado(a)
                  </div>
                  {menuItems.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-11 transition-all rounded-lg mb-1 ${isActive ? "bg-blue-50 text-[#004a80] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isActive ? "text-[#004a80]" : ""}`}
                          />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}

              {/* Seção de Administrador */}
              {user?.role === 'admin' && (
                <>
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Gestão Administrativa
                  </div>
                  {adminMenuItems.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-11 transition-all rounded-lg mb-1 ${isActive ? "bg-blue-50 text-[#004a80] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isActive ? "text-[#004a80]" : ""}`}
                          />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-gray-100 bg-gray-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-200 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                    <AvatarFallback className="bg-[#004a80] text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-bold truncate text-gray-900 leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-1">
                      {user?.role === 'admin' ? 'Administrador' : 'Advogado(a)'}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600 focus:text-red-700 font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#004a80]/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-white">
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-white px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-gray-100" />
              <span className="font-bold text-[#004a80] text-sm uppercase">
                {activeMenuItem?.label ?? "OAB/SC"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </SidebarInset>
    </>
  );
}
