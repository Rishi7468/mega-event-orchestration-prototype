"use client";

import { ShieldCheck, HelpCircle } from "lucide-react";

export function ArchitectureDecisionsSection() {
  const decisions = [
    {
      id: 1,
      title: "1. Deterministic Scenario Simulation over Random Stochastic Feeds",
      problem: "Real-time AI demonstrations during live hackathons can suffer from unpredictable random noise, unrepeatable test runs, and race conditions.",
      decision: "Built a deterministic, phase-driven state machine (`simulationStore.ts`) with fixed transition steps (`normal → demand-spike → prediction → recommendation → accepted → response → outcome`).",
      benefit: "Guarantees 100% reproducible live demonstrations for reviewers, judges, and developers across fresh page loads and cross-tab sessions.",
      tradeoff: "The state machine relies on curated operational fixtures rather than live real-world crowd API integrations.",
    },
    {
      id: 2,
      title: "2. Dual-Surface Separation (Visitor vs Operator Stores)",
      problem: "Mixing single-visitor trip selections (e.g. origin, itinerary choices) with destination-wide operational conditions leads to state collisions and bloated renders.",
      decision: "Split global state into `simulationStore.ts` (shared venue state) and `visitorStore.ts` (isolated per-tab visitor choices).",
      benefit: "Maintains clean architectural boundaries; operator interventions update shared venue state without overwriting individual visitor preferences.",
      tradeoff: "Requires synchronization bridges (`TransportSyncBridge.tsx`) to propagate shared state updates across open visitor tabs.",
    },
    {
      id: 3,
      title: "3. Event-Aware Pedestrian Graph over Standard Vector Maps",
      problem: "Standard car navigation APIs (like Google Maps) measure highway vehicular speed, ignoring pedestrian corridor bottlenecking and queue delays at venue gates.",
      decision: "Constructed an explicit 8-node / 9-edge pedestrian graph (`pedestrianGraph.ts`) with dynamic Haversine distance, crowd density, and prediction risk penalties.",
      benefit: "Reroutes visitors around congested pedestrian bottlenecks before physical stampede thresholds occur.",
      tradeoff: "Graph network is bounded to 8 canonical landmark nodes within the Prayagraj mega-event perimeter rather than global road tiles.",
    },
    {
      id: 4,
      title: "4. Adapter Layer Isolation for Data Ingestion",
      problem: "Tightly coupling UI views to specific computer vision implementations makes model swapping or synthetic fallback testing brittle.",
      decision: "Implemented data adapters (`visitorDataAdapters.ts` & `crowdDataProvider.ts`) that translate raw vision telemetry into unified TypeScript domain models.",
      benefit: "UI components remain agnostic to whether telemetry originates from real browser TF.js canvas feeds or simulated scenario fixtures.",
      tradeoff: "Introduces lightweight transformation overhead when mapping raw telemetry objects to zone state records.",
    },
    {
      id: 5,
      title: "5. Explicit Data Provenance Labels across UI",
      problem: "Hackathon reviewers often question whether metrics (density, counts, ETA) originate from live vision models, math derivations, or mock data.",
      decision: "Tagged every metric rendered across operator and visitor views with explicit data source badges (`REAL_VIDEO`, `SIMULATED`, `DERIVED`, `STATIC`).",
      benefit: "Provides 100% transparency during technical review, establishing immediate trust with judges.",
      tradeoff: "Requires storing source metadata alongside telemetry payloads across state stores.",
    },
    {
      id: 6,
      title: "6. Camera-Isolated Track Prefixing in Centroid Tracker",
      problem: "Running multiple concurrent video streams can cause track ID collisions when separate cameras assign identical numeric IDs (e.g. `trk_101`).",
      decision: "Implemented camera-scoped track prefixing (`cam07_trk_101`, `cam03_trk_101`) inside `CentroidTracker` in `videoPerceptionEngine.ts`.",
      benefit: "Prevents cross-camera identity bleeding and enables independent multi-camera tracking inside a single browser window.",
      tradeoff: "Tracks do not perform cross-camera re-identification when a visitor transitions between disjoint camera coverage zones.",
    },
    {
      id: 7,
      title: "7. In-Browser TF.js Execution vs Heavy Server GPU Clustering",
      problem: "Requiring external GPU servers for video perception complicates local setup, increases latency, and introduces external network failure points.",
      decision: "Integrated `@tensorflow/tfjs` + COCO-SSD (`lite_mobilenet_v2`) directly inside client-side canvas worker threads with frame skip locks.",
      benefit: "Zero external backend dependencies; the entire multi-camera vision pipeline runs locally inside standard web browsers.",
      tradeoff: "Limited to client-side CPU/WebGL inference capabilities, capping real-time frame rates at 3-15 FPS depending on user hardware.",
    },
  ];

  return (
    <section id="decisions" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          <HelpCircle className="h-4 w-4" />
          Architectural Decisions
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Key Engineering Rationale & System Trade-Offs
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          Every core system decision in Pravaah balances real-time performance, developer auditability, hackathon demo repeatability, and architectural transparency.
        </p>

        <div className="grid lg:grid-cols-2 gap-4">
          {decisions.map((d) => (
            <div key={d.id} className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#262b31] pb-2">
                  <h3 className="text-sm font-bold text-[#f3f4f6]">{d.title}</h3>
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-rose-400">Problem: </span>
                    <span className="text-[#a1a1aa]">{d.problem}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-400">Decision: </span>
                    <span className="text-[#e8eaed]">{d.decision}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-400">Benefit: </span>
                    <span className="text-[#e8eaed]">{d.benefit}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#262b31] text-[11px] text-[#9aa1a9]">
                <span className="font-semibold text-amber-400">Trade-Off / Limitation: </span>
                <span>{d.tradeoff}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
