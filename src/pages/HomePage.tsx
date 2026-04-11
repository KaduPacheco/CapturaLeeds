import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Problems from "@/components/sections/Problems";
import Solution from "@/components/sections/Solution";
import Benefits from "@/components/sections/Benefits";
import SocialProof from "@/components/sections/SocialProof";
import Pricing from "@/components/sections/Pricing";
import Security from "@/components/sections/Security";
import LeadForm from "@/components/sections/LeadForm";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/layout/Footer";
import SuccessView from "@/components/sections/SuccessView";
import { flushAnalyticsQueue, trackPageView } from "@/services/analyticsService";

const HomePage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    trackPageView({ page_name: "landing_home" });
    void flushAnalyticsQueue();
  }, []);

  return (
    <>
      <Header hideCTA={isSubmitted} />
      <main>
        {isSubmitted ? (
          <SuccessView />
        ) : (
          <>
            <Hero />
            <Problems />
            <Solution />
            <Benefits />
            <SocialProof />
            <Pricing />
            <Security />
            <LeadForm onSuccess={() => setIsSubmitted(true)} />
            <FinalCTA />
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
