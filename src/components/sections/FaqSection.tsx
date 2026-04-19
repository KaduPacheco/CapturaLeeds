import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    question: "Como os funcionários registram o ponto?",
    answer:
      "O registro pode ser feito pelos canais já suportados pela plataforma, conforme a rotina definida para a empresa. Na implantação, ajustamos o fluxo mais adequado para a operação.",
  },
  {
    question: "Funciona para equipe externa, presencial e home office?",
    answer:
      "Sim. A plataforma foi pensada para acompanhar diferentes rotinas de trabalho com gestão centralizada para RH, DP e lideranças.",
  },
  {
    question: "Como funciona o teste grátis?",
    answer:
      "O teste de 30 dias é usado para validar a aderência da plataforma à rotina da empresa após o alinhamento inicial com o time comercial.",
  },
  {
    question: "O sistema ajuda no fechamento da folha?",
    answer:
      "Sim. A plataforma organiza informações da jornada para reduzir retrabalho, facilitar conferências e apoiar o fechamento com mais clareza.",
  },
  {
    question: "Preciso de relógio de ponto físico?",
    answer:
      "Não necessariamente. A avaliação inicial considera a rotina da empresa para definir o fluxo mais adequado dentro do que a plataforma suporta hoje.",
  },
  {
    question: "Como funciona a implantação?",
    answer:
      "A implantação começa com alinhamento do cenário da empresa e apoio inicial para reduzir atrito no começo do uso.",
  },
] as const;

const FaqSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="faq" className="bg-background py-24" aria-labelledby="faq-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Perguntas frequentes</span>
          <h2 id="faq-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Respostas objetivas para a avaliação inicial da sua operação.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Confira os principais pontos sobre uso, implantação, teste e aderência da plataforma antes da demonstração.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {faqs.map((item, index) => (
            <article
              key={item.question}
              className={`rounded-2xl border border-border bg-card p-7 shadow-sm ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <h3 className="text-lg font-bold text-foreground">{item.question}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
