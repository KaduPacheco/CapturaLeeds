import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Zap, ShieldCheck, Users, Timer } from "lucide-react";

const benefits = [
  { 
    icon: Timer, 
    title: "Economia de 80% do tempo", 
    description: "O que levava dias para ser conferido pelo RH agora é feito em minutos. Foque no estratégico." 
  },
  { 
    icon: Zap, 
    title: "Fechamento sem erros", 
    description: "Cálculos matemáticos exatos de adicionais, DSR, faltas e horas extras sem intervenção manual." 
  },
  { 
    icon: ShieldCheck, 
    title: "Minimização de riscos", 
    description: "Espelhos de ponto confiáveis e histórico inalterável que blindam sua empresa juridicamente." 
  },
  { 
    icon: Users, 
    title: "Engajamento da equipe", 
    description: "Transparência total para o funcionário, que acompanha seu saldo de horas no próprio celular." 
  },
];

const Benefits = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-muted/30">
      <div className="container" ref={ref}>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-sm font-bold text-secondary uppercase tracking-widest">Retorno sobre investimento</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-3 leading-tight">
            Por que empresas eficientes <span className="text-secondary">escolhem nosso sistema?</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`text-center p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 shadow-sm hover:shadow-lg transition-all duration-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <b.icon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-3">{b.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
