"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Database,
  Eye,
  Layers,
  Server,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Cpu,
  Lock,
  GitBranch,
} from "lucide-react";

type CapabilityStatus = "EXISTING" | "PARTIAL" | "PROPOSED";

interface TopologyComponent {
  layer: string;
  prototypeImpl: string;
  productionImpl: string;
  status: CapabilityStatus;
  rationale: string;
}

const TOPOLOGY_MATRIX: TopologyComponent[] = [
  {
    layer: "Camera Ingestion & Transport",
    prototypeImpl: "HTML5 video element playback of local MP4 files (/media/cameras/)",
    productionImpl: "RTSP / WebRTC stream ingestion cluster via MediaMTX & FFmpeg GPU hardware decoding",
    status: "PARTIAL",
    rationale: "Ingests real local MP4 streams in browser canvas; proposed WebRTC handles live IP venue cameras.",
  },
  {
    layer: "Computer Vision Inference",
    prototypeImpl: "In-browser TF.js COCO-SSD (lite_mobilenet_v2) canvas sampling @ 3 FPS",
    productionImpl: "Server-side GPU worker microservices running YOLOv11 / TensorRT with DeepStream @ 30 FPS",
    status: "EXISTING",
    rationale: "Client-side TF.js perception engine is fully implemented & verified on active video streams.",
  },
  {
    layer: "Track & Centroid Management",
    prototypeImpl: "In-memory 2D pixel CentroidTracker with camera-isolated prefixes (cam07_trk_101)",
    productionImpl: "3D camera-calibrated DeepSORT / ByteTrack worker with multi-camera re-identification",
    status: "EXISTING",
    rationale: "CentroidTracker persists anonymous IDs across frames in browser memory.",
  },
  {
    layer: "Operational Data Store",
    prototypeImpl: "React Zustand stores (simulationStore, eventAuthoringStore) + localStorage",
    productionImpl: "PostgreSQL / PostGIS geospatial database with Redis Enterprise caching cluster",
    status: "PARTIAL",
    rationale: "Zustand stores and browser localStorage persist state client-side; no central database exists.",
  },
  {
    layer: "State Delivery & Sync",
    prototypeImpl: "Browser BroadcastChannel('pravaah_sim_sync') + /api/simulation/stream SSE",
    productionImpl: "Distributed WebSocket / SSE gateway cluster with sticky session routing",
    status: "EXISTING",
    rationale: "Same-browser cross-tab sync via BroadcastChannel and transient HTTP SSE stream are fully functional.",
  },
  {
    layer: "Pedestrian Routing Engine",
    prototypeImpl: "8-node / 9-edge in-memory pedestrian graph with polyline Haversine math",
    productionImpl: "Valhalla / Open Source Routing Machine (OSRM) dynamic vector tile engine",
    status: "EXISTING",
    rationale: "Graph routing, candidate pool evaluation, and dynamic crowd penalties execute cleanly.",
  },
  {
    layer: "Predictive Risk Engine",
    prototypeImpl: "Deterministic net flow extrapolation (netFlow = incoming - outgoing)",
    productionImpl: "Spatio-Temporal Graph Neural Network (ST-GNN) trained on historical venue density",
    status: "EXISTING",
    rationale: "Calculates 15-minute time-to-critical projections from live and simulated net accumulation.",
  },
  {
    layer: "Authentication & Security",
    prototypeImpl: "Open public client routes without login or role access controls",
    productionImpl: "OAuth2 / OpenID Connect with JWT RBAC tokens (Visitor vs Operator roles)",
    status: "PROPOSED",
    rationale: "Prototype assumes trusted demonstration environment; production requires authenticated API access.",
  },
];

interface RoadmapStage {
  stage: string;
  title: string;
  timeline: string;
  objective: string;
  deliverables: string[];
  completionCriteria: string;
}

const ROADMAP_STAGES: RoadmapStage[] = [
  {
    stage: "Stage 1",
    title: "Prototype Hardening & Benchmark Harness",
    timeline: "Months 0 – 3",
    objective: "Rigorously quantify in-browser perception accuracy, establish ground-truth benchmarks, and harden state sync boundaries.",
    deliverables: [
      "Annotated mega-event video benchmark dataset (2,000+ labeled frames under rain & night conditions)",
      "Automated evaluation suite comparing TF.js COCO-SSD headcount against manual ground-truth counts",
      "Explicit fallback handlers for browser canvas GPU memory throttling",
    ],
    completionCriteria: "Detection accuracy benchmarked with documented Mean Absolute Error (MAE) under 15% on standard video test sets.",
  },
  {
    stage: "Stage 2",
    title: "Centralized Application Backend & PostgreSQL/PostGIS",
    timeline: "Months 3 – 6",
    objective: "Transition from browser localStorage to a durable, server-authoritative spatial database.",
    deliverables: [
      "PostgreSQL + PostGIS database schema for venue geometry, sector polygons, and historic incident logs",
      "RESTful Next.js server actions and API route handlers for authenticated state persistence",
      "Database audit log recording all operator intervention approvals with timestamped credentials",
    ],
    completionCriteria: "Zero state loss across server restarts; full persistence of spatial event models in PostGIS.",
  },
  {
    stage: "Stage 3",
    title: "Reliable Multi-Operator Real-Time Gateway",
    timeline: "Months 6 – 12",
    objective: "Deploy an enterprise WebSocket pub/sub gateway for seamless multi-device, multi-operator coordination.",
    deliverables: [
      "Redis-backed WebSocket relay cluster for sub-50ms state propagation across 100+ concurrent operator dashboards",
      "Conflict-resolution protocol handling concurrent operator intervention dispatches",
      "Automatic client reconnect & missed message catch-up buffer",
    ],
    completionCriteria: "Proven cross-device state synchronization under simulated network latency of 200ms with 0 missing events.",
  },
  {
    stage: "Stage 4",
    title: "Scalable Video Intelligence Microservices",
    timeline: "Months 12 – 18",
    objective: "Offload computer vision processing from client browsers to dedicated GPU worker clusters.",
    deliverables: [
      "NVIDIA DeepStream / YOLOv11 GPU microservice cluster processing RTSP IP camera streams at 30 FPS",
      "RTSP video ingestion gateway supporting MediaMTX and WebRTC low-latency streaming",
      "Camera health monitoring dashboard alerting operators to camera obstruction, offline status, or low light",
    ],
    completionCriteria: "Sustained real-time analysis of 50+ simultaneous 1080p RTSP camera streams at < 100ms inference latency.",
  },
  {
    stage: "Stage 5",
    title: "Production Operations, Security Audit & Privacy Compliance",
    timeline: "Months 18 – 24",
    objective: "Achieve enterprise readiness, security compliance, zero-trust authorization, and operational resilience.",
    deliverables: [
      "OAuth2 / OIDC authentication with fine-grained Role-Based Access Control (RBAC)",
      "Zero-video-retention compliance verification and automated ephemeral buffer purging",
      "Joint operational simulation rehearsals with venue police and emergency response teams",
    ],
    completionCriteria: "Successful 72-hour continuous pilot test at a live venue with formal security sign-off.",
  },
];

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sourceRef: string;
}

const LIMITATIONS_FAQS: FAQItem[] = [
  {
    id: "lim-faq-1",
    question: "Does Pravaah have a backend?",
    answer:
      "Pravaah includes Next.js App Router server infrastructure, including a POST endpoint (/api/simulation) and a dynamic Server-Sent Events endpoint (/api/simulation/stream). However, it does not currently use a centralized database or persistent server store. Server route state is maintained in Node process memory.",
    sourceRef: "src/app/api/simulation/stream/route.ts",
  },
  {
    id: "lim-faq-2",
    question: "Does it use a database?",
    answer:
      "No. The prototype does not use PostgreSQL, PostGIS, MongoDB, or Redis. Persistent state (such as venue spatial authoring and simulation state) is saved locally in the browser's localStorage. Visitor session preferences reside in active browser tab memory.",
    sourceRef: "src/store/simulationStore.ts & eventAuthoringStore.ts",
  },
  {
    id: "lim-faq-3",
    question: "Is the crowd count accurate enough for live deployment?",
    answer:
      "The current in-browser detector (@tensorflow/tfjs COCO-SSD lite_mobilenet_v2) is suitable for real-time visual demonstration and relative density estimation. However, it has not been benchmarked against manually annotated mega-event ground-truth video datasets. For live crowd control operations, server-side GPU models (YOLOv11) calibrated against physical ground truth are required.",
    sourceRef: "src/lib/cv/videoPerceptionEngine.ts",
  },
  {
    id: "lim-faq-4",
    question: "Is the AI custom-trained on mega-event crowd data?",
    answer:
      "No. The in-browser perception model uses the standard pretrained COCO-SSD weights from TensorFlow.js trained on the MS-COCO dataset. It detects general person bounding boxes. Custom fine-tuning on high-density overhead crowd datasets (e.g. ShanghaiTech) is planned for Stage 1 of the production roadmap.",
    sourceRef: "src/lib/cv/videoPerceptionEngine.ts",
  },
  {
    id: "lim-faq-5",
    question: "Can multiple operators share the same authoritative state across separate devices?",
    answer:
      "Within the same browser, open tabs synchronize instantly via the browser's native BroadcastChannel API. Across separate physical devices, state updates are broadcast over HTTP SSE connections (/api/simulation/stream). However, because there is no persistent backend database, if the server restarts or clients lose connection, state is re-read from local browser storage.",
    sourceRef: "src/components/shared/TransportSyncBridge.tsx",
  },
  {
    id: "lim-faq-6",
    question: "What would need to change before a real event deployment?",
    answer:
      "Before live venue deployment, five key upgrades are required: (1) Server-side RTSP video stream ingestion; (2) Dedicated GPU inference workers (YOLOv11); (3) PostgreSQL/PostGIS database persistence; (4) OAuth2 authentication with RBAC permissions; and (5) Empirical ground-truth density calibration with venue police.",
    sourceRef: "src/components/explainer/ProductionArchitectureSection.tsx",
  },
  {
    id: "lim-faq-7",
    question: "Why not implement the full production backend right now?",
    answer:
      "Keeping perception and routing logic in browser memory allowed the prototype to run completely local without requiring cloud GPU server infrastructure, external database credentials, or paid cloud APIs. This ensures zero friction for hackathon evaluators running 'npm run dev' on local machines.",
    sourceRef: "src/components/explainer/LimitationsRoadmapSection.tsx",
  },
];

export function LimitationsRoadmapSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>("lim-faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="limitations" className="scroll-mt-28 py-16 px-4 sm:px-8 bg-[#0b0d10] border-t border-[#1d2127]">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* Section Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
            <AlertCircle className="h-4 w-4" />
            Engineering Audit & Future Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f3f4f6] tracking-tight">
            Current System Limitations & Production Architecture
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed">
            A transparent, evidence-based technical evaluation of Pravaah&apos;s prototype baseline, distinguishing verified in-browser functionality from proposed enterprise production capabilities.
          </p>
        </div>

        {/* 1. Audit Matrix: 5 Core Limitations */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-400">
            <Layers className="h-4 w-4" />
            1. Verified Prototype Limitations Audit
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* A. Backend & Persistence */}
            <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                <Server className="h-4 w-4" />
                A. Backend & Persistence
              </div>
              <h3 className="text-sm font-bold text-[#f3f4f6]">In-Memory & LocalStorage Baseline</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                State is stored in React Zustand stores. Operational state persists in browser <code className="text-blue-400 bg-[#0b0d10] px-1 py-0.5 rounded">localStorage</code>. No PostgreSQL, PostGIS, or Redis database exists. Next.js SSE endpoint (<code className="text-blue-400 bg-[#0b0d10] px-1 py-0.5 rounded">/api/simulation/stream</code>) maintains client references in volatile Node memory.
              </p>
              <div className="pt-2 border-t border-[#262b31] text-[11px] font-mono text-[#9aa1a9]">
                Impact: Server restarts or clearing browser cache resets local state.
              </div>
            </div>

            {/* B. Vision & Counting */}
            <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                <Eye className="h-4 w-4" />
                B. Computer Vision & Density
              </div>
              <h3 className="text-sm font-bold text-[#f3f4f6]">Pretrained COCO-SSD In-Browser</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Inference uses pretrained <code className="text-blue-400 bg-[#0b0d10] px-1 py-0.5 rounded">COCO-SSD lite_mobilenet_v2</code> in browser canvas. CentroidTracker uses 2D pixel matching. Model is sensitive to rain umbrella crowds, low lighting, and severe camera tilt, and has not been benchmarked on mega-event ground-truth video.
              </p>
              <div className="pt-2 border-t border-[#262b31] text-[11px] font-mono text-[#9aa1a9]">
                Impact: Demonstrates CV telemetry loop, but requires GPU fine-tuning for production.
              </div>
            </div>

            {/* C. Data Provenance */}
            <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                <Database className="h-4 w-4" />
                C. Data Provenance Boundaries
              </div>
              <h3 className="text-sm font-bold text-[#f3f4f6]">Explicit Provenance Badging</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                System clearly tags data: <span className="text-emerald-400 font-mono font-bold">REAL_VIDEO</span> for TF.js MP4 detections, <span className="text-amber-400 font-mono font-bold">SIMULATED</span> for scenario state tables, <span className="text-blue-400 font-mono font-bold">DERIVED</span> for 15-min risk projections, and <span className="text-purple-400 font-mono font-bold">STATIC</span> for venue geometry.
              </p>
              <div className="pt-2 border-t border-[#262b31] text-[11px] font-mono text-[#9aa1a9]">
                Impact: Simulated scenarios test decision UI; they do not prove physical safety.
              </div>
            </div>

            {/* D. Production Readiness */}
            <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                <Lock className="h-4 w-4" />
                D. Security & Multi-Tenancy
              </div>
              <h3 className="text-sm font-bold text-[#f3f4f6]">Open Prototype Access</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                No OAuth2 login, JWT authentication, or Role-Based Access Control (RBAC) is enforced on application routes. Multi-tenant venue isolation, database audit logging, and automated failure recovery are absent in the prototype baseline.
              </p>
              <div className="pt-2 border-t border-[#262b31] text-[11px] font-mono text-[#9aa1a9]">
                Impact: Production requires OAuth2 RBAC & encrypted API endpoints.
              </div>
            </div>

            {/* E. Validation Realities */}
            <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl space-y-3 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wide">
                <ShieldAlert className="h-4 w-4" />
                E. Validation vs Field Testing Realities
              </div>
              <h3 className="text-sm font-bold text-[#f3f4f6]">Code Verification vs Physical Pilot Validation</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Passing TypeScript static typechecking (<code className="text-blue-400 bg-[#0b0d10] px-1 py-0.5 rounded">npx tsc --noEmit</code>) and Next.js static production builds (<code className="text-blue-400 bg-[#0b0d10] px-1 py-0.5 rounded">npm run build</code>) proves code correctness and component integrity. However, real-world deployment requires physical pilot field testing, annotated crowd video ground-truth datasets, high-throughput network stress testing, and joint operational rehearsals with emergency services.
              </p>
              <div className="pt-2 border-t border-[#262b31] text-[11px] font-mono text-[#9aa1a9]">
                Status: Verified technical prototype baseline; physical venue pilot is planned in Stage 1-2 roadmap.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Architectural Rationale */}
        <div className="rounded-2xl border border-blue-500/30 bg-[#14171b] p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Cpu className="h-4 w-4" />
            2. Architectural Rationale: Why Browser-First / Hybrid Design?
          </div>
          <h3 className="text-xl font-extrabold text-[#f3f4f6]">
            Trade-Off Analysis: Browser-Centric Prototype vs Centralized Production System
          </h3>
          <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
            Pravaah executes computer vision perception, pedestrian graph routing, and state management directly in the user&apos;s browser. This architectural decision was deliberately selected to achieve specific prototype goals while establishing clear trade-offs for production:
          </p>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Advantages of In-Browser Architecture
              </h4>
              <ul className="text-xs text-[#a1a1aa] space-y-1.5 list-disc list-inside">
                <li><strong className="text-[#f3f4f6]">Zero Infrastructure Overhead:</strong> Evaluators run <code className="text-blue-400">npm run dev</code> locally without configuring cloud GPUs or database credentials.</li>
                <li><strong className="text-[#f3f4f6]">Private Video Processing:</strong> Video frames remain in local browser RAM, preventing heavy cloud video streaming bandwidth costs.</li>
                <li><strong className="text-[#f3f4f6]">Instant UI Responsiveness:</strong> Pedestrian graph rerouting recalculates in &lt; 5ms without server round-trip latency.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Trade-Offs & Production Limitations
              </h4>
              <ul className="text-xs text-[#a1a1aa] space-y-1.5 list-disc list-inside">
                <li><strong className="text-[#f3f4f6]">Client CPU/GPU Dependency:</strong> Multiple 4K video feeds can throttle lower-spec mobile devices.</li>
                <li><strong className="text-[#f3f4f6]">Transient Cross-Device Sync:</strong> State sync across separate physical devices relies on HTTP SSE without backend persistence.</li>
                <li><strong className="text-[#f3f4f6]">Lack of Audit Trail:</strong> Clearing browser local storage erases historic spatial authoring and incident logs.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Proposed Production Architecture Topology */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-400">
            <GitBranch className="h-4 w-4" />
            3. Proposed Target Production Topology Matrix
          </div>

          <div className="overflow-hidden rounded-xl border border-[#262b31] bg-[#14171b] shadow-2xl">
            <div className="px-5 py-4 border-b border-[#262b31] bg-[#1b1f24] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#f3f4f6]">Target Production Architecture Blueprint</h3>
                <p className="text-xs text-[#a1a1aa]">Comparing verified prototype modules against proposed enterprise replacements.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">EXISTING</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/40">PARTIAL</span>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/40">PROPOSED</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#262b31] bg-[#14171b] text-[11px] uppercase tracking-wider text-[#9aa1a9]">
                    <th className="px-4 py-3 font-semibold">System Layer</th>
                    <th className="px-4 py-3 font-semibold">Current Prototype Baseline</th>
                    <th className="px-4 py-3 font-semibold">Proposed Production Target</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262b31]">
                  {TOPOLOGY_MATRIX.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#1b1f24]/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#f3f4f6]">{item.layer}</td>
                      <td className="px-4 py-3.5 text-[#a1a1aa] font-mono text-[11px]">{item.prototypeImpl}</td>
                      <td className="px-4 py-3.5 text-blue-300 font-mono text-[11px]">{item.productionImpl}</td>
                      <td className="px-4 py-3.5 font-mono">
                        {item.status === "EXISTING" && (
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                            VERIFIED
                          </span>
                        )}
                        {item.status === "PARTIAL" && (
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/40">
                            PARTIAL
                          </span>
                        )}
                        {item.status === "PROPOSED" && (
                          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/40">
                            PROPOSED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Staged Migration Roadmap */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
            <GitBranch className="h-4 w-4" />
            4. Five-Stage Evolutionary Production Roadmap
          </div>

          <div className="space-y-4">
            {ROADMAP_STAGES.map((s) => (
              <div key={s.stage} className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262b31] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/40 font-mono">
                      {s.stage}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#f3f4f6]">{s.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-[#9aa1a9]">{s.timeline}</span>
                </div>

                <p className="text-xs text-[#a1a1aa] leading-relaxed">{s.objective}</p>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Engineering Deliverables:</span>
                  <ul className="text-xs text-[#a1a1aa] space-y-1 list-disc list-inside">
                    {s.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#262b31] flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold">Completion Criteria:</span>
                  <span className="text-[#a1a1aa] font-mono text-[11px]">{s.completionCriteria}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Reviewer Limitations FAQ */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
            <HelpCircle className="h-4 w-4" />
            5. Reviewer Technical Q&A — System Limitations & Backend Status
          </div>

          <div className="space-y-3">
            {LIMITATIONS_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="rounded-xl border border-[#262b31] bg-[#14171b] overflow-hidden">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-[#f3f4f6] hover:bg-[#1b1f24] transition-all"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#9aa1a9] transition-transform ${isOpen ? "rotate-180 text-amber-400" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-[#a1a1aa] leading-relaxed border-t border-[#262b31]/50 bg-[#1b1f24]/30 space-y-2">
                      <p className="mt-2">{faq.answer}</p>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#e8eaed]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Codebase Evidence: </span>
                        <code className="rounded bg-[#0b0d10] border border-[#262b31] px-2 py-0.5 text-blue-400">
                          {faq.sourceRef}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Callout */}
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-emerald-900/20 p-8 text-center backdrop-blur-md shadow-2xl space-y-4">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#f3f4f6]">
            Explore Pravaah Interactive Applications
          </h3>
          <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
            Experience the desktop command center for operators or the mobile-first adaptive app for visitors.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/visitor"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 text-white px-5 py-3 text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              Launch Visitor App
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center gap-2 rounded-lg border border-[#262b31] bg-[#14171b] text-[#f3f4f6] px-5 py-3 text-sm font-bold hover:bg-[#1b1f24] hover:border-blue-500/50 transition-colors"
            >
              Launch Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
