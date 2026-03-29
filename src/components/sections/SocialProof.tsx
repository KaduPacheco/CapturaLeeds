import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Star, Building } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Diretor de RH, LogTech BR",
    text: "Reduzimos nossa janela de fechamento de folha de 3 dias para apenas 2 horas. O ganho de eficiência no departamento foi brutal.",
  },
  {
    name: "Ana Paula Silva",
    role: "Gerente de Operações, Varejo Simples",
    text: "A implantação foi tão fácil que no primeiro mês já não tínhamos mais problemas de registro. A equipe adotou na hora.",
  },
  {
    name: "Roberto Lima",
    role: "Proprietário, Indústria Metal",
    text: "Ganhamos segurança jurídica e a tranquilidade de saber que tudo está perfeitamente alinhado às portarias do MTE.",
  },
];

const stats = [
  { value: "500+", label: "Empresas ativas" },
  { value: "95%", label: "Redução em erros de folha" },
  { value: "100%", label: "Conformidade legal" },
  { value: "50k+", label: "Registros diários" },
];

const SocialProof = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-background">
      <div className="container" ref={ref}>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-sm font-bold text-primary uppercase tracking-widest">Confiança B2B</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-3 leading-tight">
            Aprovado por quem <span className="text-primary">lidera</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center p-6 rounded-2xl bg-card border shadow-sm ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">{s.value}</div>
              <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`bg-card border border-border hover:border-primary/30 rounded-2xl p-8 shadow-sm transition-all duration-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.3 + i * 0.15}s` }}
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed italic text-lg">"{t.text}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-bold text-foreground">{t.name}</div>
                  <div className="text-sm text-primary font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
