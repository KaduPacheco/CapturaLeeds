import { Button } from "@/components/ui/Button";
import { trackCtaClick } from "@/services/analyticsService";
import { ArrowRight, CheckCircle2, MessageSquareMore, ShieldCheck, Telescope } from "lucide-react";

const nextSteps = [
  {
    icon: MessageSquareMore,
    title: "Contato inicial",
    description: "Nossa equipe comercial deve retornar em até 1 dia útil para confirmar contexto, equipe e prioridade da operação.",
  },
  {
    icon: Telescope,
    title: "Diagnóstico do cenário",
    description: "Vamos entender como a jornada é controlada hoje e onde estão os principais gargalos do fechamento.",
  },
  {
    icon: ShieldCheck,
    title: "Demonstração orientada",
    description: "A apresentação da plataforma foca na rotina da sua empresa, sem discurso genérico nem promessas desnecessárias.",
  },
];

const SuccessView = () => {
  return (
    <div className="animate-fade-in-up">
      <section className="bg-hero-gradient py-24 text-center text-primary-foreground">
        <div className="container mx-auto max-w-3xl">
          <CheckCircle2 className="mx-auto mb-8 h-20 w-20 text-secondary" />
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">Solicitação enviada com sucesso.</h1>
          <p className="mb-10 text-lg font-medium leading-8 opacity-90 md:text-xl">
            Recebemos seus dados. O próximo passo é um contato comercial para entender a operação, alinhar expectativas e mostrar
            como a plataforma pode apoiar a gestão da jornada da sua equipe.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-left shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/70">O que esperar agora</p>
            <p className="mt-3 text-base leading-7 text-primary-foreground/92">
              Retorno em até <strong>1 dia útil</strong>, normalmente por WhatsApp ou e-mail, para combinar a melhor forma de apresentar
              a solução para o seu contexto.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Button size="lg" variant="cta" className="h-14 rounded-xl px-8 text-lg shadow-xl" asChild>
              <a
                href="/#solucao"
                onClick={() => {
                  void trackCtaClick({
                    cta_id: "success_view_cta_revisar_solucao",
                    cta_label: "Revisar solução",
                    placement: "success_view",
                    target: "/#solucao",
                  });
                }}
              >
                Revisar a solução
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">Próximos passos da conversa</h2>
            <p className="text-xl text-muted-foreground">
              Mantivemos esta etapa simples para reduzir ansiedade e deixar claro como o atendimento evolui.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {nextSteps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
                <p className="leading-7 text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessView;
