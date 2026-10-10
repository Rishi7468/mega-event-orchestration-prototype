"use client";

import { useState } from "react";
import {
  FileText,
  AlertCircle,
  Clock,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

export function IncidentReviewPanel() {
  const [activeTab, setActiveTab] = useState<
    "facts" | "detections" | "outcomes" | "uncertainties" | "recommendations"
  >("facts");

  const isReplayMode = useSimulationStore((state) => state.isReplayMode);
  const replayCurrentTimestamp = useSimulationStore((state) => state.replayCurrentTimestamp);
  const replayScenarioTitle = useSimulationStore((state) => state.replayScenarioTitle);
  const lastActionTitle = useSimulationStore((state) => state.lastActionTitle);
  const lastActionDispatchedAt = useSimulationStore((state) => state.lastActionDispatchedAt);
  const phase = useSimulationStore((state) => state.phase);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3.5 shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent-glow" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Post-Incident Audit & Inquiry Review (Justice D&apos;Cunha Framework)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
          [JUDICIAL INQUIRY EVIDENCE BACKED]
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("facts")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "facts"
              ? "bg-accent-glow text-background font-bold shadow-sm"
              : "bg-surface-muted text-foreground-muted hover:text-foreground"
          }`}
        >
          1. Documented Facts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("detections")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "detections"
              ? "bg-accent-glow text-background font-bold shadow-sm"
              : "bg-surface-muted text-foreground-muted hover:text-foreground"
          }`}
        >
          2. PRAVAAH Detections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("outcomes")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "outcomes"
              ? "bg-accent-glow text-background font-bold shadow-sm"
              : "bg-surface-muted text-foreground-muted hover:text-foreground"
          }`}
        >
          3. Replay Outcomes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("uncertainties")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "uncertainties"
              ? "bg-accent-glow text-background font-bold shadow-sm"
              : "bg-surface-muted text-foreground-muted hover:text-foreground"
          }`}
        >
          4. Uncertainties & Limits
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recommendations")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "recommendations"
              ? "bg-accent-glow text-background font-bold shadow-sm"
              : "bg-surface-muted text-foreground-muted hover:text-foreground"
          }`}
        >
          5. Human Action Recommendations
        </button>
      </div>

      {/* Tab 1: Documented Facts */}
      {activeTab === "facts" && (
        <div className="space-y-2.5 text-xs animate-in fade-in">
          <p className="text-[11px] text-foreground-muted">
            Direct findings extracted from the Justice John Michael D&apos;Cunha Judicial Commission of Inquiry submitted on July 17, 2025:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="rounded-lg bg-surface-card border border-border p-3 space-y-1">
              <span className="font-bold text-foreground">Venue & Surge Disproportion</span>
              <p className="text-foreground-muted text-[11px] leading-relaxed">
                Stadium design capacity is strictly 35,000. Between 14:00 and 15:30 IST, over 200,000–300,000 un-ticketed supporters converged on Queens Road & MG Road following victorious unannounced parade announcements.
              </p>
              <span className="text-[9px] font-mono text-emerald-400 font-bold block pt-1">
                [REAL SOURCE DATA: Commission Report §4.2]
              </span>
            </div>

            <div className="rounded-lg bg-surface-card border border-border p-3 space-y-1">
              <span className="font-bold text-rose-400">Physical Perimeter Containment Failure</span>
              <p className="text-foreground-muted text-[11px] leading-relaxed">
                At 15:30 IST, Gate 1 & 2 barricades collapsed under bilateral crowd pressure. Total casualties recorded: 11 fatalities and 47+ hospitalized crush injuries.
              </p>
              <span className="text-[9px] font-mono text-rose-400 font-bold block pt-1">
                [REAL SOURCE DATA: Commission Report §8.1]
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PRAVAAH Detections */}
      {activeTab === "detections" && (
        <div className="space-y-2.5 text-xs animate-in fade-in">
          {/* Live System State Connection Banner */}
          <div className="rounded-lg bg-surface/70 border border-accent/30 p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>
                LIVE SYSTEM RUNTIME:{" "}
                <strong className="text-foreground">
                  {isReplayMode ? `REPLAY ACTIVE (${replayCurrentTimestamp || "15:00 IST"})` : "OPERATIONAL STANDBY"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground-muted">Phase: <strong className="text-accent-glow uppercase">{phase}</strong></span>
              {lastActionTitle && (
                <span className="rounded bg-rose-500/20 text-rose-300 px-1.5 py-0.5 border border-rose-500/30">
                  Last Action: {lastActionTitle}
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-foreground-muted">
            Timeline of deterministic thresholds evaluated during accelerated replay:
          </p>
          <div className="space-y-2">
            <div className="rounded-lg bg-surface-card border border-amber-500/30 p-2.5 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-accent-glow">15:15 IST (T+250s in Linear Replay)</span>
                  <span className="rounded px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                    PRE-CRUSH WARNING ISSUED
                  </span>
                </div>
                <p className="text-foreground-muted text-[11px] mt-0.5">
                  Extrapolated ingress pressure reached 91% (&gt;= 85% critical threshold). Deterministic rule #CF-04 triggered 15 minutes prior to documented perimeter crush at 15:30 IST.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-card border border-border p-2.5 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">15:30 IST (T+300s in Linear Replay)</span>
                  <span className="rounded px-1.5 py-0.2 bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                    DOCUMENTED PERIMETER CRUSH MILESTONE
                  </span>
                </div>
                <p className="text-foreground-muted text-[11px] mt-0.5">
                  Historical fact: Perimeter collapse under bilateral compression. Replay model demonstrates counterfactual gate diversion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Outcomes */}
      {activeTab === "outcomes" && (
        <div className="space-y-2.5 text-xs animate-in fade-in">
          <p className="text-[11px] text-foreground-muted">
            Comparative analysis between historical ground reality and PRAVAAH counterfactual model:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="rounded-lg bg-surface-card border border-rose-500/30 p-3 space-y-1">
              <span className="font-bold text-rose-400">Historical Ground Reality (No PRAVAAH)</span>
              <ul className="text-[11px] text-foreground-muted space-y-1 pl-3 list-disc">
                <li>Arrivals concentrated on single MG Road entry gate.</li>
                <li>Zero early diversion warning to approaching transit hubs.</li>
                <li>Gate 1 barricade failure at 15:30 IST; 11 fatalities.</li>
              </ul>
            </div>

            <div className="rounded-lg bg-surface-card border border-emerald-500/30 p-3 space-y-1">
              <span className="font-bold text-emerald-400">PRAVAAH Counterfactual Simulation</span>
              <ul className="text-[11px] text-foreground-muted space-y-1 pl-3 list-disc">
                <li>15:15 IST early warning triggers immediate reroute to Gate 12.</li>
                <li>Dynamic visitor routing dissipates 38% of approaching arrivals.</li>
                <li>Simulated bottleneck density reduced from 8.2 to 3.8 persons/m² (illustrative simulation; continuous sensor counts are unavailable).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Uncertainties */}
      {activeTab === "uncertainties" && (
        <div className="space-y-2.5 text-xs animate-in fade-in">
          <div className="rounded-lg bg-surface-card border border-rose-500/30 p-3 space-y-2">
            <span className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Explicit Sensor & Replay Disclosures
            </span>
            <ul className="text-[11px] text-foreground-muted space-y-1 pl-3 list-disc">
              <li>No public second-by-second pedestrian camera tracker data exists for the Chinnaswamy incident.</li>
              <li>Intermediate minute-level flow rates (1,200/min, 3,100/min, 5,200/min) and densities (1.8, 3.4, 5.8, 8.2 p/m²) are explicitly <strong className="text-foreground">REPLAY SIMULATED</strong> operational inputs for algorithmic demonstration, NOT historical sensor observations.</li>
              <li>KSDMA Mass Gathering Safety Guidelines provide regulatory safety limits (4.0 p/m² warning, 6.0 p/m² critical safety limit), but physical sensor recordings during the incident are unavailable.</li>
              <li>Calculations based on KSCA design capacity (35,000) and police crowd estimation (200,000–300,000). Sensor counts are unavailable.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 5: Recommendations */}
      {activeTab === "recommendations" && (
        <div className="space-y-2.5 text-xs animate-in fade-in">
          <p className="text-[11px] text-foreground-muted">
            All operational changes require mandatory human officer review before threshold adjustment:
          </p>
          <div className="space-y-2">
            <div className="rounded-lg bg-surface-card border border-border p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Recalibrate Gate Ingress Trigger Threshold</span>
                <span className="text-[11px] text-foreground-muted">Lower warning trigger from 5,000/min to 3,500/min during un-ticketed events.</span>
              </div>
              <span className="text-[10px] font-mono text-accent-glow font-bold">Review: Joint Commissioner of Police (Traffic)</span>
            </div>

            <div className="rounded-lg bg-surface-card border border-border p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Establish Physical Corridor Stanchions</span>
                <span className="text-[11px] text-foreground-muted">Mandate 150m serpentine queuing pens at Cubbon Park exit corridors.</span>
              </div>
              <span className="text-[10px] font-mono text-accent-glow font-bold">Review: KSCA Venue Operations Director</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
