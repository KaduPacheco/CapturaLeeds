import { Button } from "@/components/ui/Button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/services/analyticsService";
import { Check, CircleHelp, Clock, Zap } from "lucide-react";

const features = [
  "Registro de ponto digital",
  "Relatórios de jornada e fechamento",
  "Controle de horas extras e banco de horas",
  "Acesso por celular ou computador",
  "Suporte humano para os primeiros passos",
];

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="precos" className="bg-section-alt py-24" aria-labelledby="pricing-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Plano de entrada</span>
          <h2 id="pricing-title" className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">
            Um ponto de partida claro para empresas que estão digitalizando o controle de jornada.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Mantivemos a oferta objetiva: valor base acessível, teste grátis e crescimento conforme o tamanho da equipe, sem
            linguagem promocional vaga.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" />
              Ideal para empresas iniciando a digitalização do ponto
            </div>

            <h3 className="text-2xl font-bold text-foreground md:text-3xl">Plano Completo</h3>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Para empresas que precisam organizar jornada, ganhar visibilidade operacional e reduzir retrabalho no fechamento da folha.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-3">
              <span className="text-5xl font-extrabold text-foreground">R$ 59,90</span>
              <span className="pb-1 text-lg text-muted-foreground">/mês para até 5 funcionários</span>
            </div>

            <p className="mt-3 inline-flex rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground">
              + R$ 7,00 por funcionário adicional
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`relative overflow-hidden rounded-[2rem] bg-hero-gradient p-10 text-primary-foreground shadow-2xl ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <div className="absolute right-0 top-0">
              <div className="flex items-center gap-1.5 rounded-bl-xl bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                <Clock className="h-3.5 w-3.5" />
                Teste grátis de 14 dias
              </div>
            </div>

            <div className="mb-8 pt-6">
              <h3 className="text-2xl font-bold">O que essa faixa de preço resolve</h3>
              <p className="mt-3 text-primary-foreground/82">
                Dá previsibilidade para começar, sem amarrar a operação a uma decisão longa antes de validar aderência no dia a dia.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/10 p-5">
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm leading-6 text-primary-foreground/88">
                  A cobrança cresce conforme o número de funcionários, o que facilita o encaixe para empresas em expansão.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm leading-6 text-primary-foreground/88">
                  O teste grátis ajuda a avaliar a rotina antes de avançar com uma contratação comercial.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm leading-6 text-primary-foreground/88">
                  Na demonstração, o time comercial valida o cenário da empresa e orienta o melhor próximo passo.
                </p>
              </div>
            </div>

            <Button
              variant="hero"
              className="mt-8 h-14 w-full rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
              asChild
            >
              <a
                href="#contato"
                onClick={() => {
                  void trackCtaClick({
                    cta_id: "pricing_cta_solicitar_demonstracao",
                    cta_label: "Solicitar demonstração de preço",
                    placement: "pricing",
                    target: "#contato",
                  });
                }}
              >
                Solicitar demonstração
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
