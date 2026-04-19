import { Button } from "@/components/ui/Button";
import { Clock } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  hideCTA?: boolean;
}

const navItems = [
  { label: "Problemas", hash: "#problemas" },
  { label: "Solução", hash: "#solucao" },
  { label: "Preços", hash: "#precos" },
  { label: "FAQ", hash: "#faq" },
  { label: "Contato", hash: "#contato" },
] as const;

const Header = ({ hideCTA = false }: HeaderProps) => {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const resolveTarget = (hash: string) => (isLanding ? hash : `/${hash}`);
  const contactTarget = resolveTarget("#contato");

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-card/85 backdrop-blur-lg">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Pular para o conteúdo
      </a>
      <div className="container flex min-h-[4.5rem] flex-wrap items-center justify-between gap-2 py-3 md:flex-nowrap md:gap-4">
        <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Página inicial da Ponto Eletrônico">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hero-gradient shadow-lg shadow-primary/20 sm:h-10 sm:w-10">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-base font-bold leading-none text-foreground sm:text-lg">Ponto Eletrônico</span>
            <span className="hidden text-xs text-muted-foreground md:block">Controle de jornada para empresas</span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.hash} href={resolveTarget(item.hash)} className="transition-colors hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>

        {!hideCTA ? (
          <Button variant="cta" size="sm" className="w-full px-3 text-sm sm:w-auto sm:px-4 sm:text-base" asChild>
            <a href={contactTarget}>Solicitar demonstração</a>
          </Button>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
