import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Lock, FileSignature, DatabaseBackup } from "lucide-react";

const pillars = [
  {
    icon: FileSignature,
    title: "Aderência Total ao MTE",
    description: "Sistema desenvolvido em rigorosa conformidade com a Portaria 671. Geração nativa de arquivos AFD e AFDT.",
  },
  {
    icon: Lock,
    title: "Segurança de Nível Bancário",
    description: "Criptografia ponta a ponta e hospedagem em servidores de alta disponibilidade (AWS). Seus dados inalteráveis e protegidos.",
  },
  {
    icon: DatabaseBackup,
    title: "Auditoria e Rastreabilidade",
    description: "Logs completos de auditoria para cada ajuste manual. Backups automáticos diários garantem que nada se perca.",
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
