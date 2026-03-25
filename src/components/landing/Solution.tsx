import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Fingerprint, BarChart3, Clock, Smartphone } from "lucide-react";

const solutions = [
  {
    icon: Fingerprint,
    title: "Registro digital de ponto",
    description: "Seus funcionários batem o ponto com um clique. Sem papel, sem erro.",
  },
  {
    icon: BarChart3,
    title: "Relatórios automáticos",
    description: "Relatórios de jornada prontos em segundos. Exporte para PDF ou Excel.",
  },
  {
    icon: Clock,
    title: "Controle de horas extras",
    description: "Calcule automaticamente horas extras, banco de horas e faltas.",
  },
  {
    icon: Smartphone,
    title: "Acesso via celular ou PC",
    description: "Funciona em qualquer dispositivo. Sem instalação, sem complicação.",
  },
];

const Solution = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="solucao" className="py-20">
      <div className="container" ref={ref}>
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">A solução</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Tudo que você precisa para{" "}
            <span className="text-gradient">controlar a jornada</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            O Ponto Eletrônico resolve seus problemas de controle de ponto em minutos, não em semanas.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {solutions.map((s, i) => (
            <div
              key={s.title}
              className={`flex gap-5 p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow ${isVisible ? (i % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right") : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <s.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
