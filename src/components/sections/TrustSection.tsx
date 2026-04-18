import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BriefcaseBusiness, Building2, HeartHandshake, Shield, TimerReset, Waypoints } from "lucide-react";

const segments = [
  {
    icon: Building2,
    title: "Pequenas e médias empresas",
    description: "Estrutura comercial pensada para operações que precisam ganhar controle sem adicionar complexidade desnecessária.",
  },
  {
    icon: BriefcaseBusiness,
    title: "RH, DP e gestores",
    description: "Uma proposta orientada para quem fecha folha, acompanha jornada e precisa agir com base em dados confiáveis.",
  },
  {
    icon: Waypoints,
    title: "Equipes presenciais, externas ou híbridas",
    description: "A plataforma foi desenhada para apoiar diferentes rotinas de jornada e centralizar a gestão em um mesmo fluxo.",
  },
];

const trustBlocks = [
  {
    icon: Shield,
    title: "Conformidade operacional",
    description: "Desenvolvido para apoiar rotinas de controle de jornada conforme regras aplicáveis e processos internos da empresa.",
  },
  {
    icon: TimerReset,
    title: "Rastreabilidade",
    description: "Estrutura preparada para histórico de alterações, conferência e rotinas auditáveis no dia a dia da operação.",
  },
  {
    icon: HeartHandshake,
    title: "Implantação assistida e suporte humano",
    description: "O processo comercial é conduzido com acompanhamento próximo para reduzir fricção no início do uso.",
  },
];

const TrustSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="bg-background py-24" aria-labelledby="trust-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Por que confiar</span>
          <h2 id="trust-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Confiança construída por clareza operacional, não por promessas vazias.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Quando ainda não existe prova social pública disponível, a melhor forma de transmitir segurança é mostrar contexto,
            responsabilidade técnica e o tipo de operação para a qual a solução faz sentido.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {segments.map((segment, index) => (
            <article
              key={segment.title}
              className={`rounded-2xl border border-border bg-card p-8 shadow-sm ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <segment.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{segment.title}</h3>
              <p className="leading-7 text-muted-foreground">{segment.description}</p>
            </article>
          ))}
        </div>

        <div className="rounded-[2rem] border border-border bg-section-alt p-8 md:p-12">
          <div className="mb-10 max-w-2xl">
            <h3 className="text-2xl font-bold text-foreground md:text-3xl">Blocos de confiança para uma decisão mais segura</h3>
            <p className="mt-3 text-muted-foreground">
              Em vez de depoimentos genéricos, deixamos explícitos os pilares que sustentam a proposta comercial da landing.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {trustBlocks.map((block, index) => (
              <article
                key={block.title}
                className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.25 + index * 0.12}s` }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                  <block.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="mb-2 text-lg font-bold text-foreground">{block.title}</h4>
                <p className="leading-7 text-muted-foreground">{block.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
