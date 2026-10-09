"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function ProblemStatementSection() {
  const comparisons = [
    {
      feature: "Map Intelligence Basis",
      traditional: "Static road vector tiles & highway GPS speed meters",
      pravaah: "Dynamic pedestrian corridor density & graph edge flow metrics",
    },
    {
      feature: "Crowd Monitoring Source",
      traditional: "Infrequent manual spot counts & phone cell tower blinks",
      pravaah: "Continuous TF.js computer vision perception worker & edge mapping",
    },
    {
      feature: "Rerouting & Bypass Dispatch",
      traditional: "Reactive physical police barricades after stampede risk",
      pravaah: "Dynamic 15-minute lookahead forecast & mobile visitor bypass prompts",
    },
    {
      feature: "Multi-Stop Planning",
      traditional: "Linear uncoordinated tourist maps ignoring queue congestion",
      pravaah: "Time-budget constrained permutation optimizer evaluating live queue wait",
    },
  ];

  return (
    <section id="problem-statement" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <AlertTriangle className="h-4 w-4" />
          The Mega-Event Challenge
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Why Traditional Crowd Management Fails at Million-Visitor Scale
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed">
          During mega-events like the Maha Kumbh Parv (1.25M+ visitors across 4 main sectors), standard navigation apps designed for vehicular traffic completely break down. Pedestrian flow throughput changes minute-by-minute as bathing ghats and sacred precincts reach capacity.
        </p>

        {/* Contrast Table */}
        <div className="mt-8 rounded-xl border border-[#262b31] bg-[#14171b] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-[#1b1f24] border-b border-[#262b31] p-4 text-xs font-bold text-[#f3f4f6]">
            <div>Operational Dimension</div>
            <div className="text-rose-400 flex items-center gap-1.5 mt-2 md:mt-0">
              <XCircle className="h-4 w-4" /> Traditional Event Management
            </div>
            <div className="text-emerald-400 flex items-center gap-1.5 mt-2 md:mt-0">
              <CheckCircle2 className="h-4 w-4" /> Pravaah Destination Intelligence
            </div>
          </div>

          <div className="divide-y divide-[#262b31] text-xs">
            {comparisons.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 hover:bg-[#1b1f24]/50 transition-colors">
                <div className="font-semibold text-[#f3f4f6]">{item.feature}</div>
                <div className="text-[#a1a1aa]">{item.traditional}</div>
                <div className="text-emerald-400 font-medium">{item.pravaah}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
