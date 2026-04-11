import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import heroMockup from "@/assets/images/hero-mockup.png";
import { trackAnalyticsEvent } from "@/services/analyticsService";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient pb-16 pt-24 text-foreground md:pb-24 md:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />
      <div className="container relative z-10">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="text-left text-primary-foreground">
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              O controle de ponto que o seu <span className="text-secondary">RH sempre pediu</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed opacity-90 md:text-xl">
              Sistema de ponto eletronico corporativo para pequenas e medias empresas. Simplifique o uso de
              planilhas, ajude a reduzir passivos trabalhistas e agilize o fechamento da folha.
            </p>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <Button
                variant="hero"
                size="lg"
                className="h-14 rounded-lg px-10 text-base font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1"
                asChild
              >
                <a
                  href="#contato"
                  onClick={() =>
                    trackAnalyticsEvent({
                      eventName: "cta_click",
                      payload: {
                        cta_id: "hero_primary_cta",
                        cta_label: "comecar_teste_gratis",
                        cta_location: "hero",
                        cta_target: "#contato",
                      },
                    })
                  }
                >
                  Comecar teste gratis
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-5 text-sm font-medium opacity-80">
              {[
                "Adequado as portarias do MTE",
                "Teste gratis de 14 dias",
                "Suporte corporativo agil",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 to-secondary/30 blur opacity-25 transition duration-1000 group-hover:opacity-50" />
            <img
              src={heroMockup}
              alt="Dashboard do sistema Ponto Eletronico corporativo"
              width={1280}
              height={800}
              className="relative w-full rounded-xl border border-border/50 bg-card shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
