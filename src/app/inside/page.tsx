import { ExplainerHero } from "@/components/explainer/ExplainerHero";
import { ProductDesignSection } from "@/components/explainer/ProductDesignSection";
import { ProblemStatementSection } from "@/components/explainer/ProblemStatementSection";
import { SystemArchitectureSection } from "@/components/explainer/SystemArchitectureSection";
import { CVPipelineSection } from "@/components/explainer/CVPipelineSection";
import { GraphRoutingSection } from "@/components/explainer/GraphRoutingSection";
import { ItineraryOptimizerSection } from "@/components/explainer/ItineraryOptimizerSection";
import { StateSyncSection } from "@/components/explainer/StateSyncSection";
import { ArchitectureDecisionsSection } from "@/components/explainer/ArchitectureDecisionsSection";
import { WorkedExampleSection } from "@/components/explainer/WorkedExampleSection";
import { ProductionArchitectureSection } from "@/components/explainer/ProductionArchitectureSection";
import { ProductionCostModelSection } from "@/components/explainer/ProductionCostModelSection";
import { ExpandedRoadmapSection } from "@/components/explainer/ExpandedRoadmapSection";
import { DataProvenanceSection } from "@/components/explainer/DataProvenanceSection";
import { TechStackSection } from "@/components/explainer/TechStackSection";
import { LimitationsRoadmapSection } from "@/components/explainer/LimitationsRoadmapSection";
import { ReviewerFAQSection } from "@/components/explainer/ReviewerFAQSection";

export default function ExplainerPage() {
  return (
    <main className="min-h-dvh">
      <ExplainerHero />
      <ProductDesignSection />
      <ProblemStatementSection />
      <SystemArchitectureSection />
      <CVPipelineSection />
      <GraphRoutingSection />
      <ItineraryOptimizerSection />
      <StateSyncSection />
      <ArchitectureDecisionsSection />
      <WorkedExampleSection />
      <ProductionArchitectureSection />
      <ProductionCostModelSection />
      <ExpandedRoadmapSection />
      <DataProvenanceSection />
      <TechStackSection />
      <LimitationsRoadmapSection />
      <ReviewerFAQSection />
    </main>
  );
}
