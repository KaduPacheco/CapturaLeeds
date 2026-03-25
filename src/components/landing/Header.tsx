import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-hero-gradient flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">Ponto Eletrônico</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#problemas" className="hover:text-foreground transition-colors">Problemas</a>
          <a href="#solucao" className="hover:text-foreground transition-colors">Solução</a>
          <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
          <a href="#contato" className="hover:text-foreground transition-colors">Contato</a>
        </nav>
        <Button variant="cta" size="sm" asChild>
          <a href="#contato">Testar Grátis</a>
        </Button>
      </div>
    </header>
  );
};

export default Header;
