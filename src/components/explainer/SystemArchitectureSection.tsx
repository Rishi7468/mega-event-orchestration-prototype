"use client";

import { Layers } from "lucide-react";
import { VisualSystemArch } from "./visuals/VisualSystemArch";

export function SystemArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <Layers className="h-4 w-4" />
          System Architecture
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Four Tiers, One Intelligence Engine
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          Pravaah decouples computer vision ingestion, pedestrian graph math, operator decision support, and visitor adaptive routing into clean, modular tiers synchronized by a single authoritative state store.
        </p>

        {/* VISUAL-01 Component */}
        <VisualSystemArch />
      </div>
    </section>
  );
}
