import { Button } from "@/components/ui/Button";
import heroMockup from "@/assets/images/hero-mockup.png";
import { trackCtaClick } from "@/services/analyticsService";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

const primaryProofs = [
  "Teste grátis de 14 dias",
  "Implantação assistida",
  "Fluxo pensado para RH, DP e gestores",
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero-gradient pb-16 pt-28 text-foreground md:pb-24 md:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.07)_0%,_transparent_58%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/15 to-transparent" />

      <div className="container relative z-10">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
          <div className="text-primary-foreground">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              Controle de jornada com mais clareza para pequenas e médias empresas
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Feche a folha com menos retrabalho e mais controle da jornada.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/88 md:text-xl">
              Um software de ponto eletrônico para empresas que precisam reduzir erros de jornada, acompanhar horas extras com
              mais previsibilidade e dar visibilidade em tempo real para RH, DP e gestores.
            </p>

            <ul className="mt-8 grid gap-3 text-sm font-medium text-primary-foreground/90 sm:grid-cols-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                Menos conferência manual no fechamento da folha
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                Histórico auditável para ajustes e conferências
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                Visão operacional de atrasos, faltas e banco de horas
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                Mais segurança para rotinas sensíveis do DP
              </li>
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button variant="hero" size="lg" className="h-14 rounded-xl px-8 text-base font-semibold shadow-xl" asChild>
                <a
                  href="#contato"
                  onClick={() => {
                    void trackCtaClick({
                      cta_id: "hero_cta_solicitar_demonstracao",
                      cta_label: "Solicitar demonstração",
                      placement: "hero",
                      target: "#contato",
                    });
                  }}
                >
                  Solicitar demonstração
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-xl border-primary-foreground/25 bg-primary-foreground/8 px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/12 hover:text-primary-foreground"
                asChild
              >
                <a
                  href="#contato"
                  onClick={() => {
                    void trackCtaClick({
                      cta_id: "hero_cta_teste_gratis",
                      cta_label: "Quero testar grátis",
                      placement: "hero",
                      target: "#contato",
                    });
                  }}
                >
                  Quero testar grátis
                </a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-primary-foreground/80">
              {primaryProofs.map((item) => (
                <span key={item} className="rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary/25 via-secondary/20 to-primary/25 opacity-40 blur-xl transition duration-1000 group-hover:opacity-60" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border/40 bg-card/95 p-3 shadow-2xl">
              <img
                src={heroMockup}
                alt="Painel da plataforma de controle de ponto com visão operacional da jornada"
                width={1280}
                height={800}
                className="w-full rounded-[1.2rem] border border-border/50 bg-card"
              />
              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-white">Mais previsibilidade para a rotina de RH e gestão</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Acompanhe jornadas, banco de horas e pendências com uma visão única, sem depender de planilhas dispersas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
