import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-20">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
          Pare de perder tempo e dinheiro com controle manual
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Junte-se a mais de 500 empresas que já automatizaram o controle de ponto. Comece hoje mesmo — é grátis por 7 dias.
        </p>
        <Button variant="hero" size="lg" className="h-14 px-10 rounded-xl" asChild>
          <a href="#contato">
            Quero automatizar meu ponto
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </Button>
      </div>
    </section>
  );
};

export default FinalCTA;
