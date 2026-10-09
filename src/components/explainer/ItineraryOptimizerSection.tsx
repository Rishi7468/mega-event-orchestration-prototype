"use client";

import { Compass } from "lucide-react";
import { VisualItineraryFlow } from "./visuals/VisualItineraryFlow";

export function ItineraryOptimizerSection() {
  return (
    <section id="itinerary-optimizer" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
          <Compass className="h-4 w-4" />
          Itinerary Optimizer
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Multi-Stop Landmark Permutation Optimization
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          `itineraryOptimizer.ts` evaluates combinations of requested landmarks, balancing travel time, queue wait times, visit dwell times, landmark priorities, and 15-minute predictive risks under a user time budget.
        </p>

        {/* VISUAL-04 Component */}
        <VisualItineraryFlow />
      </div>
    </section>
  );
}
