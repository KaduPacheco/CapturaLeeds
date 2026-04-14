import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/infra/supabase/client";
import { useAuth } from "@/features/crm/auth/hooks/useAuth";
import { CRM_ROUTES } from "@/features/crm/shared/constants/routes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { LogIn } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Se já houver sessão, redireciona para longe do login
  useEffect(() => {
    if (session) {
      navigate(CRM_ROUTES.root, { replace: true });
    }
  }, [session, navigate]);

  // Rota de onde o usuário veio, ou dashboard por padrão
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
    } catch (error) {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">CRM CapturaLeeds</h1>
          <p className="text-muted-foreground mt-2">Acesse sua conta para gerenciar seus leads</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
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
              <label htmlFor="password"  className="block text-sm font-medium mb-1">Senha</label>
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

          <Button 
            type="submit" 
            className="w-full h-12 text-lg" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Acessar Sistema
              </span>
            )}
          </Button>
        </form>
        
        <p className="text-center text-xs text-muted-foreground">
          🔒 Acesso exclusivo para administradores autorizados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
