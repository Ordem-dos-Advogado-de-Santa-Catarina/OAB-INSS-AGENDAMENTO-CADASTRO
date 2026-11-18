import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import type { ComponentType } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyAppointments from "./pages/MyAppointments";
import DailyAppointments from "./pages/admin/DailyAppointments";
import BlockManagement from "./pages/admin/BlockManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Settings from "./pages/admin/Settings";
import AdminCalendar from "./pages/admin/Calendar";
import EmailSettings from "./pages/admin/EmailSettings";
import Messages from "./pages/Messages";
import UserForm from "./pages/forms/UserForm";
import TCMSUpdateForm from "./pages/forms/TCMSUpdateForm";
import FormStatus from "./pages/FormStatus";
import FormDetailsView from "./pages/forms/FormDetailsView";
import AdminFormsList from "./pages/admin/forms/AdminFormsList";
import DocumentosEscritas from "./pages/DocumentosEscritas";
import { useAuth } from "./_core/hooks/useAuth";

function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  if (loading) return null;
  return user ? <Component /> : <Redirect to="/login" />;
}

function AdminRoute({ component: Component }: { component: ComponentType }) {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  if (loading) return null;
  return user?.role === "admin" ? <Component /> : <Redirect to="/dashboard" />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path={"/forms/new"} component={() => <ProtectedRoute component={UserForm} />} />
      <Route path={"/forms/tcms"} component={() => <ProtectedRoute component={TCMSUpdateForm} />} />
      <Route path={"/forms/status"} component={() => <ProtectedRoute component={FormStatus} />} />
      <Route path={"/documentos"} component={() => <ProtectedRoute component={DocumentosEscritas} />} />
      <Route path={"/forms/view/:id"} component={() => <ProtectedRoute component={FormDetailsView} />} />
      <Route path={"/my-appointments"} component={() => <ProtectedRoute component={MyAppointments} />} />
      <Route path={"/messages"} component={() => <ProtectedRoute component={Messages} />} />
      <Route path={"/admin/daily"} component={() => <AdminRoute component={DailyAppointments} />} />
      <Route path={"/admin/forms"} component={() => <AdminRoute component={AdminFormsList} />} />
      <Route path={"/admin/blocks"} component={() => <AdminRoute component={BlockManagement} />} />
      <Route path={"/admin"} component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path={"/admin/settings"} component={() => <AdminRoute component={Settings} />} />
      <Route path={"/admin/calendar"} component={() => <AdminRoute component={AdminCalendar} />} />
      <Route path={"/admin/email-settings"} component={() => <AdminRoute component={EmailSettings} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
