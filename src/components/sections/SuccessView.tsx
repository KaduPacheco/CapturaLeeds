import { CheckCircle2, ShieldCheck, PhoneCall, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SuccessView = () => {
  return (
    <div className="animate-fade-in-up">
      {/* Hero / Status OK */}
      <section className="py-24 bg-hero-gradient text-primary-foreground text-center">
        <div className="container max-w-3xl mx-auto">
          <CheckCircle2 className="w-20 h-20 mx-auto mb-8 text-secondary" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Solicitação enviada com sucesso.
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-10 leading-relaxed font-medium">
            Entendemos que seu tempo é valioso. Um de nossos especialistas em gestão de RH entrará em contato em até 24 horas úteis para alinhar as necessidades da sua operação e preparar uma demonstração personalizada.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" variant="cta" className="h-14 px-8 rounded-xl text-lg w-full sm:w-auto shadow-xl" asChild>
              <a href="#features" onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}>
                Explorar funcionalidades
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl text-lg w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <a href="/">
                Voltar à página inicial
              </a>
            </Button>
          </div>
          <p className="text-sm opacity-70 mt-6 mt-8">
            Fique de olho no seu e-mail e WhatsApp.
          </p>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="py-24 bg-background">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              O que esperar da nossa parceria
            </h2>
            <p className="text-xl text-muted-foreground">
              Conheça os pilares que garantem uma transição estruturada e risco zero para o seu Departamento Pessoal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Diagnóstico Especializado</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nossa primeira etapa é mapear a fundo as regras de negócio, acordos e exigências sindicais exclusivas da sua operação.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Setup Estruturado</h3>
              <p className="text-muted-foreground leading-relaxed">
                Configuramos o novo ambiente do zero com as regras da sua operação. Preparamos a plataforma para que você inicie o próximo fechamento de folha com total segurança.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <PhoneCall className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Treinamento Lado a Lado</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sua equipe não opera o software sozinha. Oferecemos capacitação guiada para que seu time assuma o controle da tecnologia desde o dia 1.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessView;
