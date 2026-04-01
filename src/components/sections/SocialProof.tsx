import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Building2, Factory, MonitorSmartphone, Shield, HeadphonesIcon, Rocket } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    title: "Varejo & Franquias",
    description: "Gestão descentralizada de ponto para múltiplas filiais, controle de escalas complexas e consolidação de dados em tempo real.",
  },
  {
    icon: Factory,
    title: "Indústria & Manufatura",
    description: "Conformidade rigorosa com escalas alternadas, apontamentos noturnos e adequação total às convenções coletivas (CCT).",
  },
  {
    icon: MonitorSmartphone,
    title: "Serviços & Tecnologia",
    description: "Flexibilidade para regimes híbridos, banco de horas dinâmico e integração nativa com os principais ERPs do mercado.",
  },
];

const differentials = [
  {
    icon: Shield,
    title: "Segurança e Conformidade MTE",
    description: "Adequação estrita às portarias 671 e estruturação baseada na LGPD. Seus dados trabalhistas sempre protegidos e auditáveis.",
  },
  {
    icon: Rocket,
    title: "Implantação Consultiva",
    description: "Transição segura a partir das suas planilhas ou software antigo. Engenharia de dados feita a quatro mãos para evitar fricção.",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte Técnico Especializado",
    description: "Esqueça chatbots engessados. Atendimento realizado por especialistas que vivenciam a rotina de um Departamento Pessoal.",
  },
];

const SocialProof = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-background">
      <div className="container" ref={ref}>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-sm font-bold text-primary uppercase tracking-widest">Maturidade Operacional</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-3 leading-tight">
            Pronto para a realidade de <span className="text-primary">operações complexas</span>
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Desenvolvido para atender aos setores mais exigentes com estabilidade e absoluta segurança jurídica.
          </p>
        </div>

        {/* Use Cases - Por tipo de empresa */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {useCases.map((uc, i) => (
            <div
              key={uc.title}
              className={`p-8 rounded-2xl bg-card border shadow-sm ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <uc.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{uc.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>

        {/* Differentials */}
        <div className="bg-slate-50 dark:bg-card/50 border border-border rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
            {differentials.map((diff, i) => (
              <div 
                key={diff.title}
                className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0 shadow-sm border border-border">
                  <diff.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">{diff.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{diff.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
