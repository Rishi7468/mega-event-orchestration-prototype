"use client";

import { MapPin, Route, Compass, Scale } from "lucide-react";

export function VisualPedestrianGraph() {
  const nodes = [
    { id: "node-south-hub", name: "South Sector Transit Hub", zone: "south" },
    { id: "node-temple", name: "Akshayavat Sacred Temple", zone: "south" },
    { id: "node-gate-a", name: "Gate A Checkpoint", zone: "central" },
    { id: "node-sangam-venue", name: "Sangam Bathing Ghat", zone: "central" },
    { id: "node-east-hub", name: "Cultural Arena & Exhibition", zone: "east" },
    { id: "node-north-hub", name: "Annapurna Food Market", zone: "north" },
    { id: "node-gate-b", name: "Gate B Checkpoint", zone: "north" },
    { id: "node-central-hub", name: "Shankaracharya Pavilion", zone: "central" },
  ];

  return (
    <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262b31] pb-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">VISUAL-03</span>
          <h3 className="text-lg font-bold text-[#f3f4f6]">Event-Aware Pedestrian Routing Graph</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#9aa1a9]">
          <Route className="h-4 w-4 text-blue-400" />
          8 Graph Nodes · 9 Edges · 13 Zone Pairs
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Cost Formula Box */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-3">
              <Scale className="h-4 w-4 text-amber-400" />
              Event-Aware Route Cost Evaluation Function
            </div>
            <div className="rounded-lg border border-[#262b31] bg-[#14171b] p-4 font-mono text-xs text-[#e8eaed] space-y-2">
              <div className="text-blue-400 font-bold">
                Cost = Base Travel Mins + Dynamic Crowd Penalty + Prediction Penalty + Incident Penalty
              </div>
              <div className="text-[11px] text-[#a1a1aa] pt-2 border-t border-[#262b31] space-y-1">
                <p>• Base Mins = Polyline Haversine Distance (m) / 70 m/min speed</p>
                <p>• Dynamic Crowd Penalty = LOW (0m), MODERATE (+3m), HIGH (+7m), CRITICAL (+14m)</p>
                <p>• Prediction Penalty = CRITICAL risk forecast (+8m lookahead penalty)</p>
                <p>• Incident Penalty = Active zone intervention (+15m bypass threshold)</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-4">
            Evaluated continuously by <code className="text-[#60a5fa]">calculateEventAwareRoutes()</code> in{" "}
            <code className="text-[#e8eaed]">src/lib/intelligence/eventRoutingEngine.ts</code>.
          </p>
        </div>

        {/* Canonical Nodes Grid */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-3">
              <MapPin className="h-4 w-4 text-emerald-400" />
              Canonical Landmark Nodes & Graph Network
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {nodes.map((n) => (
                <div key={n.id} className="p-2.5 rounded-lg border border-[#262b31] bg-[#14171b] flex items-center gap-2 truncate">
                  <Compass className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  <div className="min-w-0 truncate">
                    <p className="font-semibold text-[#f3f4f6] truncate">{n.name}</p>
                    <p className="text-[10px] text-[#9aa1a9] uppercase font-mono">{n.zone} Zone</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-4">
            Node geography defined in <code className="text-[#e8eaed]">src/lib/graph/pedestrianGraph.ts</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
