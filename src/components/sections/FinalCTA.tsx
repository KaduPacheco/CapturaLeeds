import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none" />
      <div className="container text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Simplifique o seu RH ainda hoje
        </h2>
        <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-medium">
          Diga adeus ao controle manual, às planilhas sujeitas a erros e ao risco trabalhista.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
          <Button size="lg" variant="hero" className="h-14 px-10 rounded-xl text-lg font-bold w-full sm:w-auto shadow-xl hover:scale-105 transition-transform" asChild>
            <a href="#contato">
              Começar teste grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-primary-foreground/80">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-white" /> Implantação em horas</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-white" /> Cancele quando quiser</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-white" /> Suporte humanizado</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
