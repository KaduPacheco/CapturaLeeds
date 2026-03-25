import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Para micro empresas",
    price: "59,90",
    employees: "Até 5 funcionários",
    features: ["Registro de ponto digital", "Relatórios básicos", "Suporte por e-mail", "App mobile"],
    highlighted: false,
  },
  {
    name: "Profissional",
    description: "O mais escolhido",
    price: "99,90",
    employees: "Até 20 funcionários",
    features: ["Tudo do Starter", "Horas extras automáticas", "Banco de horas", "Relatórios avançados", "Suporte prioritário"],
    highlighted: true,
  },
  {
    name: "Empresarial",
    description: "Para equipes maiores",
    price: "189,90",
    employees: "Até 50 funcionários",
    features: ["Tudo do Profissional", "Multi-unidades", "API de integração", "Gerente de conta dedicado", "SLA garantido"],
    highlighted: false,
  },
];

const Pricing = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="precos" className="py-20 bg-section-alt">
      <div className="container" ref={ref}>
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Preços</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Invista menos do que o custo de{" "}
            <span className="text-destructive">um único erro</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Um processo trabalhista pode custar milhares de reais. Nosso sistema custa menos que um almoço por dia.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border transition-shadow ${
                p.highlighted
                  ? "bg-hero-gradient text-primary-foreground shadow-xl scale-105 border-transparent"
                  : "bg-card hover:shadow-lg"
              } ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {p.highlighted && (
                <span className="inline-block text-xs font-bold uppercase tracking-wider bg-secondary rounded-full px-3 py-1 mb-4 text-secondary-foreground">
                  Mais popular
                </span>
              )}
              <h3 className={`text-xl font-bold ${p.highlighted ? "" : "text-foreground"}`}>{p.name}</h3>
              <p className={`text-sm mt-1 ${p.highlighted ? "opacity-80" : "text-muted-foreground"}`}>{p.description}</p>
              <div className="mt-6 mb-2">
                <span className="text-4xl font-extrabold">R${p.price}</span>
                <span className={`text-sm ${p.highlighted ? "opacity-70" : "text-muted-foreground"}`}>/mês</span>
              </div>
              <p className={`text-sm mb-6 ${p.highlighted ? "opacity-80" : "text-muted-foreground"}`}>{p.employees}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 shrink-0 ${p.highlighted ? "text-secondary" : "text-secondary"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlighted ? "hero" : "cta"}
                className={`w-full h-12 rounded-xl ${p.highlighted ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" : ""}`}
                asChild
              >
                <a href="#contato">Começar agora</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
