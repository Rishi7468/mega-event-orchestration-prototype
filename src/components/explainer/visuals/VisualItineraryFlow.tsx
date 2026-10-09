"use client";

import { Clock, Navigation, CheckCircle2 } from "lucide-react";

export function VisualItineraryFlow() {
  const steps = [
    {
      num: 1,
      name: "Akshayavat Sacred Temple",
      zone: "south",
      arrival: "09:16 AM",
      departure: "09:56 AM",
      dwell: "35 min visit",
      queue: "~5m queue",
      crowd: "LOW",
      leg: "South Hub Sacred Pathway (16 min · 1152m)",
    },
    {
      num: 2,
      name: "Sangam Bathing Ghat",
      zone: "central",
      arrival: "11:19 AM",
      departure: "12:14 PM",
      dwell: "45 min visit",
      queue: "~10m queue",
      crowd: "MODERATE",
      leg: "Central Zone Direct Corridor (83 min · 5792m)",
    },
  ];

  return (
    <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262b31] pb-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">VISUAL-04</span>
          <h3 className="text-lg font-bold text-[#f3f4f6]">Multi-Stop Landmark Permutation Optimizer Flow</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <Clock className="h-4 w-4" />
          Time Budget: 240 min · Total Duration: ~194 min
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Step Breakdown Cards */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.num} className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold">
                    {step.num}
                  </span>
                  <h4 className="text-sm font-bold text-[#f3f4f6]">{step.name}</h4>
                </div>
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono">
                  {step.crowd} CROWD
                </span>
              </div>
              <div className="text-xs text-[#a1a1aa] space-y-1 font-mono">
                <p>🕒 {step.arrival} – {step.departure} ({step.dwell})</p>
                <p>⏳ Expected queue: {step.queue}</p>
                <p className="text-[#f3f4f6] pt-1 border-t border-[#262b31]">🚶 Leg: {step.leg}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Algorithm Logic Details */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-3">
              <Navigation className="h-4 w-4 text-purple-400" />
              Optimization Score Function
            </div>
            <div className="rounded-lg border border-[#262b31] bg-[#14171b] p-4 font-mono text-xs text-[#e8eaed] space-y-2">
              <div className="text-amber-400 font-bold">
                Stop Score = Priority + Crowd Comfort - Travel Penalty - Wait Penalty - Risk Penalty
              </div>
              <div className="text-[11px] text-[#a1a1aa] pt-2 border-t border-[#262b31] space-y-1">
                <p>• Dwell times dynamically adjusted per landmark category</p>
                <p>• Queue wait estimated directly from live zone density</p>
                <p>• Automatically drops lowest priority stop if sequence exceeds time budget</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>2 of 3 selected destinations fit within budget under current crowd levels.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
