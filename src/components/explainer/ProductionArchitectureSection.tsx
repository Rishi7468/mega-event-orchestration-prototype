"use client";

import { Server, Cpu, RefreshCw, Layers } from "lucide-react";

export function ProductionArchitectureSection() {
  const comparisonRows = [
    {
      category: "Frontend & App Hosting",
      prototype: "Next.js App Router (Static export + Vercel free tier)",
      production: "Next.js multi-region CDN (AWS CloudFront / Vercel Enterprise) with edge SSR",
      rationale: "Ensures low-latency global assets and high availability for 1M+ concurrent visitors.",
      priority: "P0 — Critical",
    },
    {
      category: "Camera Ingest & Transport",
      prototype: "Local MP4 video files (`camera-01.mp4..04.mp4`) played via HTML video elements",
      production: "RTSP / WebRTC ingestion pipeline using MediaMTX & FFmpeg GPU hardware acceleration",
      rationale: "Enables direct real-time CCTV camera feed streaming from venue IP cameras.",
      priority: "P0 — Critical",
    },
    {
      category: "CV Inference Engine",
      prototype: "Client-side TF.js COCO-SSD (`lite_mobilenet_v2`) on background browser canvas @ 3-15 FPS",
      production: "Server-side GPU worker cluster running YOLOv11 / TensorRT with DeepStream @ 30 FPS",
      rationale: "Offloads client CPU/battery and provides high-density person count accuracy under occlusion.",
      priority: "P0 — Critical",
    },
    {
      category: "Crowd & Flow Processing",
      prototype: "In-memory TS engines (`crowdStateEngine.ts`, `flowGraphEngine.ts`)",
      production: "Apache Flink / Apache Kafka streaming analytics cluster for spatio-temporal aggregation",
      rationale: "Handles sub-second stream processing across hundreds of camera feeds simultaneously.",
      priority: "P1 — High",
    },
    {
      category: "Operational Data Store",
      prototype: "Zustand in-memory state stores + `localStorage` persistence",
      production: "PostgreSQL / PostGIS geospatial database with Redis enterprise caching cluster",
      rationale: "Provides ACID-compliant persistent audit logs, GIS spatial queries, and multi-tenant isolation.",
      priority: "P0 — Critical",
    },
    {
      category: "Event Delivery & Sync",
      prototype: "Browser `BroadcastChannel('pravaah_sim_sync')` cross-tab sync + basic SSE API route",
      production: "Distributed WebSocket / SSE gateway cluster (AWS API Gateway / Pusher Enterprise)",
      rationale: "Delivers instant cross-device state updates to thousands of field devices and operator consoles.",
      priority: "P0 — Critical",
    },
    {
      category: "Routing & Geospatial",
      prototype: "In-memory 8-node / 9-edge graph (`pedestrianGraph.ts`) with polyline Haversine math",
      production: "Valhalla / Open Source Routing Machine (OSRM) dynamic pedestrian graph engine",
      rationale: "Supports full-city OpenStreetMap vector tile routing across thousands of street corridors.",
      priority: "P1 — High",
    },
    {
      category: "Prediction Engine",
      prototype: "Deterministic 15-minute linear rate extrapolation `(netFlow * 15)`",
      production: "Spatio-temporal Graph Neural Network (ST-GNN) trained on historical crowd density",
      rationale: "Accounts for non-linear surge dynamics, weather impacts, and multi-hour event schedules.",
      priority: "P2 — Medium",
    },
    {
      category: "Auth & Access Control",
      prototype: "Open client routes (`/visitor`, `/operator`) without authentication",
      production: "OAuth2 / OIDC with Role-Based Access Control (RBAC) and hardware FIDO2 key support",
      rationale: "Restricts command center intervention approvals to verified emergency operations staff.",
      priority: "P0 — Critical",
    },
    {
      category: "Observability & Monitoring",
      prototype: "Browser `console.log` and UI status badges (`REAL_VIDEO`, `SIMULATED`)",
      production: "Prometheus + Grafana telemetry dashboard with Sentry error tracing and camera heartbeat alerts",
      rationale: "Ensures immediate operator alerts if a camera sensor node goes offline or drops frames.",
      priority: "P1 — High",
    },
    {
      category: "Security & Privacy",
      prototype: "Anonymous centroid tracking (`cam07_trk_101`) in client memory",
      production: "Zero personal data retention, automated face/plate blurring at edge, ISO 27001 audit compliance",
      rationale: "Guarantees public privacy compliance and eliminates biometric tracking liabilities.",
      priority: "P0 — Critical",
    },
    {
      category: "Deployment & Scaling",
      prototype: "Single static build deployed on Vercel preview",
      production: "Kubernetes (EKS) auto-scaling cluster with multi-availability-zone failover",
      rationale: "Prevents single-point-of-failure outages during peak mega-event attendance hours.",
      priority: "P1 — High",
    },
  ];

  const deploymentStages = [
    {
      stage: "Stage 0 — Current Prototype",
      badge: "Completed",
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      entry: "Functional 4-sector simulation state machine, in-browser TF.js perception worker, 8-node graph.",
      work: "Built Next.js UI, Zustand stores, pedestrian graph engine, technical explainer, and offline fallback.",
      exit: "100% type-safe build, 0 static compilation errors, reproducible browser demo execution.",
    },
    {
      stage: "Stage 1 — Controlled Technical Pilot",
      badge: "Target: Q1 2027",
      badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
      entry: "Access to 4 live CCTV IP camera streams at a single venue entry precinct.",
      work: "Deploy edge RTSP ingest worker, server GPU inference microservice, PostGIS database, and basic auth.",
      exit: "Successful 72-hour pilot test with live crowd telemetry streaming to command operators.",
    },
    {
      stage: "Stage 2 — Event-Ready Deployment",
      badge: "Target: Q3 2027",
      badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
      entry: "Approval from mega-event authority; integration with official transport & security feeds.",
      work: "Harden RBAC authorization, deploy WebSocket sync gateway, load test 100k concurrent visitors.",
      exit: "Full security audit clearance, zero data leak compliance certification, 99.9% uptime SLA.",
    },
    {
      stage: "Stage 3 — Multi-Zone Production",
      badge: "Target: Q1 2028",
      badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      entry: "Deployment across multiple venue sectors (e.g. 100+ cameras across 12 operational zones).",
      work: "Auto-scaling Kubernetes worker pods, Graph Neural Network predictive models, multi-city deployment.",
      exit: "Operational deployment handling 1M+ visitors with sub-second cross-device incident sync.",
    },
  ];

  return (
    <section id="production-architecture" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
          <Server className="h-4 w-4" />
          From Prototype to Production
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Production Architecture & Evolutionary Roadmap
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-10">
          A clear side-by-side breakdown comparing current prototype implementations against proposed production replacements required for mega-event deployment.
        </p>

        {/* Prototype vs Production Table */}
        <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-6 mb-12 shadow-xl">
          <h3 className="text-lg font-bold text-[#f3f4f6] mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            Current Implementation vs Proposed Production Extension
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262b31] bg-[#1b1f24] text-[#f3f4f6]">
                  <th className="py-3 px-3 font-semibold w-1/5">System Tier</th>
                  <th className="py-3 px-3 font-semibold w-1/4 text-amber-400">Current Prototype Implementation</th>
                  <th className="py-3 px-3 font-semibold w-1/3 text-emerald-400">Proposed Production Replacement</th>
                  <th className="py-3 px-3 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262b31] text-[#a1a1aa]">
                {comparisonRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#1b1f24]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#f3f4f6]">{r.category}</td>
                    <td className="py-3 px-3 text-[11px] text-[#e8eaed] bg-[#14171b]">{r.prototype}</td>
                    <td className="py-3 px-3 text-[11px] text-[#e8eaed] bg-[#1b1f24]/40">
                      <div>{r.production}</div>
                      <div className="mt-1 text-[10px] text-[#9aa1a9]">Rationale: {r.rationale}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px]">
                      <span className={`px-2 py-0.5 rounded border font-bold ${
                        r.priority.startsWith("P0")
                          ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                          : r.priority.startsWith("P1")
                          ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                          : "border-blue-500/40 text-blue-400 bg-blue-500/10"
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proposed Production Architecture Diagram */}
        <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-6 mb-12 shadow-xl">
          <h3 className="text-lg font-bold text-[#f3f4f6] mb-3 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            Proposed Target Production Topology (Enterprise Deployment)
          </h3>
          <p className="text-xs text-[#a1a1aa] mb-6">
            Visual topology distinguishing implemented prototype modules from proposed production microservices.
          </p>

          {/* Architecture Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono mb-6 p-3 rounded-lg border border-[#262b31] bg-[#1b1f24]">
            <span className="font-bold text-[#f3f4f6]">Topology Legend:</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>Implemented Prototype Component</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>Partially Implemented (Needs Gateway)</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
              <span>Proposed Production Extension</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <span className="font-bold text-emerald-400 block border-b border-emerald-500/20 pb-1">1. Frontend & Client Layer</span>
              <div className="text-[#e8eaed]">📱 Mobile Visitor Utility (`/visitor`)</div>
              <div className="text-[#e8eaed]">💻 Operator Command Center (`/operator`)</div>
              <div className="text-[#e8eaed]">📄 Explainer & Dossier (`/inside`)</div>
              <div className="text-[10px] text-[#9aa1a9] mt-2">Status: Fully Implemented (Next.js App Router)</div>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <span className="font-bold text-amber-400 block border-b border-amber-500/20 pb-1">2. Ingest & Perception Tier</span>
              <div className="text-[#e8eaed]">📹 RTSP/WebRTC Video Ingest Gateway</div>
              <div className="text-[#e8eaed]">⚡ Edge GPU Workers (YOLOv11 / DeepStream)</div>
              <div className="text-[#e8eaed]">🔍 Centroid Tracker & Camera Edge Registry</div>
              <div className="text-[10px] text-[#9aa1a9] mt-2">Status: Browser TF.js Implemented; RTSP Ingest Proposed</div>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
              <span className="font-bold text-purple-400 block border-b border-purple-500/20 pb-1">3. Storage & Analytics Tier</span>
              <div className="text-[#e8eaed]">🗄️ PostGIS Geospatial Database</div>
              <div className="text-[#e8eaed]">⚡ Redis Enterprise Pub/Sub Cluster</div>
              <div className="text-[#e8eaed]">🧠 Graph Neural Net Forecast Microservice</div>
              <div className="text-[10px] text-[#9aa1a9] mt-2">Status: Proposed Target Production Services</div>
            </div>
          </div>
        </div>

        {/* Staged Roadmap */}
        <div>
          <h3 className="text-lg font-bold text-[#f3f4f6] mb-6 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-emerald-400" />
            Staged Production Deployment Roadmap
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {deploymentStages.map((s, idx) => (
              <div key={idx} className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-[#262b31] pb-2">
                  <h4 className="text-sm font-bold text-[#f3f4f6]">{s.stage}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-blue-400">Entry Criteria: </span>
                    <span className="text-[#a1a1aa]">{s.entry}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#f3f4f6]">Engineering Work: </span>
                    <span className="text-[#e8eaed]">{s.work}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-400">Exit Criteria: </span>
                    <span className="text-[#a1a1aa]">{s.exit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
