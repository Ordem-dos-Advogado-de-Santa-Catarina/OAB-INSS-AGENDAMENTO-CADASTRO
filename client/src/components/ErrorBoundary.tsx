import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md text-center p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl font-semibold mb-3">Algo deu errado</h2>

            <p className="text-muted-foreground mb-2">
              Ocorreu um erro inesperado. Isso pode ter sido causado por uma
              extensão do navegador ou problema temporário.
            </p>

            <p className="text-muted-foreground text-sm mb-8">
              Tente recarregar a página. Se o problema persistir, desative
              extensões do navegador (como tradutores ou bloqueadores de
              anúncios) e tente novamente.
            </p>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer text-base font-medium"
              )}
            >
              <RotateCcw size={18} />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
