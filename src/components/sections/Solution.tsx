import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MonitorSmartphone, FileText, Settings, ShieldCheck } from "lucide-react";

const solutions = [
  {
    icon: MonitorSmartphone,
    title: "Registro Multiplataforma",
    description: "Web, celular ou tablet. Registro de ponto com geolocalização e reconhecimento facial para evitar fraudes.",
  },
  {
    icon: FileText,
    title: "Fechamento Inteligente",
    description: "Relatórios de jornada, horas extras e banco de horas calculados automaticamente em poucos cliques.",
  },
  {
    icon: Settings,
    title: "Gestão Unificada",
    description: "Painel centralizado onde o gestor aprova atestados, ajustes manuais e acompanha a equipe em tempo real.",
  },
  {
    icon: ShieldCheck,
    title: "100% Dentro da Lei",
    description: "Sistema rigorosamente adequado às portarias do Ministério do Trabalho e Emprego (MTE).",
  },
];

const Solution = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="solucao" className="py-24 bg-background">
      <div className="container" ref={ref}>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-sm font-bold text-primary uppercase tracking-widest">Plataforma Completa</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-3 leading-tight">
            Tecnologia moderna para <span className="text-primary">simplificar sua gestão de RH</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Substitua processos manuais por um software desenhado para oferecer segurança, velocidade e clareza.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-8 lg:gap-12">
          {solutions.map((s, i) => (
            <div
              key={s.title}
              className={`flex gap-6 p-8 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isVisible ? (i % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right") : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground mb-2">{s.title}</h3>
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
