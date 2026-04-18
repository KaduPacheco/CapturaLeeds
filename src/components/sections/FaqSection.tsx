import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    question: "Como os funcionários registram o ponto?",
    answer:
      "Na demonstração, avaliamos a rotina da empresa e apresentamos o fluxo mais adequado para o registro e acompanhamento da jornada.",
  },
  {
    question: "Funciona para equipe externa, presencial e home office?",
    answer:
      "A proposta comercial atende operações presenciais, externas e híbridas, com gestão centralizada para RH, DP e lideranças.",
  },
  {
    question: "Como funciona o teste grátis?",
    answer:
      "O teste grátis de 14 dias permite avaliar aderência operacional antes de avançar para uma contratação comercial.",
  },
  {
    question: "O sistema ajuda no fechamento da folha?",
    answer:
      "Sim. A plataforma foi pensada para organizar informações de jornada, horas extras, banco de horas e pendências com mais clareza no fechamento.",
  },
  {
    question: "Preciso de relógio de ponto físico?",
    answer:
      "Nem sempre. O cenário ideal depende da operação, e isso é validado durante a demonstração para evitar uma recomendação genérica.",
  },
  {
    question: "Como funciona a implantação?",
    answer:
      "O processo começa com diagnóstico do cenário e orientação inicial para reduzir atrito na adoção e no uso pelos times envolvidos.",
  },
];

const FaqSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="faq" className="bg-background py-24" aria-labelledby="faq-title">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Perguntas frequentes</span>
          <h2 id="faq-title" className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Respostas objetivas para reduzir atrito na decisão.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            O FAQ ajuda a esclarecer o que costuma travar a avaliação de uma solução de ponto eletrônico sem prometer além do que faz sentido.
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
