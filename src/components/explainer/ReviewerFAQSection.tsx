"use client";

import { useState, useId } from "react";
import { ChevronDown, Search, HelpCircle, CheckCircle2 } from "lucide-react";

type FAQCategory =
  | "All"
  | "Product & Problem"
  | "Architecture"
  | "Computer Vision"
  | "Intelligence & Routing"
  | "Backend & Sync"
  | "Simulation & Reliability"
  | "Production & Cost Model"
  | "Technology & Future";

interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  codeRef?: string;
  sourceType?: "REAL_VIDEO" | "SIMULATED" | "DERIVED" | "STATIC";
}

export function ReviewerFAQSection() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["faq-backend-1", "faq-pv-1"]));

  const toggleId = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const categories: FAQCategory[] = [
    "All",
    "Product & Problem",
    "Architecture",
    "Computer Vision",
    "Intelligence & Routing",
    "Backend & Sync",
    "Simulation & Reliability",
    "Production & Cost Model",
    "Technology & Future",
  ];

  const faqs: FAQItem[] = [
    // Product & Problem
    {
      id: "faq-pv-1",
      category: "Product & Problem",
      question: "What problem does Pravaah solve?",
      answer:
        "Pravaah solves destination-scale pedestrian overcrowding and bottlenecking at mega-events (e.g. Maha Kumbh Parv with 1.25M+ visitors). Standard vehicular GPS apps fail because they track highway speed rather than pedestrian corridor density, gate queues, and sacred precinct capacities.",
      codeRef: "src/app/page.tsx",
    },
    {
      id: "faq-pv-2",
      category: "Product & Problem",
      question: "Who are Pravaah's intended users?",
      answer:
        "Pravaah serves two distinct user roles on one shared intelligence loop: (1) Visitors seeking mobile journey planning, optimal arrival windows, gate recommendations, and live rerouting; and (2) Organizers/Command Center operators managing sector capacities, monitoring multi-camera feeds, receiving predictive alerts, and approving capacity interventions.",
    },
    {
      id: "faq-pv-3",
      category: "Product & Problem",
      question: "Why was this user flow designed this way?",
      answer:
        "The user flow decouples individual visitor trip decisions (origin, accommodation, itinerary) from destination-wide operational conditions. Visitors receive personal journey guidance without being overwhelmed by raw operator analytics, while operators retain a macro command dashboard over all operational sectors.",
      codeRef: "src/components/explainer/ProductDesignSection.tsx",
    },

    // Backend & Sync (Audited Core Limitation Questions)
    {
      id: "faq-backend-1",
      category: "Backend & Sync",
      question: "Does Pravaah have a backend?",
      answer:
        "Pravaah includes Next.js App Router server infrastructure, including a POST endpoint (/api/simulation) and a dynamic Server-Sent Events endpoint (/api/simulation/stream). However, it does not currently use a centralized database or persistent server store. Server route state is maintained in Node process memory.",
      codeRef: "src/app/api/simulation/stream/route.ts",
    },
    {
      id: "faq-backend-2",
      category: "Backend & Sync",
      question: "Does it use a database?",
      answer:
        "No. The prototype does not use PostgreSQL, PostGIS, MongoDB, or Redis. Persistent state (such as spatial event models and simulation states) is saved locally in the browser's localStorage. Visitor session preferences reside in active browser tab memory.",
      codeRef: "src/store/simulationStore.ts & eventAuthoringStore.ts",
    },
    {
      id: "faq-backend-3",
      category: "Backend & Sync",
      question: "Can multiple operators share the same authoritative state across separate devices?",
      answer:
        "Within the same browser, open tabs synchronize instantly via the browser's native BroadcastChannel API. Across separate physical devices, state updates are broadcast over HTTP SSE connections (/api/simulation/stream). However, because there is no persistent backend database, if the server restarts or clients lose connection, state is re-read from local browser storage.",
      codeRef: "src/components/shared/TransportSyncBridge.tsx",
    },
    {
      id: "faq-backend-4",
      category: "Backend & Sync",
      question: "Why not implement the full production backend right now?",
      answer:
        "Keeping perception and routing logic in browser memory allowed the prototype to run completely local without requiring cloud GPU server infrastructure, external database credentials, or paid cloud APIs. This ensures zero friction for hackathon evaluators running 'npm run dev' on local machines.",
      codeRef: "src/components/explainer/LimitationsRoadmapSection.tsx",
    },

    // Computer Vision (Audited Limitation Questions)
    {
      id: "faq-cv-1",
      category: "Computer Vision",
      question: "Which model actually performs computer vision inference in browser memory?",
      answer:
        "In-browser inference is executed via `@tensorflow/tfjs` and `@tensorflow-models/coco-ssd` using the `lite_mobilenet_v2` model variant. The telemetry payload field `model: 'yolo11'` represents a schema label for enterprise perception servers.",
      codeRef: "src/lib/cv/videoPerceptionEngine.ts",
      sourceType: "REAL_VIDEO",
    },
    {
      id: "faq-cv-2",
      category: "Computer Vision",
      question: "Is the crowd count accurate enough for live deployment?",
      answer:
        "The current in-browser detector (@tensorflow/tfjs COCO-SSD lite_mobilenet_v2) is suitable for real-time visual demonstration and relative density estimation. However, it has not been benchmarked against manually annotated mega-event ground-truth video datasets. For live crowd control operations, server-side GPU models (YOLOv11) calibrated against physical ground truth are required.",
      codeRef: "src/lib/cv/videoPerceptionEngine.ts",
    },
    {
      id: "faq-cv-3",
      category: "Computer Vision",
      question: "Is the AI custom-trained on mega-event crowd data?",
      answer:
        "No. The in-browser perception model uses the standard pretrained COCO-SSD weights from TensorFlow.js trained on the MS-COCO dataset. It detects general person bounding boxes. Custom fine-tuning on high-density overhead crowd datasets (e.g. ShanghaiTech) is planned for Stage 1 of the production roadmap.",
      codeRef: "src/lib/cv/videoPerceptionEngine.ts",
    },
    {
      id: "faq-cv-4",
      category: "Computer Vision",
      question: "Does the system detect people from real video or use simulated data?",
      answer:
        "Both paths are supported and explicitly labeled. When active MP4 video streams are loaded (`camera-01.mp4..04.mp4`), TF.js processes canvas video frames to output real-time person detections (`REAL_VIDEO`). If video assets are unavailable or disabled, the system falls back to deterministic state table values (`SIMULATED`).",
      codeRef: "src/lib/cv/cameraEdgeRegistry.ts",
    },

    // Intelligence & Routing
    {
      id: "faq-ir-1",
      category: "Intelligence & Routing",
      question: "How is crowd density and crowd level grade calculated?",
      answer:
        "`crowdStateEngine.ts` calculates density as `peopleCount / areaSqMeters`. Occupancy percentage is graded into deterministic crowd levels: LOW (<45%), MODERATE (45-74%), HIGH (75-87%), and CRITICAL (≥88% or ≥3.0 p/m²).",
      codeRef: "src/lib/intelligence/crowdStateEngine.ts",
      sourceType: "DERIVED",
    },
    {
      id: "faq-ir-2",
      category: "Intelligence & Routing",
      question: "Why might a longer physical route be recommended over a shorter one?",
      answer:
        "If a 900m direct corridor is severely congested (CRITICAL crowd level = +14 min penalty, prediction risk = +8 min penalty), its total route cost reaches 38 minutes. A 1.3km bypass corridor with clear traffic (0 min penalty) takes only 19 minutes total, saving the visitor 19 minutes.",
    },

    // Production & Cost Model
    {
      id: "faq-cost-1",
      category: "Production & Cost Model",
      question: "What is the expected production deployment cost for 4, 25, or 100 cameras?",
      answer:
        "Based on our budget model: (1) Controlled Pilot (4 cameras) ~ ₹ 8.3 – 11.6 Lakhs INR; (2) Medium Event (25 cameras) ~ ₹ 40.5 – 54.2 Lakhs INR; (3) Mega-Event (100 cameras) ~ ₹ 1.68 – 2.23 Crores INR.",
      codeRef: "src/components/explainer/ProductionCostModelSection.tsx",
    },
    {
      id: "faq-cost-2",
      category: "Production & Cost Model",
      question: "Which production costs are fixed and which scale with camera count?",
      answer:
        "Fixed costs include core application hosting, PostGIS database setup, and base command center staffing (~ ₹ 4.5 Lakhs). Variable scaling costs include camera hardware procurement, edge Jetson modules or cloud GPU compute hours, and network bandwidth.",
    },

    // Simulation & Reliability / Technology & Future
    {
      id: "faq-tf-1",
      category: "Technology & Future",
      question: "What would need to change before a real event deployment?",
      answer:
        "Before live venue deployment, five key upgrades are required: (1) Server-side RTSP video stream ingestion; (2) Dedicated GPU inference workers (YOLOv11); (3) PostgreSQL/PostGIS database persistence; (4) OAuth2 authentication with RBAC permissions; and (5) Empirical ground-truth density calibration with venue police.",
      codeRef: "src/components/explainer/ProductionArchitectureSection.tsx",
    },
    {
      id: "faq-tf-2",
      category: "Technology & Future",
      question: "How would privacy and video retention be handled in production?",
      answer:
        "Production systems enforce zero personal data retention. Video frames are processed in volatile GPU RAM for object counting and immediately discarded. No facial recognition or biometric profiling is performed.",
    },
  ];

  const searchInputId = useId();

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      (faq.codeRef && faq.codeRef.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="scroll-mt-28 py-14 px-4 sm:px-8 bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <HelpCircle className="h-4 w-4" />
          Reviewer & Judge Technical FAQ
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Frequently Asked Technical Questions
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          Source-backed answers to technical review, architecture, computer vision, graph routing, cost modeling, system limitations, and reliability questions.
        </p>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 app-scroll text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                  activeCategory === cat
                    ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
                    : "bg-[#14171b] border border-[#262b31] text-[#9aa1a9] hover:bg-[#1b1f24] hover:text-[#f3f4f6]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <label htmlFor={searchInputId} className="sr-only">
              Search Technical FAQ
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9aa1a9]" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Search FAQ keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#262b31] bg-[#14171b] pl-9 pr-3 py-1.5 text-xs text-[#f3f4f6] placeholder-[#9aa1a9] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-8 text-center text-xs text-[#9aa1a9]">
            No technical FAQ entries match your search query &quot;{searchQuery}&quot;. Try clearing filters or searching for terms like &quot;backend&quot;, &quot;database&quot;, or &quot;COCO-SSD&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openIds.has(faq.id);
              const answerPanelId = `faq-answer-${faq.id}`;
              const questionButtonId = `faq-button-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-[#262b31] bg-[#14171b] overflow-hidden transition-colors"
                >
                  <button
                    id={questionButtonId}
                    aria-expanded={isOpen}
                    aria-controls={answerPanelId}
                    onClick={() => toggleId(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-[#f3f4f6] hover:bg-[#1b1f24] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d10] transition-all"
                  >
                    <span className="pr-4 flex items-center gap-2">
                      <span className="text-blue-400 font-mono text-xs shrink-0">[{faq.category}]</span>
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#9aa1a9] transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={answerPanelId}
                      role="region"
                      aria-labelledby={questionButtonId}
                      className="p-4 pt-0 text-xs text-[#a1a1aa] leading-relaxed border-t border-[#262b31]/50 bg-[#1b1f24]/30"
                    >
                      <p className="mt-3">{faq.answer}</p>
                      {faq.codeRef && (
                        <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-[#e8eaed]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>Source Module: </span>
                          <code className="rounded bg-[#0b0d10] border border-[#262b31] px-2 py-0.5 text-blue-400">
                            {faq.codeRef}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
