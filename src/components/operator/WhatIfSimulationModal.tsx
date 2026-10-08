import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Play,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Sliders,
  Layers,
  MapPin,
  Clock,
  Compass,
  AlertTriangle,
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import type { InterventionItem } from "@/lib/intelligence/scenarioEngine";

type WhatIfSimulationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetZoneId?: string | null;
  onApplyIntervention?: (interventionId: string) => void;
};

const PRESET_INTERVENTIONS: Array<{
  id: string;
  type: InterventionItem["type"];
  title: string;
  description: string;
  targetZoneId: string;
  targetEdgeId?: string;
  secondaryZoneId?: string;
  secondaryEdgeId?: string;
  defaultMagnitude: number;
}> = [
  {
    id: "int-inflow-a",
    type: "inflow_reduction",
    title: "Gate A Inflow Metering",
    description: "Hold arriving crowds at Gate A outer perimeter turnstiles to throttle Central ingress.",
    targetZoneId: "central",
    targetEdgeId: "edge-south-gate-a",
    defaultMagnitude: 30,
  },
  {
    id: "int-divert-east",
    type: "flow_diversion",
    title: "Central → East Bypass Diversion",
    description: "Redirect arrival shuttles & pedestrian signage from Central to East Ring Approach.",
    targetZoneId: "central",
    targetEdgeId: "edge-south-gate-a",
    secondaryZoneId: "east",
    secondaryEdgeId: "edge-east-sangam",
    defaultMagnitude: 30,
  },
  {
    id: "int-restrict-corridor",
    type: "corridor_restriction",
    title: "Main Concourse Corridor Restriction",
    description: "Deploy temporary stanchions to restrict high-density choke points.",
    targetZoneId: "central",
    targetEdgeId: "edge-central-north",
    defaultMagnitude: 25,
  },
  {
    id: "int-egress-boost",
    type: "egress_increase",
    title: "Central Sector Egress Acceleration",
    description: "Open secondary emergency exit gates and add exit shuttles to accelerate outflow.",
    targetZoneId: "central",
    defaultMagnitude: 20,
  },
];

export function WhatIfSimulationModal({
  isOpen,
  onClose,
}: WhatIfSimulationModalProps) {
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>(["int-inflow-a"]);
  const [magnitudes, setMagnitudes] = useState<Record<string, number>>({
    "int-inflow-a": 30,
    "int-divert-east": 30,
    "int-restrict-corridor": 25,
    "int-egress-boost": 20,
  });

  const [activeHorizon, setActiveHorizon] = useState<"5m" | "15m" | "30m">("15m");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const activeScenarioResult = useSimulationStore((state) => state.activeScenarioResult);
  const appliedSimulatedInterventions = useSimulationStore((state) => state.appliedSimulatedInterventions);
  const simulateScenario = useSimulationStore((state) => state.simulateScenario);
  const applySimulatedInterventions = useSimulationStore((state) => state.applySimulatedInterventions);
  const resetSimulatedInterventions = useSimulationStore((state) => state.resetSimulatedInterventions);

  if (!isOpen || typeof window === "undefined") return null;

  const togglePreset = (id: string) => {
    if (selectedPresetIds.includes(id)) {
      if (selectedPresetIds.length > 1) {
        setSelectedPresetIds(selectedPresetIds.filter((pId) => pId !== id));
      }
    } else {
      if (selectedPresetIds.length < 3) {
        setSelectedPresetIds([...selectedPresetIds, id]);
      }
    }
  };

  const handleMagnitudeChange = (id: string, val: number) => {
    setMagnitudes({ ...magnitudes, [id]: val });
  };

  const currentInterventions: InterventionItem[] = selectedPresetIds.map((id) => {
    const preset = PRESET_INTERVENTIONS.find((p) => p.id === id)!;
    return {
      id: preset.id,
      type: preset.type,
      title: preset.title,
      targetZoneId: preset.targetZoneId,
      targetEdgeId: preset.targetEdgeId,
      secondaryZoneId: preset.secondaryZoneId,
      secondaryEdgeId: preset.secondaryEdgeId,
      magnitudePercent: magnitudes[id] ?? preset.defaultMagnitude,
    };
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      simulateScenario(currentInterventions);
      setIsSimulating(false);
    }, 400);
  };

  const handleApplyToDemo = () => {
    applySimulatedInterventions(currentInterventions);
  };

  const handleResetDemo = () => {
    resetSimulatedInterventions();
  };

  const activeSnapshot = activeScenarioResult?.horizons[activeHorizon];
  const primaryZone = activeSnapshot?.zones[activeScenarioResult?.primaryZoneImpact.zoneId ?? "central"];
  const secondaryZone = activeSnapshot?.zones["east"];
  const routing = activeScenarioResult?.routingImpact;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  &ldquo;What-If?&rdquo; Spatial Intervention Engine
                </h2>
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                  Scenario Simulator
                </span>
                {appliedSimulatedInterventions.length > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                    SIMULATED INTERVENTION ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground-muted">
                Compose up to 3 interventions, model multi-edge flow redistribution, and re-evaluate visitor routing impact.
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
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Step 1: Select & Compose Interventions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                1. Select Interventions (Compose up to 3)
              </label>
              <span className="text-[11px] font-mono text-foreground-muted">
                Selected: <span className="text-accent font-bold">{selectedPresetIds.length}/3</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESET_INTERVENTIONS.map((preset) => {
                const isSelected = selectedPresetIds.includes(preset.id);
                const currentMag = magnitudes[preset.id] ?? preset.defaultMagnitude;

                return (
                  <div
                    key={preset.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-surface-muted/30 hover:border-border-hover"
                    }`}
                  >
                    <div
                      className="cursor-pointer flex items-center justify-between"
                      onClick={() => togglePreset(preset.id)}
                    >
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span
                          className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isSelected
                              ? "bg-accent text-accent-foreground border-accent"
                              : "border-foreground-muted/40 text-foreground-muted"
                          }`}
                        >
                          {isSelected ? "✓" : "+"}
                        </span>
                        {preset.title}
                      </h4>
                      <span className="text-[10px] font-mono font-semibold text-accent">
                        {currentMag}% Magnitude
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-foreground-muted">{preset.description}</p>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
                        <Sliders className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                        <input
                          type="range"
                          min="10"
                          max="50"
                          step="5"
                          value={currentMag}
                          onChange={(e) => handleMagnitudeChange(preset.id, parseInt(e.target.value))}
                          className="w-full accent-accent h-1.5 bg-surface-muted rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-foreground w-9 text-right">
                          {currentMag}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" /> Computing Multi-Edge Scenario Flow...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> [ SIMULATE SCENARIO PROJECTION ]
                </>
              )}
            </button>

            {appliedSimulatedInterventions.length > 0 && (
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
              >
                <RotateCcw className="h-4 w-4" /> Reset Demo to Live CV Baseline
              </button>
            )}
          </div>

          {/* Step 2: Multi-Horizon Spatial & Route Impact Display */}
          {activeScenarioResult && primaryZone && (
            <div className="space-y-4 rounded-xl border border-accent/40 bg-accent/5 p-5 animate-in fade-in duration-300">
              {/* Header & Horizon Tabs */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      PROJECTED MULTI-EDGE SCENARIO OUTCOME
                    </h3>
                    <p className="text-[11px] text-foreground-muted">{activeScenarioResult.overallOutcomeSummary}</p>
                  </div>
                </div>

                {/* Horizon Tabs */}
                <div className="flex items-center gap-1 rounded-lg bg-surface border border-border p-1">
                  <Clock className="h-3.5 w-3.5 text-foreground-muted ml-1.5" />
                  {(["5m", "15m", "30m"] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setActiveHorizon(h)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                        activeHorizon === h
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      +{h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary & Secondary Multi-Zone Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Zone (Reduced) */}
                <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      Primary Target: {primaryZone.zoneName}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      RELIEVED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <span className="text-[10px] text-foreground-muted block">Occupancy</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-400 line-through">{primaryZone.currentOccupancyPercent}%</span>
                        <ArrowRight className="h-3 w-3 text-foreground-muted" />
                        <span className="text-sm font-extrabold text-emerald-400">{primaryZone.projectedOccupancyPercent}%</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-foreground-muted block">Net Flow</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-400 line-through">+{primaryZone.currentNetInflow}/m</span>
                        <ArrowRight className="h-3 w-3 text-foreground-muted" />
                        <span className="text-sm font-bold text-emerald-400">+{primaryZone.projectedNetInflow}/m</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-foreground-muted block">Critical Risk</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {primaryZone.projectedTimeToCriticalMinutes
                          ? `~${primaryZone.projectedTimeToCriticalMinutes}m`
                          : ">30m Clear"}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <TrendingDown className="h-3 w-3" /> ↓ {Math.abs(primaryZone.occupancyDeltaPercent)} pts reduction (+{activeHorizon})
                  </span>
                </div>

                {/* Secondary Zone (Propagated Load) */}
                {secondaryZone && (
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        Secondary Impact: {secondaryZone.zoneName}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        ABSORBED LOAD
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                      <div>
                        <span className="text-[10px] text-foreground-muted block">Occupancy</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-foreground-muted">{secondaryZone.currentOccupancyPercent}%</span>
                          <ArrowRight className="h-3 w-3 text-foreground-muted" />
                          <span className="text-sm font-extrabold text-amber-400">{secondaryZone.projectedOccupancyPercent}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-foreground-muted block">Net Flow</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-foreground-muted">+{secondaryZone.currentNetInflow}/m</span>
                          <ArrowRight className="h-3 w-3 text-foreground-muted" />
                          <span className="text-sm font-bold text-amber-400">+{secondaryZone.projectedNetInflow}/m</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-foreground-muted block">Capacity Buffer</span>
                        <span className="text-xs font-bold text-emerald-400">Safe (42% spare)</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 pt-1">
                      <TrendingUp className="h-3 w-3" /> ↑ {secondaryZone.occupancyDeltaPercent} pts absorbed flow (+{activeHorizon})
                    </span>
                  </div>
                )}
              </div>

              {/* Visitor Route Impact Card */}
              {routing && (
                <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Compass className="h-4 w-4 text-accent" />
                      Visitor Routing Re-Evaluation Impact
                    </span>
                    <span className="text-[10px] font-mono text-accent font-semibold">
                      Preferred Path: {routing.preferredAlternativeCorridor}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50 text-center">
                    <div className="rounded-lg bg-surface-muted/40 p-2">
                      <span className="text-[10px] text-foreground-muted block">Active Journeys</span>
                      <span className="text-sm font-extrabold text-foreground">{routing.totalActiveJourneys}</span>
                    </div>

                    <div className="rounded-lg bg-surface-muted/40 p-2">
                      <span className="text-[10px] text-foreground-muted block">Unchanged</span>
                      <span className="text-sm font-extrabold text-emerald-400">{routing.unchangedJourneys}</span>
                    </div>

                    <div className="rounded-lg bg-surface-muted/40 p-2">
                      <span className="text-[10px] text-foreground-muted block">Rerouted</span>
                      <span className="text-sm font-extrabold text-amber-400">{routing.reroutedJourneys}</span>
                    </div>

                    <div className="rounded-lg bg-surface-muted/40 p-2">
                      <span className="text-[10px] text-foreground-muted block">Avg Travel Time</span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {routing.averageTravelTimeDeltaMinutes < 0 ? `${routing.averageTravelTimeDeltaMinutes} min` : "No Change"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-surface border border-border p-3 text-xs text-foreground-muted flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Applying this plan will dispatch field task orders to sector captains, trigger dynamic visitor app rerouting via SSE, and update map flow vectors cleanly marked as <strong className="text-amber-400">SIMULATED INTERVENTION</strong>.
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
            Close Window
          </button>

          {activeScenarioResult && (
            <button
              type="button"
              onClick={handleApplyToDemo}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all"
            >
              <AlertTriangle className="h-4 w-4" /> [ APPLY TO DEMO / SIMULATION STATE ]
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
