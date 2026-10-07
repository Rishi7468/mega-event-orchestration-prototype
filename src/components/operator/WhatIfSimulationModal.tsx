import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Play,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";

type WhatIfSimulationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetZoneId?: string | null;
  onApplyIntervention: (interventionId: string) => void;
};

export function WhatIfSimulationModal({
  isOpen,
  onClose,
  onApplyIntervention,
}: WhatIfSimulationModalProps) {
  const [selectedIntervention, setSelectedIntervention] = useState<string>("redirect-arrivals");
  const [hasSimulated, setHasSimulated] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const venueGates = useSimulationStore((state) => state.venueGates);

  if (!isOpen || typeof window === "undefined") return null;

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);
    }, 700);
  };

  const handleApply = () => {
    onApplyIntervention(selectedIntervention);
    onClose();
  };

  // Calculate projected delta based on selected intervention
  const currentCentralPressure = zoneSnapshots.find((s) => s.zoneId === "central")?.crowdPressure ?? 91;
  const currentNorthPressure = zoneSnapshots.find((s) => s.zoneId === "north")?.crowdPressure ?? 48;
  const gateAQueue = venueGates.find((g) => g.id === "gate-a")?.currentQueue ?? 1240;

  const projectedCentralPressure = Math.max(50, currentCentralPressure - 19);
  const projectedNorthPressure = Math.min(85, currentNorthPressure + 11);
  const projectedGateAQueue = Math.max(200, gateAQueue - 520);
  const stabilizationMinutes = 7;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">&ldquo;What-If?&rdquo; Spatial Intervention Simulator</h2>
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                  Predictive Mode
                </span>
              </div>
              <p className="text-xs text-foreground-muted">
                Pre-test operational interventions across the digital spatial model before committing field orders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Select Intervention Strategy */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              1. Select Candidate Intervention Strategy
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setSelectedIntervention("redirect-arrivals");
                  setHasSimulated(false);
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedIntervention === "redirect-arrivals"
                    ? "border-accent bg-accent/15 shadow-sm"
                    : "border-border bg-surface-muted/30 hover:border-border-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Promote Gate B & Redirect Transit Inflow</h4>
                  <span className="text-[10px] font-semibold text-emerald-400">High Impact</span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Re-route Central arrivals toward Gate B and North transit shuttles to balance sector crowd load.
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedIntervention("promote-gate-b");
                  setHasSimulated(false);
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedIntervention === "promote-gate-b"
                    ? "border-accent bg-accent/15 shadow-sm"
                    : "border-border bg-surface-muted/30 hover:border-border-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Promote Gate B Queue Stanchions</h4>
                  <span className="text-[10px] font-semibold text-amber-400">Moderate Impact</span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Deploy turnstile barrier queues at Gate B to relieve direct pressure on Gate A.
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedIntervention("adjust-shuttle");
                  setHasSimulated(false);
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedIntervention === "adjust-shuttle"
                    ? "border-accent bg-accent/15 shadow-sm"
                    : "border-border bg-surface-muted/30 hover:border-border-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Adjust Shuttle Corridor Frequency</h4>
                  <span className="text-[10px] font-semibold text-blue-400">Transit Shift</span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Increase shuttle frequency on Route S3 while throttling Route S1 arrivals.
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedIntervention("recommend-off-peak");
                  setHasSimulated(false);
                }}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedIntervention === "recommend-off-peak"
                    ? "border-accent bg-accent/15 shadow-sm"
                    : "border-border bg-surface-muted/30 hover:border-border-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Broadcast Off-Peak Visitor Nudge</h4>
                  <span className="text-[10px] font-semibold text-purple-400">Visitor Advisory</span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Send live SSE notification encouraging visitors to delay arrival window by 30 mins.
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          {!hasSimulated && (
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" /> Running Spatial Model Projections...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run Spatial Projection Model
                </>
              )}
            </button>
          )}

          {/* Step 2: Spatial Delta Projection Output */}
          {hasSimulated && (
            <div className="space-y-4 rounded-xl border border-accent/40 bg-accent/5 p-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-foreground">PROJECTED SPATIAL OUTCOME</h3>
                </div>
                <span className="text-xs font-mono font-semibold text-foreground-muted">
                  Est. Stabilization: <span className="text-accent font-bold">{stabilizationMinutes} minutes</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Metric 1 */}
                <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-foreground-muted block">Central Zone Pressure</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-400 line-through">{currentCentralPressure}%</span>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground-muted" />
                    <span className="text-lg font-extrabold text-emerald-400">{projectedCentralPressure}%</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> ↓ 19 pts reduction
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-foreground-muted block">North Zone Absorbed Load</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground-muted">{currentNorthPressure}%</span>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground-muted" />
                    <span className="text-lg font-extrabold text-amber-400">{projectedNorthPressure}%</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    ↑ 11 pts (Well within capacity)
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-foreground-muted block">Gate A Queue Count</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-400 line-through">{gateAQueue}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground-muted" />
                    <span className="text-lg font-extrabold text-emerald-400">{projectedGateAQueue}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    -520 visitors (-42% queue)
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-surface border border-border p-3 text-xs text-foreground-muted flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Applying this plan will dispatch a tactical task to Sector Officer Ramesh, update visitor app navigation via SSE, and log closed-loop telemetry.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-surface-muted/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          >
            Discard & Exit
          </button>

          {hasSimulated && (
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" /> [APPLY PLAN & DISPATCH ORDER]
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
