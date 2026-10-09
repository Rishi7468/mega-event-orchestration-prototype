"use client";

import { Route } from "lucide-react";
import { VisualPedestrianGraph } from "./visuals/VisualPedestrianGraph";

export function GraphRoutingSection() {
  return (
    <section id="pedestrian-graph" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <Route className="h-4 w-4" />
          Pedestrian Graph Engine
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Canonical Node-Edge Network & Event-Aware Cost Math
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          The routing engine resolves paths over an 8-node, 9-edge pedestrian graph using polyline Haversine geometry and dynamic crowd density penalties.
        </p>

        {/* VISUAL-03 Component */}
        <VisualPedestrianGraph />
      </div>
    </section>
  );
}
