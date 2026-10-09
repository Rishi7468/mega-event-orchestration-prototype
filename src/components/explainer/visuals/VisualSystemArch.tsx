"use client";

import { useState } from "react";
import { Camera, Cpu, Layers, Navigation, Server, ShieldCheck } from "lucide-react";

export function VisualSystemArch() {
  const [activeTier, setActiveTier] = useState<number>(1);

  const tiers = [
    {
      id: 1,
      title: "1. Perception Tier",
      subtitle: "Multi-Camera Vision Pipeline",
      icon: Camera,
      color: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
      description: "Background canvas sampling running @tensorflow/tfjs COCO-SSD object detection worker.",
      details: [
        "Centroid-based track isolation across 4 MP4 streams",
        "Target 15 FPS execution under heavy UI rendering",
        "Direct edge mapping via cameraEdgeRegistry.ts",
      ],
      codeRef: "src/lib/cv/videoPerceptionEngine.ts",
    },
    {
      id: 2,
      title: "2. Intelligence Tier",
      subtitle: "Pedestrian Graph & Forecasts",
      icon: Cpu,
      color: "border-blue-500/50 text-blue-400 bg-blue-500/10",
      description: "Canonical 8-node / 9-edge graph routing engine and 15-minute lookahead forecasting.",
      details: [
        "13 zone-pair candidate route pools (ROUTE_CANDIDATES_BY_PAIR)",
        "Haversine polyline distance + Dynamic crowd penalties",
        "Deterministic linear forecast extrapolation in predictionEngine.ts",
      ],
      codeRef: "src/lib/intelligence/eventRoutingEngine.ts",
    },
    {
      id: 3,
      title: "3. Command Tier",
      subtitle: "Desktop Command Center",
      icon: Layers,
      color: "border-purple-500/50 text-purple-400 bg-purple-500/10",
      description: "4-sector capacity management, Turf.js spatial event builder, and incident response loop.",
      details: [
        "Live sector crowd density monitoring & incident dispatch",
        "Dynamic sector polygon editing via eventAuthoringStore.ts",
        "7-stage deterministic scenario simulator",
      ],
      codeRef: "src/app/operator/page.tsx",
    },
    {
      id: 4,
      title: "4. Visitor Tier",
      subtitle: "Mobile Adaptation Utility",
      icon: Navigation,
      color: "border-amber-500/50 text-amber-400 bg-amber-500/10",
      description: "Mobile-first journey planner, multi-stop itinerary optimizer, and turn-by-turn guidance.",
      details: [
        "Time-budget constrained permutation optimizer (itineraryOptimizer.ts)",
        "Real-time corridor congestion bypass alerts",
        "Step-by-step turn-by-turn live navigation",
      ],
      codeRef: "src/app/visitor/plan/itinerary/page.tsx",
    },
  ];

  return (
    <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262b31] pb-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">VISUAL-01</span>
          <h3 className="text-lg font-bold text-[#f3f4f6]">Pravaah End-to-End System Architecture</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#9aa1a9]">
          <Server className="h-4 w-4 text-emerald-400" />
          Single State Store · Dual Surface Render
        </div>
      </div>

      {/* Interactive Tier Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isActive = activeTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? `${tier.color} shadow-lg ring-1 ring-current`
                  : "border-[#262b31] bg-[#1b1f24]/50 text-[#9aa1a9] hover:border-[#383f47] hover:text-[#f3f4f6]"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-mono opacity-80">Tier {tier.id}</span>
              </div>
              <p className="text-xs font-bold leading-tight truncate text-[#f3f4f6]">{tier.title}</p>
              <p className="text-[11px] opacity-75 truncate">{tier.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Tier Detail Panel */}
      {(() => {
        const current = tiers.find((t) => t.id === activeTier)!;
        const Icon = current.icon;
        return (
          <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${current.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#f3f4f6]">{current.title}</h4>
                  <p className="text-xs text-[#a1a1aa]">{current.description}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-md bg-[#0b0d10] border border-[#262b31] px-2.5 py-1 text-[11px] font-mono text-[#9aa1a9]">
                {current.codeRef}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {current.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-lg border border-[#262b31] bg-[#14171b] p-3 text-xs text-[#e8eaed]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
