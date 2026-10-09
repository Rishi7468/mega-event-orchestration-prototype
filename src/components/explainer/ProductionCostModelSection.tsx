"use client";

import { useState } from "react";
import { Calculator, DollarSign, ShieldAlert, Sliders, Info } from "lucide-react";

export function ProductionCostModelSection() {
  // Interactive Calculator State
  const [cameraCount, setCameraCount] = useState<number>(25);
  const [operatingHoursPerDay, setOperatingHoursPerDay] = useState<number>(14);
  const [eventDays, setEventDays] = useState<number>(15);
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [inferenceMode, setInferenceMode] = useState<"EDGE" | "CLOUD">("EDGE");

  // Cost Formula Derivations (INR Lakhs)
  // 1 Lakh = 100,000 INR; 1 Crore = 10,000,000 INR
  const cameraUnitCostLakhs = inferenceMode === "EDGE" ? 1.25 : 0.45; // Jetson Orin Edge vs standard IP camera
  const hardwareSetupLakhs = Number((cameraCount * cameraUnitCostLakhs + 1.5).toFixed(2));

  const totalCameraHours = cameraCount * operatingHoursPerDay * eventDays;
  const cloudGpuHourlyRateINR = inferenceMode === "CLOUD" ? 95 : 12; // AWS g5.xlarge vs lightweight MQTT relay
  const cloudInfraLakhs = Number(((totalCameraHours * cloudGpuHourlyRateINR + cameraCount * retentionDays * 150) / 100000).toFixed(2));

  const bandwidthLakhs = Number(((cameraCount * operatingHoursPerDay * eventDays * 1.8 * 80) / 100000).toFixed(2)); // GB bandwidth estimate
  const staffingLakhs = Number(((Math.ceil(cameraCount / 10) * 1.8 * eventDays * 3500) / 100000 + 2.5).toFixed(2));

  const totalBudgetLakhs = Number((hardwareSetupLakhs + cloudInfraLakhs + bandwidthLakhs + staffingLakhs).toFixed(2));
  const totalBudgetCrores = Number((totalBudgetLakhs / 100).toFixed(2));

  const tierScenarios = [
    {
      name: "1. Controlled Technical Pilot",
      cameras: 4,
      zones: 1,
      setupCost: "₹ 5.5 – 7.2 Lakhs",
      cloudCost: "₹ 0.8 – 1.4 Lakhs / mo",
      staffingCost: "₹ 2.0 – 3.0 Lakhs",
      totalRange: "₹ 8.3 – 11.6 Lakhs",
      description: "4 IP cameras at a single venue entry precinct (e.g., Gate A). Suitable for initial technical validation.",
    },
    {
      name: "2. Medium Event Deployment",
      cameras: 25,
      zones: 4,
      setupCost: "₹ 28 – 35 Lakhs",
      cloudCost: "₹ 4.5 – 7.2 Lakhs / mo",
      staffingCost: "₹ 8.0 – 12 Lakhs",
      totalRange: "₹ 40.5 – 54.2 Lakhs",
      description: "25 cameras across 4 operational sectors (Central, North, East, South). Recommended deployment for city-scale festivals.",
    },
    {
      name: "3. Mega-Event Deployment",
      cameras: 100,
      zones: 12,
      setupCost: "₹ 1.15 – 1.45 Crores",
      cloudCost: "₹ 18 – 28 Lakhs / mo",
      staffingCost: "₹ 35 – 50 Lakhs",
      totalRange: "₹ 1.68 – 2.23 Crores",
      description: "100+ cameras across 12 sectors with full redundancy, high availability, and 24/7 dedicated field response.",
    },
  ];

  return (
    <section id="cost-model" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          <Calculator className="h-4 w-4" />
          Production Cost & Scaling Model
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Deployment Budget Framework & Cost Sensitivity
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-10">
          A transparent, formula-driven production budget model in Indian Rupees (INR) evaluating hardware procurement, cloud GPU compute, bandwidth, and operational staffing.
        </p>

        {/* Section A: Key Cost Assumptions */}
        <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-6 mb-10 shadow-xl">
          <h3 className="text-lg font-bold text-[#f3f4f6] mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" />
            Budget Model Assumptions & Methodology
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-xs text-[#a1a1aa] leading-relaxed">
            <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-3.5">
              <span className="font-bold text-[#f3f4f6] block mb-1">Currency & Region</span>
              Indian Rupees (INR ₹). Primary cloud infrastructure hosted in AWS Asia Pacific (Mumbai `ap-south-1`) for low latency and data residency compliance.
            </div>
            <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-3.5">
              <span className="font-bold text-[#f3f4f6] block mb-1">Inference Architecture</span>
              Compares Edge Compute (NVIDIA Jetson Orin modules at camera poles) versus Cloud GPU instances (AWS `g5.xlarge` NVIDIA A10G instances).
            </div>
            <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-3.5">
              <span className="font-bold text-[#f3f4f6] block mb-1">Operational Baseline</span>
              14 operating hours per day during peak bathing hours, 7-day rolling video retention buffer, and 1M+ visitor SSE message distribution.
            </div>
          </div>
        </div>

        {/* Section B: 3 Deployment Tier Scenarios */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-[#f3f4f6] mb-6 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-400" />
            Deployment Tier Budget Estimates
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {tierScenarios.map((s, idx) => (
              <div key={idx} className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#f3f4f6] mb-1 border-b border-[#262b31] pb-2">{s.name}</h4>
                  <p className="text-[11px] text-[#9aa1a9] mb-4">{s.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#262b31]/50 pb-1">
                      <span className="text-[#a1a1aa]">Hardware & Setup:</span>
                      <span className="font-mono text-[#e8eaed]">{s.setupCost}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#262b31]/50 pb-1">
                      <span className="text-[#a1a1aa]">Cloud & Ingest Infra:</span>
                      <span className="font-mono text-[#e8eaed]">{s.cloudCost}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#262b31]/50 pb-1">
                      <span className="text-[#a1a1aa]">Staffing & Support:</span>
                      <span className="font-mono text-[#e8eaed]">{s.staffingCost}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#262b31] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#f3f4f6]">Est. Total Budget:</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{s.totalRange}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section C: Interactive Production Cost Calculator */}
        <div className="rounded-xl border border-blue-500/40 bg-[#14171b] p-6 shadow-2xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-[#262b31] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Sliders className="h-4 w-4" />
                Interactive Production Cost Estimator
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#f3f4f6]">
                Dynamic Deployment Budget Calculator
              </h3>
            </div>

            {/* Inference Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#1b1f24] p-1 rounded-lg border border-[#262b31]">
              <button
                onClick={() => setInferenceMode("EDGE")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  inferenceMode === "EDGE"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-[#9aa1a9] hover:text-[#f3f4f6]"
                }`}
              >
                Edge Compute (Jetson)
              </button>
              <button
                onClick={() => setInferenceMode("CLOUD")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  inferenceMode === "CLOUD"
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-[#9aa1a9] hover:text-[#f3f4f6]"
                }`}
              >
                Cloud GPU (AWS g5)
              </button>
            </div>
          </div>

          {/* Calculator Controls Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 text-xs">
            {/* Slider 1: Camera Count */}
            <div className="space-y-2 rounded-lg border border-[#262b31] bg-[#1b1f24] p-4">
              <div className="flex justify-between font-semibold text-[#f3f4f6]">
                <span>Active CCTV Cameras:</span>
                <span className="font-mono text-blue-400 font-bold">{cameraCount} Cameras</span>
              </div>
              <input
                type="range"
                min="4"
                max="150"
                step="1"
                value={cameraCount}
                onChange={(e) => setCameraCount(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[11px] text-[#9aa1a9] block">Scales hardware procurement and stream ingestion workers.</span>
            </div>

            {/* Slider 2: Daily Operating Hours */}
            <div className="space-y-2 rounded-lg border border-[#262b31] bg-[#1b1f24] p-4">
              <div className="flex justify-between font-semibold text-[#f3f4f6]">
                <span>Daily Operating Hours:</span>
                <span className="font-mono text-blue-400 font-bold">{operatingHoursPerDay} Hours / Day</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={operatingHoursPerDay}
                onChange={(e) => setOperatingHoursPerDay(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[11px] text-[#9aa1a9] block">Peak hours per day camera perception feeds are actively sampled.</span>
            </div>

            {/* Slider 3: Event Days */}
            <div className="space-y-2 rounded-lg border border-[#262b31] bg-[#1b1f24] p-4">
              <div className="flex justify-between font-semibold text-[#f3f4f6]">
                <span>Event Duration:</span>
                <span className="font-mono text-blue-400 font-bold">{eventDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="45"
                step="1"
                value={eventDays}
                onChange={(e) => setEventDays(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[11px] text-[#9aa1a9] block">Total duration of the mega-event operational deployment.</span>
            </div>

            {/* Slider 4: Video Retention Days */}
            <div className="space-y-2 rounded-lg border border-[#262b31] bg-[#1b1f24] p-4">
              <div className="flex justify-between font-semibold text-[#f3f4f6]">
                <span>Video Retention Buffer:</span>
                <span className="font-mono text-blue-400 font-bold">{retentionDays} Days Buffer</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[11px] text-[#9aa1a9] block">Rolling video clip storage buffer for audit compliance.</span>
            </div>
          </div>

          {/* Calculator Output Display */}
          <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9aa1a9] mb-4">Calculated Budget Breakdown (INR)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-5">
              <div className="p-3 rounded-lg border border-[#262b31] bg-[#14171b]">
                <span className="text-[#9aa1a9] block text-[11px]">Hardware & Setup</span>
                <span className="text-sm sm:text-base font-mono font-bold text-[#f3f4f6]">₹ {hardwareSetupLakhs} L</span>
              </div>
              <div className="p-3 rounded-lg border border-[#262b31] bg-[#14171b]">
                <span className="text-[#9aa1a9] block text-[11px]">Cloud Compute</span>
                <span className="text-sm sm:text-base font-mono font-bold text-[#f3f4f6]">₹ {cloudInfraLakhs} L</span>
              </div>
              <div className="p-3 rounded-lg border border-[#262b31] bg-[#14171b]">
                <span className="text-[#9aa1a9] block text-[11px]">Bandwidth & SSE</span>
                <span className="text-sm sm:text-base font-mono font-bold text-[#f3f4f6]">₹ {bandwidthLakhs} L</span>
              </div>
              <div className="p-3 rounded-lg border border-[#262b31] bg-[#14171b]">
                <span className="text-[#9aa1a9] block text-[11px]">Staffing & Support</span>
                <span className="text-sm sm:text-base font-mono font-bold text-[#f3f4f6]">₹ {staffingLakhs} L</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#262b31]">
              <div>
                <span className="text-xs font-bold text-[#f3f4f6]">Total Estimated Deployment Budget:</span>
                <span className="text-[11px] text-[#9aa1a9] block">Formula derived from active input sliders</span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-3xl font-mono font-extrabold text-emerald-400">
                  ₹ {totalBudgetLakhs} Lakhs
                </span>
                {totalBudgetCrores >= 1.0 && (
                  <span className="text-xs font-mono text-purple-400 block font-bold">
                    (~ ₹ {totalBudgetCrores} Crores INR)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Responsible Cost Disclaimer */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 leading-relaxed flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Responsible Budget Disclosure</span>
            These figures represent planning budget estimates derived from standard hardware vendor costs and AWS India cloud pricing as of 2026. They are intended for hackathon review and pilot planning, not binding commercial quotations. Actual deployment costs will depend on ground fiber availability, local field labor contracts, and government procurement negotiations.
          </div>
        </div>
      </div>
    </section>
  );
}
