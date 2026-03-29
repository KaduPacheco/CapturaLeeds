import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AlertCircle, FileSpreadsheet, Hourglass, EyeOff } from "lucide-react";

const problems = [
  {
    icon: FileSpreadsheet,
    title: "Planilhas e retrabalho",
    description: "Seu RH gasta horas preciosas cruzando dados manuais para fechar a folha, um esforço que custa caro.",
  },
  {
    icon: AlertCircle,
    title: "Passivo trabalhista",
    description: "Controle informal ou em papel abre brechas gigantescas para processos trabalhistas indesejados.",
  },
  {
    icon: Hourglass,
    title: "Horas extras descontroladas",
    description: "Falta de precisão no registro gera pagamentos indevidos e afeta diretamente a margem da empresa.",
  },
  {
    icon: EyeOff,
    title: "Gestores às cegas",
    description: "Sem visibilidade em tempo real de quem faltou ou atrasou, a operação da empresa é prejudicada.",
  },
];

const Problems = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="problemas" className="py-24 bg-muted/30">
      <div className="container" ref={ref}>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-sm font-bold text-destructive uppercase tracking-widest">A Realidade</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-3 leading-tight">
            O controle amador está consumindo o <span className="text-destructive">lucro e o tempo</span> da sua empresa
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((p, i) => (
            <div
              key={p.title}
              className={`bg-card rounded-xl p-8 border border-border hover:border-destructive/30 shadow-sm hover:shadow-md transition-all ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-6">
                <p.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;
