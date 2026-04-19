// Preservado fora do fluxo principal da landing para referência editorial e rollback seguro.
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ShieldCheck, Timer, Users, Zap } from "lucide-react";

const benefits = [
  {
    icon: Timer,
    title: "Economia de 80% do tempo",
    description: "O que levava dias para ser conferido pelo RH agora é feito em minutos. Foque no estratégico.",
  },
  {
    icon: Zap,
    title: "Fechamento sem erros",
    description: "Cálculos matemáticos exatos de adicionais, DSR, faltas e horas extras sem intervenção manual.",
  },
  {
    icon: ShieldCheck,
    title: "Minimização de riscos",
    description: "Espelhos de ponto confiáveis e histórico inalterável que blindam sua empresa juridicamente.",
  },
  {
    icon: Users,
    title: "Engajamento da equipe",
    description: "Transparência total para o funcionário, que acompanha seu saldo de horas no próprio celular.",
  },
] as const;

const Benefits = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="bg-muted/30 py-24">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-secondary">Retorno sobre investimento</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Por que empresas eficientes <span className="text-secondary">escolhem nosso sistema?</span>
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:border-secondary/50 hover:shadow-lg ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <benefit.icon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-foreground">{benefit.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
