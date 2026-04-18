import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Benefits from "@/components/sections/Benefits";
import FaqSection from "@/components/sections/FaqSection";
import FinalCTA from "@/components/sections/FinalCTA";
import Hero from "@/components/sections/Hero";
import LeadForm from "@/components/sections/LeadForm";
import Pricing from "@/components/sections/Pricing";
import Problems from "@/components/sections/Problems";
import Security from "@/components/sections/Security";
import Solution from "@/components/sections/Solution";
import SuccessView from "@/components/sections/SuccessView";
import TrustSection from "@/components/sections/TrustSection";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trackPageView } from "@/services/analyticsService";

const HomePage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  usePageMeta({
    title: "Controle de Ponto Eletrônico para Empresas | Teste Grátis",
    description:
      "Software de controle de ponto eletrônico para RH, DP e gestores. Reduza retrabalho no fechamento da folha, acompanhe jornadas em tempo real e experimente grátis.",
    path: "/",
  });

  useEffect(() => {
    void trackPageView({
      page_name: "landing_home",
      surface: "landing",
    });
  }, []);

  return (
    <>
      <Header hideCTA={isSubmitted} />
      <main id="conteudo-principal">
        {isSubmitted ? (
          <SuccessView />
        ) : (
          <>
            <Hero />
            <Problems />
            <Solution />
            <Benefits />
            <TrustSection />
            <Pricing />
            <Security />
            <FaqSection />
            <FinalCTA />
            <LeadForm onSuccess={() => setIsSubmitted(true)} />
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
