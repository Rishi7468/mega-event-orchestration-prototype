"use client";

import { Activity } from "lucide-react";

export function WorkedExampleSection() {
  const steps = [
    {
      step: 1,
      title: "Baseline State Initialization",
      module: "src/store/simulationStore.ts",
      input: "Initial state phase = 'normal', Gate A pressure = 42%, Central Zone density = 1.1 p/m²",
      output: "Pedestrian graph edges evaluated at base Haversine travel times. Gate A route cost = 16 min.",
      badge: "STATIC & SIMULATED",
      badgeColor: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10",
    },
    {
      step: 2,
      title: "Demand Spike Simulation / Video Frame Capture",
      module: "src/lib/cv/videoPerceptionEngine.ts",
      input: "MP4 Video Stream CAM-07 (camera-01.mp4) frame tick sampled at 300ms interval",
      output: "TF.js COCO-SSD detects 14 persons; CentroidTracker assigns active tracks `cam07_trk_101..114`",
      badge: "REAL_VIDEO (CV)",
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    },
    {
      step: 3,
      title: "Edge Congestion & Crowd State Processing",
      module: "src/lib/cv/cameraEdgeRegistry.ts & crowdStateEngine.ts",
      input: "Person count 14 mapped to edge `edge-south-gate-a` (occupancy climbs to 82%, density 2.6 p/m²)",
      output: "Crowd grade updated from MODERATE to HIGH; net influx rate calculated at +220 persons/min.",
      badge: "DERIVED METRIC",
      badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    },
    {
      step: 4,
      title: "15-Minute Predictive Risk Forecast",
      module: "src/lib/intelligence/predictionEngine.ts",
      input: "Current count 24,600 / 30,000 capacity; net accumulation rate +220/min",
      output: "Time-to-CRITICAL threshold (88% = 26,400) calculated at ~8.1 minutes. Forecast risk grade = CRITICAL.",
      badge: "DERIVED FORECAST",
      badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    },
    {
      step: 5,
      title: "Event-Aware Pedestrian Route Re-Ranking",
      module: "src/lib/intelligence/eventRoutingEngine.ts",
      input: "Candidate pools for South-to-Central trip: Route 1 (Gate A, 1.1km), Route 2 (Gate B Bypass, 1.4km)",
      output: "Route 1 cost = 16m base + 14m HIGH crowd penalty + 8m prediction penalty = 38 min. Route 2 cost = 20m base + 0m penalty = 20 min.",
      badge: "GRAPH MATH",
      badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    },
    {
      step: 6,
      title: "Adaptive Visitor Bypass Recommendation",
      module: "src/app/visitor/live/page.tsx & visitorStore.ts",
      input: "Active visitor journey step approaching Gate A corridor",
      output: "Visitor UI displays dynamic bypass banner: 'Reroute via Gate B Bypass recommended — saves ~18 min'.",
      badge: "VISITOR UTILITY",
      badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    },
    {
      step: 7,
      title: "Operator Review & Intervention Approval",
      module: "src/app/operator/page.tsx & simulationStore.ts",
      input: "Command center triggers recommendation alert: 'Dispatch Gate B Bypass Diversion Barricade'",
      output: "Human operator clicks 'Approve Intervention'. State transition dispatched to shared Zustand store.",
      badge: "HUMAN-IN-THE-LOOP",
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    },
    {
      step: 8,
      title: "Cross-Tab State Sync & Scenario Progression",
      module: "src/components/shared/TransportSyncBridge.tsx",
      input: "Store update event broadcast via `BroadcastChannel('pravaah_sim_sync')`",
      output: "Open visitor tabs automatically update journey route maps to Gate B corridor without page refresh.",
      badge: "CROSS-TAB SYNC",
      badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    },
    {
      step: 9,
      title: "Before / After Outcome Verification",
      module: "src/app/operator/page.tsx",
      input: "Phase advances to 'outcome'; demand redistributes 35% away from Gate A toward Gate B",
      output: "Gate A density drops to 1.4 p/m² (MODERATE); average corridor transit time drops from 38m to 21m.",
      badge: "OUTCOME METRIC",
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    },
  ];

  return (
    <section id="worked-example" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
          <Activity className="h-4 w-4" />
          End-to-End Walkthrough
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Complete Demo Scenario Execution Lifecycle
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          A step-by-step trace showing how input video frames, crowd telemetry, graph routing math, visitor prompts, operator approvals, and cross-tab sync execute end-to-end.
        </p>

        <div className="relative border-l border-[#262b31] ml-3 sm:ml-6 space-y-6">
          {steps.map((s) => (
            <div key={s.step} className="relative pl-6 sm:pl-8">
              <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1b1f24] border border-[#262b31] text-[11px] font-bold text-blue-400">
                {s.step}
              </span>
              <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-[#f3f4f6]">{s.title}</h3>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <div className="text-xs font-mono text-blue-400 mb-2">📄 {s.module}</div>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-2.5">
                    <span className="font-bold text-[#a1a1aa]">INPUT: </span>
                    <span className="text-[#e8eaed]">{s.input}</span>
                  </div>
                  <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-2.5">
                    <span className="font-bold text-emerald-400">OUTPUT: </span>
                    <span className="text-[#e8eaed]">{s.output}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
