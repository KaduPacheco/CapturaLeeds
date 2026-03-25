import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AlertTriangle, Clock, FileWarning, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: FileWarning,
    title: "Controle manual gera erros",
    description: "Planilhas e papéis acumulam erros que custam caro no final do mês.",
  },
  {
    icon: AlertTriangle,
    title: "Risco de processos trabalhistas",
    description: "Sem registros confiáveis, sua empresa fica vulnerável a ações judiciais.",
  },
  {
    icon: Clock,
    title: "Falta de controle de horas extras",
    description: "Horas extras não registradas significam pagamentos indevidos ou multas.",
  },
  {
    icon: TrendingDown,
    title: "Perda de produtividade",
    description: "Horas gastas conferindo folhas de ponto que poderiam ser investidas no negócio.",
  },
];

const Problems = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="problemas" className="py-20 bg-section-alt">
      <div className="container" ref={ref}>
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-destructive uppercase tracking-wider">O problema</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Controle manual de ponto está{" "}
            <span className="text-destructive">custando caro</span> para sua empresa
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((p, i) => (
            <div
              key={p.title}
              className={`bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <p.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;
