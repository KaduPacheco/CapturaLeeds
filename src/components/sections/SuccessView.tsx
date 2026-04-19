import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, MessageSquareMore, ShieldCheck, Telescope } from "lucide-react";

interface SuccessViewProps {
  onReviewSolution?: () => void;
}

const nextSteps = [
  {
    icon: MessageSquareMore,
    title: "Contato inicial",
    description: "Retorno em até 1 dia útil para confirmar contexto e prioridade.",
  },
  {
    icon: Telescope,
    title: "Diagnóstico rápido",
    description: "Entendimento da rotina atual e dos pontos críticos do fechamento.",
  },
  {
    icon: ShieldCheck,
    title: "Demonstração orientada",
    description: "Apresentação focada na aderência da plataforma ao seu cenário.",
  },
] as const;

const SuccessView = ({ onReviewSolution }: SuccessViewProps) => {
  return (
    <div className="animate-fade-in-up">
      <section className="bg-hero-gradient py-24 text-center text-primary-foreground">
        <div className="container mx-auto max-w-3xl">
          <CheckCircle2 className="mx-auto mb-8 h-20 w-20 text-secondary" />
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">Solicitação enviada com sucesso.</h1>
          <p className="mb-10 text-lg font-medium leading-8 opacity-90 md:text-xl">
            Recebemos seus dados. Agora seguimos para um contato comercial objetivo, voltado à rotina da sua empresa.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-left shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-foreground/70">O que esperar agora</p>
            <p className="mt-3 text-base leading-7 text-primary-foreground/92">
              Retorno em até <strong>1 dia útil</strong>, normalmente por WhatsApp ou e-mail, para combinar a melhor forma de
              apresentar a solução para o seu contexto.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Button size="lg" variant="cta" className="h-14 rounded-xl px-8 text-lg shadow-xl" asChild>
              <a
                href="/#solucao"
                onClick={(event) => {
                  if (!onReviewSolution) {
                    return;
                  }

                  event.preventDefault();
                  onReviewSolution();
                }}
              >
                Revisar a solução
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            {nextSteps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <step.icon className="h-5 w-5 text-secondary" />
                </div>
                <h2 className="mb-2 text-lg font-bold text-primary-foreground">{step.title}</h2>
                <p className="leading-6 text-primary-foreground/82">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessView;
