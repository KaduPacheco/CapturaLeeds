import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackAnalyticsEvent } from "@/services/analyticsService";

interface HeaderProps {
  hideCTA?: boolean;
}

const Header = ({ hideCTA = false }: HeaderProps) => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Ponto Eletronico</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#problemas" className="transition-colors hover:text-foreground">
            Problemas
          </a>
          <a href="#solucao" className="transition-colors hover:text-foreground">
            Solucao
          </a>
          <a href="#precos" className="transition-colors hover:text-foreground">
            Precos
          </a>
          <a href="#contato" className="transition-colors hover:text-foreground">
            Contato
          </a>
        </nav>

        {!hideCTA && (
          <Button variant="cta" size="sm" asChild>
            <a
              href="#contato"
              onClick={() =>
                trackAnalyticsEvent({
                  eventName: "cta_click",
                  payload: {
                    cta_id: "header_primary_cta",
                    cta_label: "testar_gratis",
                    cta_location: "header",
                    cta_target: "#contato",
                  },
                })
              }
            >
              Testar gratis
            </a>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
