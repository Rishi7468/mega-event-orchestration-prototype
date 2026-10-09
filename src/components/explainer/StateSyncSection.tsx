"use client";

import { Radio } from "lucide-react";
import { VisualStateSync } from "./visuals/VisualStateSync";

export function StateSyncSection() {
  return (
    <section id="state-sync" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
          <Radio className="h-4 w-4" />
          State Synchronization
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Dual-Surface State Synchronization Lifecycle
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          Pravaah maintains real-time synchronization between the desktop operator command center and mobile visitor apps through reactive Zustand state selectors and browser `BroadcastChannel` APIs.
        </p>

        {/* VISUAL-05 Component */}
        <VisualStateSync />
      </div>
    </section>
  );
}
