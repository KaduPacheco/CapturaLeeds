import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Lock, FileSignature, DatabaseBackup } from "lucide-react";

const pillars = [
  {
    icon: FileSignature,
    title: "Voltado à Conformidade com MTE",
    description: "Sistema desenvolvido com base nas diretrizes da Portaria 671. Facilita a geração de arquivos AFD e AFDT.",
  },
  {
    icon: Lock,
    title: "Arquitetura Segura",
    description: "Criptografia de dados e hospedagem em servidores de alta disponibilidade (AWS). Mais segurança para seus dados.",
  },
  {
    icon: DatabaseBackup,
    title: "Auditoria e Rastreabilidade",
    description: "Logs de auditoria para ajustes manuais. Backups automáticos diários ajudam a prevenir perdas de dados.",
  },
];

const Security = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-muted/30">
      <div className="container" ref={ref}>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-sm font-bold text-primary uppercase tracking-widest">Segurança & Legalidade</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-3 leading-tight">
            Infraestrutura robusta para o seu <span className="text-primary">departamento pessoal</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className={`p-8 rounded-2xl border bg-card hover:shadow-md transition-shadow ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <p.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;
