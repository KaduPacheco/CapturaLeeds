import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BriefcaseBusiness, DatabaseBackup, FileSignature, HeartHandshake, Lock, Shield, Waypoints } from "lucide-react";

const trustPillars = [
  {
    icon: Shield,
    title: "Conformidade operacional",
    description: "Estrutura pensada para apoiar rotinas de controle de jornada conforme regras aplicáveis e processos internos da empresa.",
  },
  {
    icon: Lock,
    title: "Proteção de dados e acesso",
    description: "Controle sobre informações sensíveis usadas na rotina administrativa e operacional.",
  },
  {
    icon: DatabaseBackup,
    title: "Histórico de registros",
    description: "Acompanhe ajustes e dados relevantes com contexto para auditoria, conferência e consulta.",
  },
  {
    icon: HeartHandshake,
    title: "Implantação acompanhada",
    description: "Apoio inicial para configurar o fluxo e reduzir atrito na adoção pela equipe.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Aderência ao cenário da empresa",
    description: "Avaliação comercial orientada à rotina real de RH, DP e gestores, sem promessas genéricas.",
  },
  {
    icon: Waypoints,
    title: "Operação para equipes diversas",
    description: "A plataforma apoia rotinas presenciais, externas e híbridas sem fragmentar a gestão.",
  },
  {
    icon: FileSignature,
    title: "Critério na tomada de decisão",
    description: "Mais contexto para avaliar a solução com segurança antes de avançar para teste e contratação.",
  },
] as const;

const TrustSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="bg-background py-24" aria-labelledby="trust-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Por que confiar</span>
          <h2 id="trust-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Critérios claros para avaliar a plataforma com segurança.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A seção reúne critérios de avaliação ligados à operação, à proteção de dados, ao histórico de registros e ao apoio na adoção.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trustPillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`rounded-2xl border border-border bg-card p-8 shadow-sm ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <pillar.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{pillar.title}</h3>
              <p className="leading-7 text-muted-foreground">{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
