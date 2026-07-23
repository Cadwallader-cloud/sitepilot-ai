import { BeforeAfter } from "@/components/before-after";
import { DemoExamples } from "@/components/demo-examples";
import { Footer } from "@/components/features";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { NicheAudience } from "@/components/niche-audience";
import { PricingFlow } from "@/components/pricing-flow";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <BeforeAfter />
        <NicheAudience />
        <DemoExamples />
        <PricingFlow />
      </main>
      <Footer />
    </>
  );
}
