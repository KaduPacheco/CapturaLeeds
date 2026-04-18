import { Button } from "@/components/ui/Button";
import { trackCtaClick } from "@/services/analyticsService";
import { Clock } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  hideCTA?: boolean;
}

const navItems = [
  { label: "Desafios", hash: "#problemas", id: "header_nav_problemas" },
  { label: "Solução", hash: "#solucao", id: "header_nav_solucao" },
  { label: "Preços", hash: "#precos", id: "header_nav_precos" },
  { label: "FAQ", hash: "#faq", id: "header_nav_faq" },
  { label: "Contato", hash: "#contato", id: "header_nav_contato" },
] as const;

const Header = ({ hideCTA = false }: HeaderProps) => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const resolveTarget = (hash: string) => (isLanding ? hash : `/${hash}`);

  const trackHeaderClick = (ctaId: string, ctaLabel: string, target: string) => {
    void trackCtaClick({
      cta_id: ctaId,
      cta_label: ctaLabel,
      placement: "header",
      target,
    });
  };

  const primaryTarget = resolveTarget("#contato");

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-card/85 backdrop-blur-lg">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Pular para o conteúdo
      </a>
      <div className="container flex min-h-[4.5rem] items-center justify-between gap-4 py-3">
        <a href="/" className="flex items-center gap-3" aria-label="Página inicial da Ponto Eletrônico">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hero-gradient shadow-lg shadow-primary/20">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none text-foreground">Ponto Eletrônico</span>
            <span className="hidden text-xs text-muted-foreground sm:block">Controle de jornada para empresas</span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Navegação principal">
          {navItems.map((item) => {
            const target = resolveTarget(item.hash);

            return (
              <a
                key={item.id}
                href={target}
                className="transition-colors hover:text-foreground"
                onClick={() => trackHeaderClick(item.id, item.label, target)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {!hideCTA ? (
          <Button variant="cta" size="sm" asChild>
            <a
              href={primaryTarget}
              onClick={() => trackHeaderClick("header_cta_solicitar_demonstracao", "Solicitar demonstração", primaryTarget)}
            >
              Solicitar demonstração
            </a>
          </Button>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
