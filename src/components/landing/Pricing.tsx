import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Check, Clock, Zap } from "lucide-react";

const features = [
  "Registro de ponto digital",
  "Relatórios automáticos",
  "Controle de horas extras",
  "Banco de horas",
  "App mobile",
  "Suporte humanizado",
  "Acesso via celular ou PC",
];

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="precos" className="py-20 bg-section-alt">
      <div className="container" ref={ref}>
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Preço especial</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Invista menos do que o custo de{" "}
            <span className="text-destructive">um único erro</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Um processo trabalhista pode custar milhares de reais. Nosso sistema custa menos que um almoço por dia.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div
            className={`relative rounded-2xl bg-hero-gradient text-primary-foreground shadow-2xl overflow-hidden ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            {/* Badge promoção */}
            <div className="absolute top-0 right-0">
              <div className="bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-bl-xl flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Promoção por tempo limitado
              </div>
            </div>

            <div className="p-10 pt-14">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-secondary" />
                <h3 className="text-xl font-bold">Plano Completo</h3>
              </div>
              <p className="text-sm opacity-80 mb-6">Tudo que você precisa para controlar a jornada da sua equipe</p>

              <div className="mb-2">
                <span className="text-5xl font-extrabold">R$59,90</span>
                <span className="text-lg opacity-70">/mês</span>
              </div>
              <p className="text-sm opacity-80 mb-2">Para até 5 funcionários</p>
              <p className="text-sm opacity-90 font-semibold mb-8 bg-primary-foreground/10 inline-block px-3 py-1 rounded-lg">
                + R$7,00 por funcionário adicional
              </p>

              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 shrink-0 text-secondary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant="hero"
                className="w-full h-14 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                asChild
              >
                <a href="#contato">Garantir minha vaga com desconto</a>
              </Button>

              <p className="text-center text-xs opacity-70 mt-4">
                ⚡ Preço promocional válido por tempo limitado. Teste grátis por 7 dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
