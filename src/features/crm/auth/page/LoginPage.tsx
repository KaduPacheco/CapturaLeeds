import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/infra/supabase/client";
import { useAuth } from "@/features/crm/auth/hooks/useAuth";
import { CRM_ROUTES } from "@/features/crm/shared/constants/routes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      navigate(CRM_ROUTES.root, { replace: true });
    }
  }, [session, navigate]);

  const from = location.state?.from?.pathname || CRM_ROUTES.root;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no Login",
          description: error.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });

      navigate(from, { replace: true });
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">CRM CapturaLeeds</h1>
          <p className="mt-2 text-muted-foreground">Acesse sua conta para gerenciar seus leads</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">Senha</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
          </div>

          <Button type="submit" className="h-12 w-full text-lg" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Acessar Sistema
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Acesso exclusivo para administradores autorizados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
