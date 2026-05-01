import {
  Hero,
  Navbar,
  CapabilitiesSection,
  WorkflowSection,
  ArchitectureSection,
  CTASection,
  Footer,
} from "@/components/marketing/landing";

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
