import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BarChart3, ClipboardList, LayoutDashboard, ShieldCheck } from "lucide-react";

const solutions = [
  {
    icon: ClipboardList,
    title: "Registro e acompanhamento da jornada",
    description:
      "Centralize informações da rotina da equipe em uma única plataforma, com menos dependência de controles paralelos.",
  },
  {
    icon: BarChart3,
    title: "Menos esforço no fechamento",
    description:
      "Organize horas extras, banco de horas, faltas e ajustes com mais clareza para o fechamento da folha.",
  },
  {
    icon: LayoutDashboard,
    title: "Visibilidade para RH e gestão",
    description:
      "Dê contexto operacional para quem precisa acompanhar a equipe e agir rápido em desvios da jornada.",
  },
  {
    icon: ShieldCheck,
    title: "Estrutura voltada à rastreabilidade",
    description:
      "Conte com recursos voltados à conferência, histórico de alterações e rotinas mais auditáveis.",
  },
];

const Solution = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="solucao" className="bg-background py-24" aria-labelledby="solution-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Como a plataforma ajuda</span>
          <h2 id="solution-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Mais controle da jornada, menos ruído operacional no RH.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A proposta é simples: dar previsibilidade para a rotina de ponto e melhorar a qualidade das informações usadas no
            fechamento e na gestão diária.
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
