import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackAnalyticsEvent } from "@/services/analyticsService";

const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
      <div className="container relative z-10 text-center">
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight md:text-5xl">Simplifique o seu RH ainda hoje</h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl font-medium text-primary-foreground/80 md:text-2xl">
          Diga adeus ao controle manual, as planilhas sujeitas a erros e ao risco trabalhista.
        </p>

        <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Button
            size="lg"
            variant="hero"
            className="h-14 w-full rounded-xl px-10 text-lg font-bold shadow-xl transition-transform hover:scale-105 sm:w-auto"
            asChild
          >
            <a
              href="#contato"
              onClick={() =>
                trackAnalyticsEvent({
                  eventName: "cta_click",
                  payload: {
                    cta_id: "final_cta_primary",
                    cta_label: "comecar_teste_gratis",
                    cta_location: "final_cta",
                    cta_target: "#contato",
                  },
                })
              }
            >
              Comecar teste gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-primary-foreground/80">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-white" /> Implantacao em horas
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-white" /> Cancele quando quiser
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-white" /> Suporte humanizado
          </span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
