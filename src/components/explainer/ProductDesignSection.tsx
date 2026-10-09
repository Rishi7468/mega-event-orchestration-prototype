"use client";

import { Users, Smartphone, Monitor, Shield, CheckCircle2, Layers, Target } from "lucide-react";

export function ProductDesignSection() {
  const personas = [
    {
      role: "Visitor / Pilgrim",
      icon: Smartphone,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      goal: "Navigate safely, reach sacred landmarks (e.g., Sangam, Hanuman Temple) on schedule, and avoid chaotic bottlenecks.",
      decisions: "Which gate to use, when to arrive, which accommodation zone to pick, whether to accept mid-trip bypass routes.",
      painPoints: "Overwhelming crowd density, sudden gate closures, lack of real-time walking guidance, mobile battery drain.",
      implementedToday: "Mobile-first journey planner, event-aware gate recommendations, live dynamic corridor bypass alerts.",
      productionNeeds: "Turn-by-turn audio guidance, offline geofenced map caching, multi-language support (Hindi, Marathi, Tamil, English).",
    },
    {
      role: "Command-Center Operator",
      icon: Monitor,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      goal: "Maintain destination-wide situational awareness, detect early congestion spikes before physical thresholds, approve interventions.",
      decisions: "When to open/close gates, where to dispatch shuttle buses, whether to issue visitor bypass recommendations.",
      painPoints: "Information overload, false alarm fatigue, delayed CCTV manual spot counting, lack of predictive lead time.",
      implementedToday: "Desktop command dashboard, multi-camera TF.js video perception feed, 15-min predictive risk alerts, 1-click intervention approval.",
      productionNeeds: "Enterprise multi-monitor layout, role-based intervention audit log, automated barricade control integration.",
    },
    {
      role: "Field-Response Personnel",
      icon: Shield,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      goal: "Execute physical crowd control (barricade repositioning, shuttle staging, medical dispatch) based on command center orders.",
      decisions: "How to deploy physical barricades, where to redirect crowd flow at specific physical corridor junctions.",
      painPoints: "Unclear verbal radio orders, lack of visual sector density maps on handheld devices.",
      implementedToday: "Reflected in operator intervention action outcomes and visitor bypass guidance.",
      productionNeeds: "Dedicated handheld mobile app for field officers with real-time sector density map overlay and task confirmation buttons.",
    },
    {
      role: "Event Administrator / Spatial Planner",
      icon: Layers,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      goal: "Configure mega-event perimeters, zone capacities, pedestrian graph corridors, camera locations, and emergency evacuation paths.",
      decisions: "Defining sector capacity limits, setting corridor width m² geometry, placing camera sensor nodes.",
      painPoints: "Manual GIS coordinate mapping, lack of historical crowd simulation playback.",
      implementedToday: "Spatial Event Builder with 4-stage planning wizard, sector polygon boundary editor, and what-if simulation modal.",
      productionNeeds: "CAD/GIS shapefile import/export, historical multi-day crowd density playback, multi-event template store.",
    },
  ];

  const visitorFlowSteps = [
    {
      step: 1,
      title: "1. Intent & Origin Selection",
      route: "/visitor/destination",
      action: "Selects event (Maha Kumbh Parv) and origin sector (Prayagraj Junction).",
      system: "Resolves destination zone capacity and baseline transit options.",
      store: "Updates visitorStore (originId, eventId).",
    },
    {
      step: 2,
      title: "2. Journey & Gate Recommendation",
      route: "/visitor/plan/journey",
      action: "Reviews recommended entry gates (Gate A vs Gate B) and arrival timing window.",
      system: "Evaluates 13 pedestrian graph candidate pools with dynamic crowd penalties.",
      store: "Reads simulationStore zone pressures; updates visitorStore selectedGate.",
    },
    {
      step: 3,
      title: "3. Multi-Stop Itinerary Optimization",
      route: "/visitor/plan/itinerary",
      action: "Selects desired landmark stops (Sangam, Hanuman Temple) and sets time budget.",
      system: "Evaluates landmark permutations considering queue wait times & dwell times.",
      store: "Outputs optimized itinerary sequence fitting user time budget.",
    },
    {
      step: 4,
      title: "4. Live Navigation & Adaptive Rerouting",
      route: "/visitor/live",
      action: "Navigates toward venue corridor. Receives dynamic congestion bypass alert.",
      system: "Detects Gate A spike (+14m penalty); prompts visitor to reroute via Gate B Bypass.",
      store: "Syncs acceptance state back to simulationStore via BroadcastChannel.",
    },
  ];

  const operatorFlowSteps = [
    {
      step: 1,
      title: "1. Command Center Monitoring",
      route: "/operator",
      action: "Operator views 4-sector capacity map, Leaflet layers, and multi-camera feeds.",
      system: "Continuously computes live zone density and net accumulation rates.",
      store: "Subscribes to simulationStore phase snapshots and camera telemetry.",
    },
    {
      step: 2,
      title: "2. Predictive Risk Alert Detection",
      route: "/operator",
      action: "System flags Gate A corridor approaching CRITICAL occupancy in ~8 minutes.",
      system: "predictionEngine.ts computes net accumulation (+220/m) and time-to-critical.",
      store: "Generates explainable recommendation banner in operator dashboard.",
    },
    {
      step: 3,
      title: "3. Evidence Inspection & Verification",
      route: "/operator/crowd",
      action: "Operator inspects active camera stream (CAM-07) and TF.js person count telemetry.",
      system: "Renders live video overlay with person tracks (cam07_trk_101..114) and confidence grade.",
      store: "Displays evidence breakdown verifying REAL_VIDEO CV origin.",
    },
    {
      step: 4,
      title: "4. Intervention Approval & Outcome Tracking",
      route: "/operator/interventions",
      action: "Operator clicks 'Approve Gate B Bypass Diversion Barricade'.",
      system: "Dispatches intervention state; redistributes 35% crowd demand to Gate B.",
      store: "Broadcasting state sync updates visitor tabs and records before/after metrics.",
    },
  ];

  const validationMetrics = [
    {
      category: "Visitor Usability",
      metric: "Time-to-Route Generation",
      definition: "Seconds required for a visitor to select origin and generate an optimal journey plan.",
      target: "< 8 seconds",
      method: "Client-side performance logging during visitor onboarding UX tests.",
    },
    {
      category: "Visitor Adherence",
      metric: "Bypass Recommendation Acceptance",
      definition: "Percentage of visitors who accept live corridor bypass reroute suggestions.",
      target: "> 65% acceptance",
      method: "Telemetry logging of visitorSignalStore acceptance events during live simulations.",
    },
    {
      category: "Operator Efficiency",
      metric: "Time-to-Bottleneck Identification",
      definition: "Seconds elapsed from initial congestion spike to operator alert review.",
      target: "< 15 seconds",
      method: "Timestamp comparison between vision telemetry spike and operator action dispatch.",
    },
    {
      category: "Predictive Accuracy",
      metric: "15-Minute Forecast Error Margin",
      definition: "Absolute percentage variance between predicted 15-min headcount and observed count.",
      target: "< ±8.5% error",
      method: "Comparing predictionEngine projections against subsequent camera telemetry counts.",
    },
    {
      category: "System Performance",
      metric: "Perception Telemetry Freshness",
      definition: "Latency between video frame capture and UI crowd density update.",
      target: "< 500 ms",
      method: "Browser performance timer measuring frame sampling tick to Zustand store write.",
    },
  ];

  return (
    <section id="product-design" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <Users className="h-4 w-4" />
          Product Design & Experience Strategy
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Human-Centered Orchestration for Mega-Events
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-10">
          Pravaah bridges the gap between individual visitor trip decisions and destination-wide command decisions by maintaining a single, shared operational state loop across distinct user surfaces.
        </p>

        {/* Section A: Problem Framing */}
        <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-6 mb-10 shadow-xl">
          <h3 className="text-lg font-bold text-[#f3f4f6] mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Problem Framing & Information Asymmetry
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-[#a1a1aa] leading-relaxed">
            <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-4">
              <span className="font-bold text-amber-400 block mb-1">Visitor Information Deficit</span>
              Visitors arrive at mega-events with zero visibility into real-time gate queues, corridor bottlenecking, or sector capacities. Without intervention, thousands follow the same visible crowds toward saturated entry points, creating physical stampede risks.
            </div>
            <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-4">
              <span className="font-bold text-blue-400 block mb-1">Operator Decision Overload</span>
              Command center operators monitor dozens of raw CCTV monitors without automated density metrics or predictive lead time. By the time spotters manually report overcrowding, physical congestion has already peaked beyond easy control.
            </div>
          </div>
        </div>

        {/* Section B: User Personas & Needs */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-[#f3f4f6] mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            User Personas & Operational Needs
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.role} className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3 border-b border-[#262b31] pb-3">
                      <div className={`p-2 rounded-lg border ${p.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#f3f4f6]">{p.role}</h4>
                        <span className="text-[11px] text-[#9aa1a9]">Target User Role</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-[#f3f4f6]">Primary Goal: </span>
                        <span className="text-[#a1a1aa]">{p.goal}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-400">Key Decisions: </span>
                        <span className="text-[#e8eaed]">{p.decisions}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-rose-400">Pain Points: </span>
                        <span className="text-[#a1a1aa]">{p.painPoints}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#262b31] space-y-1 text-[11px]">
                    <div>
                      <span className="font-bold text-emerald-400">Implemented Today: </span>
                      <span className="text-[#e8eaed]">{p.implementedToday}</span>
                    </div>
                    <div>
                      <span className="font-bold text-purple-400">Production Need: </span>
                      <span className="text-[#9aa1a9]">{p.productionNeeds}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section C & D: End-to-End User Flows */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Visitor Flow */}
          <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl">
            <h3 className="text-base font-bold text-[#f3f4f6] mb-4 flex items-center gap-2 border-b border-[#262b31] pb-3">
              <Smartphone className="h-4 w-4 text-amber-400" />
              Visitor User Flow Execution
            </h3>
            <div className="space-y-3">
              {visitorFlowSteps.map((s) => (
                <div key={s.step} className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#f3f4f6]">{s.title}</span>
                    <span className="font-mono text-[10px] text-blue-400">{s.route}</span>
                  </div>
                  <div className="text-[#a1a1aa] mb-1">
                    <span className="font-semibold text-amber-400">User Action: </span>{s.action}
                  </div>
                  <div className="text-[#e8eaed] text-[11px]">
                    <span className="font-semibold text-emerald-400">System Response: </span>{s.system}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operator Flow */}
          <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-xl">
            <h3 className="text-base font-bold text-[#f3f4f6] mb-4 flex items-center gap-2 border-b border-[#262b31] pb-3">
              <Monitor className="h-4 w-4 text-blue-400" />
              Operator User Flow Execution
            </h3>
            <div className="space-y-3">
              {operatorFlowSteps.map((s) => (
                <div key={s.step} className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#f3f4f6]">{s.title}</span>
                    <span className="font-mono text-[10px] text-blue-400">{s.route}</span>
                  </div>
                  <div className="text-[#a1a1aa] mb-1">
                    <span className="font-semibold text-blue-400">Operator Action: </span>{s.action}
                  </div>
                  <div className="text-[#e8eaed] text-[11px]">
                    <span className="font-semibold text-emerald-400">System Response: </span>{s.system}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section G: Design Validation & Measurable Success Criteria */}
        <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#f3f4f6] mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Pilot Design Validation & Measurable Success Criteria
          </h3>
          <p className="text-xs text-[#a1a1aa] mb-6">
            Proposed quantitative evaluation targets for real-world pilot testing (labeled as validation targets to evaluate, not current verified achievements).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262b31] bg-[#1b1f24] text-[#f3f4f6]">
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Validation Metric</th>
                  <th className="py-2.5 px-3 font-semibold">Target Baseline</th>
                  <th className="py-2.5 px-3 font-semibold">Measurement Methodology</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262b31] text-[#a1a1aa]">
                {validationMetrics.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#1b1f24]/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-blue-400">{m.category}</td>
                    <td className="py-2.5 px-3 font-medium text-[#f3f4f6]">{m.metric}</td>
                    <td className="py-2.5 px-3 font-bold font-mono text-emerald-400">{m.target}</td>
                    <td className="py-2.5 px-3 text-[11px]">{m.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
