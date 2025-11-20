import { Header } from "@/components/Layout/Header";
import { Hero } from "@/components/Layout/Hero";
import { Features } from "@/components/Layout/Features";
import { HowItWorks } from "@/components/Layout/HowItWorks";
import { DemoPreview } from "@/components/Layout/DemoPreview";
import { UseCases } from "@/components/Layout/UseCases";
import { Footer } from "@/components/Layout/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <DemoPreview />
        <UseCases />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
