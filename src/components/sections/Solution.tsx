import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BarChart3, ClipboardList, LayoutDashboard, ShieldCheck, Users, Workflow } from "lucide-react";

const solutions = [
  {
    icon: ClipboardList,
    title: "Jornada centralizada",
    description: "Consolide marcações, ajustes e horas extras em um só fluxo, sem depender de controles paralelos.",
  },
  {
    icon: BarChart3,
    title: "Fechamento mais organizado",
    description: "Acompanhe banco de horas, faltas e inconsistências ao longo do mês, em vez de concentrar tudo no fim.",
  },
  {
    icon: LayoutDashboard,
    title: "Visão operacional da equipe",
    description: "Dê contexto prático para RH, DP e gestores acompanharem atrasos, ausências e desvios da jornada.",
  },
  {
    icon: ShieldCheck,
    title: "Histórico de ajustes",
    description: "Registre alterações com contexto para consulta, conferência e acompanhamento quando necessário.",
  },
  {
    icon: Users,
    title: "Menos ruído entre áreas",
    description: "Padronize a leitura da jornada entre quem opera, aprova e fecha a folha.",
  },
  {
    icon: Workflow,
    title: "Decisão mais rápida",
    description: "Tenha informações mais claras para agir antes que erros de jornada virem custo.",
  },
] as const;

const Solution = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="solucao" className="bg-background py-24" aria-labelledby="solution-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Como a plataforma ajuda</span>
          <h2 id="solution-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Organize a jornada e ganhe clareza no fechamento.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A plataforma reúne rotina, ajustes e acompanhamento operacional em um fluxo mais simples para RH, DP e liderança.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {solutions.map((solution, index) => (
            <article
              key={solution.title}
              className={`flex gap-5 rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isVisible ? (index % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right") : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <solution.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{solution.title}</h3>
                <p className="leading-7 text-muted-foreground">{solution.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
