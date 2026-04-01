import { Hero } from "@/components/marketing/hero";
import { Navbar } from "@/components/marketing/navbar";
import {
  CapabilitiesSection,
  ProblemSection,
  UseCaseSection,
  WorkflowSection,
} from "@/components/marketing/sections";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProblemSection />
      <CapabilitiesSection />
      <WorkflowSection />
      <UseCaseSection />
    </main>
  );
}
