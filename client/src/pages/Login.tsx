import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.loginWithSOAP.useMutation({
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      setError(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cpf || !password) {
      setError("CPF e senha são obrigatórios");
      return;
    }

    loginMutation.mutate({ cpf, password });
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden border">
        
        {/* Lado Esquerdo - Visual OAB */}
        <div className="md:w-1/2 bg-[#004a80] p-8 flex flex-col items-center justify-center text-white text-center">
          <img 
            src="https://portal.oab-sc.org.br/site/images/img-01.png" 
            alt="Cartão OAB" 
            className="w-64 h-auto mb-6 drop-shadow-xl animate-in fade-in zoom-in duration-700"
          />
          <h2 className="text-2xl font-bold mb-2">Sistema de Agendamento</h2>
          <p className="text-blue-100 opacity-80 max-w-xs">
            Acesso exclusivo para advogados(as) regularmente inscritos(as) na OAB/SC.
          </p>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="md:w-1/2 p-8 lg:p-12">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-500">Acesse com suas credenciais OAB/SC</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700">
                CPF
              </label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                disabled={loginMutation.isPending}
                className="h-12 border-gray-300 focus:ring-[#004a80] focus:border-[#004a80]"
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha da OAB/SC"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className="h-12 border-gray-300 focus:ring-[#004a80] focus:border-[#004a80]"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#004a80] hover:bg-[#003366] text-white h-12 text-lg font-bold transition-all shadow-lg hover:shadow-xl"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Autenticando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3 text-gray-500">
                <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Seus dados são processados com segurança através da integração oficial com a base da OAB/SC.
                </p>
              </div>
            </div>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400">
               © 2026 OAB/SC - Todos os direitos reservados
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
