"use client";

import { Compass, HelpCircle } from "lucide-react";

export function ExpandedRoadmapSection() {
  const roadmapItems = [
    {
      horizon: "Near-Term (0–6 Months)",
      color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
      items: [
        {
          title: "1. RTSP / WebRTC Stream Ingestion Pipeline",
          problem: "Prototype currently plays local MP4 video clips instead of live RTSP IP camera feeds.",
          work: "Build server-side WebRTC ingestion worker using MediaMTX and FFmpeg stream transcoders.",
          deps: "Access to IP camera network feeds.",
          metric: "Stream latency < 400ms across 25 concurrent IP camera channels.",
        },
        {
          title: "2. Turn-by-Turn Audio & Offline Map Geofencing",
          problem: "Pilgrims lose cellular connectivity in high-density crowd precincts.",
          work: "Implement client-side Mapbox/PWA vector tile caching and Web Speech API audio guidance.",
          deps: "Offline vector tile bundle export.",
          metric: "100% navigation functionality retained offline during zero-cellular mock scenarios.",
        },
      ],
    },
    {
      horizon: "Medium-Term (6–18 Months)",
      color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
      items: [
        {
          title: "3. Spatio-Temporal Graph Neural Network (ST-GNN) Forecasting",
          problem: "Current prediction engine uses deterministic 15-minute linear rate extrapolation.",
          work: "Train a Graph Neural Network on historical mega-event crowd density data.",
          deps: "Curated multi-day crowd density datasets.",
          metric: "15-minute prediction accuracy > 92% across non-linear surge events.",
        },
        {
          title: "4. Multi-Tenant Role-Based Access Control (RBAC)",
          prototype: "Open client routes without authentication.",
          work: "Integrate OAuth2 / OIDC with hardware FIDO2 key authentication for command center staff.",
          deps: "Enterprise identity provider integration.",
          metric: "Complete audit log compliance for 100% of operator intervention approvals.",
        },
      ],
    },
    {
      horizon: "Long-Term (18–36 Months)",
      color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      items: [
        {
          title: "5. Autonomous Barricade & Signage Integration",
          problem: "Human dispatch of physical barricades creates a 10-15 minute deployment delay.",
          work: "Connect command center intervention dispatch to automated electronic LED signs and smart gates.",
          deps: "IoT smart gate infrastructure API.",
          metric: "Reduced barrier deployment response time from 12 minutes to < 30 seconds.",
        },
      ],
    },
  ];

  const researchQuestions = [
    {
      q: "1. Occlusion Density Estimation",
      text: "How accurately can object detection models estimate crowd headcount under severe overhead occlusion, low lighting, or extreme umbrella density during rain?",
    },
    {
      q: "2. Spatial Prediction Calibration",
      text: "How should predictive lead times (e.g. 15-min lookahead) be calibrated for radically different event geometries, such as narrow river ghat staircases versus wide open parade grounds?",
    },
    {
      q: "3. Recommendation Stability vs Dynamic Risk",
      text: "How can the routing engine prevent 'route oscillation' (where thousands of visitors accept a bypass, immediately congesting the bypass and causing constant flip-flopping)?",
    },
    {
      q: "4. Operational Trust & Human-in-the-Loop Thresholds",
      text: "What empirical evidence and safety verification thresholds are required before police emergency operators can comfortably trust automated gate diversion recommendations?",
    },
    {
      q: "5. Telemetry Degradation Fallbacks",
      text: "What explicit fallback state transitions should occur when 50%+ of camera feeds go offline simultaneously due to local power outages?",
    },
  ];

  return (
    <section id="expanded-roadmap" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
          <Compass className="h-4 w-4" />
          Future Roadmap & Open Research Questions
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          System Evolution & Technical Horizon
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-10">
          A structured engineering roadmap outlining upcoming milestones, technical requirements, and core open research questions in crowd dynamics.
        </p>

        {/* Structured Roadmap */}
        <div className="space-y-8 mb-12">
          {roadmapItems.map((group, idx) => (
            <div key={idx} className="rounded-xl border border-[#262b31] bg-[#14171b] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-[#262b31] pb-3">
                <h3 className="text-base font-bold text-[#f3f4f6]">{group.horizon}</h3>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${group.color}`}>
                  Milestone Phase
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#f3f4f6] mb-2">{item.title}</h4>
                      <div className="space-y-2 text-xs mb-3">
                        <div>
                          <span className="font-semibold text-rose-400">Problem: </span>
                          <span className="text-[#a1a1aa]">{item.problem}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-blue-400">Work Required: </span>
                          <span className="text-[#e8eaed]">{item.work}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-400">Dependencies: </span>
                          <span className="text-[#9aa1a9]">{item.deps}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#262b31] text-[11px]">
                      <span className="font-bold text-emerald-400">Success Metric: </span>
                      <span className="text-[#e8eaed]">{item.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Open Research Questions */}
        <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-6 shadow-xl">
          <h3 className="text-lg font-bold text-[#f3f4f6] mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-400" />
            Core Open Research Questions
          </h3>
          <p className="text-xs text-[#a1a1aa] mb-6">
            Key research challenges identified during the prototype audit that require empirical study in live pilot deployments.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {researchQuestions.map((rq, idx) => (
              <div key={idx} className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-4 text-xs">
                <span className="font-bold text-blue-400 block mb-1">{rq.q}</span>
                <p className="text-[#a1a1aa] leading-relaxed">{rq.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
