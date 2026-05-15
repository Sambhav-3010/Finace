import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { CapabilitiesSection } from "@/components/marketing/CapabilitiesSection";
import { WorkflowSection } from "@/components/marketing/WorkflowSection";
import { ArchitectureSection } from "@/components/marketing/ArchitectureSection";
import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CapabilitiesSection />
      <WorkflowSection />
      <ArchitectureSection />
      <CTASection />
      <Footer />
    </main>
  );
}
