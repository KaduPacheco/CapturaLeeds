import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Lock, Scale, Server } from "lucide-react";

const pillars = [
  {
    icon: Lock,
    title: "Dados protegidos",
    description: "Criptografia de ponta a ponta e servidores no Brasil. Seus dados estão seguros.",
  },
  {
    icon: Scale,
    title: "Conformidade legal",
    description: "Em total conformidade com a CLT e portarias do MTE sobre controle de jornada.",
  },
  {
    icon: Server,
    title: "Backup e estabilidade",
    description: "Backups automáticos diários e 99.9% de uptime garantido.",
  },
];

const Security = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-20">
      <div className="container" ref={ref}>
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Segurança</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Sua tranquilidade é nossa <span className="text-gradient">prioridade</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className={`text-center p-8 rounded-xl border bg-card ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
                <p.icon className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;
