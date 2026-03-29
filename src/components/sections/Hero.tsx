import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";
import heroMockup from "@/assets/images/hero-mockup.png";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-hero-gradient relative overflow-hidden text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_60%)] pointer-events-none" />
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-primary-foreground text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              O controle de ponto que o seu <span className="text-secondary">RH sempre pediu</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed max-w-lg">
              Sistema de ponto eletrônico corporativo para pequenas e médias empresas. Elimine o uso de planilhas, reduza passivos trabalhistas e feche a folha em minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button variant="hero" size="lg" className="h-14 px-10 text-base rounded-lg font-semibold shadow-xl hover:-translate-y-1 transition-all duration-300" asChild>
                <a href="#contato">Começar teste grátis</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-5 text-sm font-medium opacity-80">
              {["Adequado às portarias do MTE", "Teste grátis de 7 dias", "Suporte corporativo ágil"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img
              src={heroMockup}
              alt="Dashboard do sistema Ponto Eletrônico corporativo"
              width={1280}
              height={800}
              className="relative w-full rounded-xl shadow-2xl border border-border/50 bg-card"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
