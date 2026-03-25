import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Zap, ShieldCheck, Users, Timer } from "lucide-react";

const benefits = [
  { icon: Timer, title: "Economia de tempo", description: "Reduza em 90% o tempo gasto com controle de ponto." },
  { icon: Zap, title: "Redução de erros", description: "Elimine erros humanos no registro e cálculo de horas." },
  { icon: ShieldCheck, title: "Segurança jurídica", description: "Registros digitais válidos perante a legislação trabalhista." },
  { icon: Users, title: "Mais controle da equipe", description: "Acompanhe a jornada de todos os colaboradores em tempo real." },
];

const Benefits = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-20 bg-section-alt">
      <div className="container" ref={ref}>
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Benefícios</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Por que mais de <span className="text-secondary">500 empresas</span> já usam?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`text-center p-8 rounded-xl bg-card border hover:border-secondary/40 transition-colors ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                <b.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
