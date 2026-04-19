// Preservado fora do fluxo principal da landing para referência editorial e rollback seguro.
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DatabaseBackup, FileSignature, Lock } from "lucide-react";

const pillars = [
  {
    icon: FileSignature,
    title: "Voltado à Conformidade com MTE",
    description: "Sistema desenvolvido com base nas diretrizes da Portaria 671. Facilita a geração de arquivos AFD e AFDT.",
  },
  {
    icon: Lock,
    title: "Arquitetura Segura",
    description: "Criptografia de dados e hospedagem em servidores de alta disponibilidade. Mais segurança para seus dados.",
  },
  {
    icon: DatabaseBackup,
    title: "Auditoria e Rastreabilidade",
    description: "Logs de auditoria para ajustes manuais. Backups automáticos diários ajudam a prevenir perdas de dados.",
  },
] as const;

const Security = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="bg-muted/30 py-24">
      <div className="container" ref={ref}>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Segurança e legalidade</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            Infraestrutura robusta para o seu <span className="text-primary">departamento pessoal</span>
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className={`rounded-2xl border bg-card p-8 transition-shadow hover:shadow-md ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <pillar.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;
