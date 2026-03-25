import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import heroMockup from "@/assets/hero-mockup.png";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-primary-foreground">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Elimine erros de ponto e{" "}
              <span className="text-secondary">riscos trabalhistas</span>{" "}
              da sua empresa
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Sistema de ponto eletrônico simples, acessível e seguro juridicamente.
              Controle a jornada da sua equipe em minutos, não em horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button variant="hero" size="lg" className="h-14 px-10 rounded-xl" asChild>
                <a href="#contato">Quero automatizar meu ponto</a>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground" asChild>
                <a href="#solucao">Como funciona</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm opacity-80">
              {["Sem cartão de crédito", "Teste grátis por 7 dias", "Suporte humanizado"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={heroMockup}
              alt="Interface do sistema Ponto Eletrônico mostrando dashboard de controle de ponto eletrônico"
              width={1280}
              height={800}
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
