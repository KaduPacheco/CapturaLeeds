import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AlertCircle, EyeOff, FileSpreadsheet, Hourglass } from "lucide-react";

const problems = [
  {
    icon: FileSpreadsheet,
    title: "Fechamento da folha com retrabalho",
    description:
      "Quando o controle da jornada depende de conferência manual, o time de RH perde horas conciliando informações e corrigindo inconsistências.",
  },
  {
    icon: AlertCircle,
    title: "Erros de jornada que viram custo",
    description:
      "Ajustes feitos em cima da hora e registros mal acompanhados aumentam o risco de pagamentos indevidos e discussões futuras.",
  },
  {
    icon: Hourglass,
    title: "Horas extras sem previsibilidade",
    description:
      "Sem uma visão clara da rotina da equipe, o gestor descobre desvios tarde demais e perde margem operacional no mês.",
  },
  {
    icon: EyeOff,
    title: "Falta de visibilidade gerencial",
    description:
      "Atrasos, faltas, banco de horas e pendências ficam pulverizados, o que dificulta decisões rápidas no dia a dia da operação.",
  },
];

const Problems = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="problemas" className="bg-muted/30 py-24" aria-labelledby="problems-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-destructive">Onde a rotina trava</span>
          <h2 id="problems-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            O problema não é só registrar o ponto. É ter confiança no fechamento.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Empresas que ainda operam com controles frágeis costumam pagar a conta em horas perdidas, decisões lentas e mais
            exposição em rotinas sensíveis do DP.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, index) => (
            <article
              key={problem.title}
              className={`rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:border-destructive/30 hover:shadow-md ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-foreground">{problem.title}</h3>
              <p className="leading-7 text-muted-foreground">{problem.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;
