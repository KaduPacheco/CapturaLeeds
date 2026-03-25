import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Dono de restaurante, SP",
    text: "Antes eu perdia 2 horas por semana conferindo folha de ponto. Agora levo 5 minutos. O Ponto Eletrônico mudou minha rotina.",
  },
  {
    name: "Ana Paula Silva",
    role: "Gerente de RH, MG",
    text: "Reduzi erros de cálculo de horas extras em 95%. Meus funcionários confiam mais no sistema e eu durmo tranquila.",
  },
  {
    name: "Roberto Lima",
    role: "Dono de clínica, RJ",
    text: "Implantei em 10 minutos. Sem treinamento, sem complicação. Minha equipe de 12 pessoas usa todo dia sem problema.",
  },
];

const stats = [
  { value: "500+", label: "Empresas atendidas" },
  { value: "95%", label: "Redução de erros" },
  { value: "10 min", label: "Para começar a usar" },
  { value: "4.9/5", label: "Satisfação dos clientes" },
];

const SocialProof = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-20">
      <div className="container" ref={ref}>
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Prova social</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
            Quem usa, <span className="text-gradient">recomenda</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-14">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center p-6 rounded-xl bg-hero-gradient ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl font-extrabold text-primary-foreground">{s.value}</div>
              <div className="text-sm text-primary-foreground/80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`bg-card border rounded-xl p-6 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.4 + i * 0.15}s` }}
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
              <div>
                <div className="font-semibold text-foreground text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
