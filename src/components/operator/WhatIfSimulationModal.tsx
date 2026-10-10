"use client";

import { useEffect, useState } from "react";
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
  Check,
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
    description: "Hold arriving crowds at Gate A outer perimeter turnstiles to throttle Central Sector ingress.",
    targetZoneId: "central",
    targetEdgeId: "edge-south-gate-a",
    defaultMagnitude: 30,
  },
  {
    id: "int-divert-east",
    type: "flow_diversion",
    title: "Central → East Bypass Diversion",
    description: "Redirect arrival shuttles & dynamic digital signage from Central to East Ring Approach.",
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
    description: "Deploy temporary guidance stanchions to meter throughput at high-density choke points.",
    targetZoneId: "central",
    targetEdgeId: "edge-central-north",
    defaultMagnitude: 25,
  },
  {
    id: "int-egress-boost",
    type: "egress_increase",
    title: "Central Sector Egress Acceleration",
    description: "Open secondary emergency exit gates and deploy rapid outflow marshals to accelerate clearing.",
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
  const [justApplied, setJustApplied] = useState<boolean>(false);

  const activeScenarioResult = useSimulationStore((state) => state.activeScenarioResult);
  const appliedSimulatedInterventions = useSimulationStore((state) => state.appliedSimulatedInterventions);
  const simulateScenario = useSimulationStore((state) => state.simulateScenario);
  const applySimulatedInterventions = useSimulationStore((state) => state.applySimulatedInterventions);
  const resetSimulatedInterventions = useSimulationStore((state) => state.resetSimulatedInterventions);

  // Reset application feedback when closing or switching presets
  useEffect(() => {
    if (!isOpen) {
      setJustApplied(false);
    }
  }, [isOpen]);

  if (!isOpen || typeof window === "undefined") return null;

  const togglePreset = (id: string) => {
    setJustApplied(false);
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
    setJustApplied(false);
    setMagnitudes((prev) => ({ ...prev, [id]: val }));
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
    setJustApplied(false);
    setTimeout(() => {
      simulateScenario(currentInterventions);
      setIsSimulating(false);
    }, 350);
  };

  const handleApplyToDemo = () => {
    applySimulatedInterventions(currentInterventions);
    setJustApplied(true);
  };

  const handleResetDemo = () => {
    resetSimulatedInterventions();
    setJustApplied(false);
  };

  const activeSnapshot = activeScenarioResult?.horizons[activeHorizon];
  const primaryZone = activeSnapshot?.zones[activeScenarioResult?.primaryZoneImpact.zoneId ?? "central"];
  const secondaryZone = activeSnapshot?.zones["east"];
  const routing = activeScenarioResult?.routingImpact;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatif-title"
    >
      <div className="flex w-full max-w-4xl max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5 sm:px-6 sm:py-4 bg-surface-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/30 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="whatif-title" className="text-base font-bold text-foreground">
                  &ldquo;What-If?&rdquo; Spatial Intervention Engine
                </h2>
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider border border-accent/30">
                  Scenario Simulator
                </span>
                {appliedSimulatedInterventions.length > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                    Simulated Interventions Live
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-foreground-muted">
                Compose up to 3 interventions, model multi-edge flow redistribution, and re-evaluate visitor routing impact.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-5">
          {/* Section 1: Intervention Composition */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                1. Select Interventions (Compose 1 to 3)
              </label>
              <span className="text-[11px] font-mono text-foreground-muted">
                Active: <span className="text-accent font-bold">{selectedPresetIds.length}/3</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESET_INTERVENTIONS.map((preset) => {
                const isSelected = selectedPresetIds.includes(preset.id);
                const currentMag = magnitudes[preset.id] ?? preset.defaultMagnitude;

                return (
                  <div
                    key={preset.id}
                    className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-surface-muted/30 hover:border-border-hover hover:bg-surface-muted/50"
                    }`}
                  >
                    <div>
                      <div
                        className="cursor-pointer flex items-center justify-between gap-2"
                        onClick={() => togglePreset(preset.id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            togglePreset(preset.id);
                          }
                        }}
                      >
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                          <span
                            className={`h-4 w-4 rounded flex items-center justify-center text-[10px] font-bold border transition-colors shrink-0 ${
                              isSelected
                                ? "bg-accent text-accent-foreground border-accent"
                                : "border-foreground-muted/40 text-foreground-muted bg-surface"
                            }`}
                          >
                            {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                          </span>
                          <span>{preset.title}</span>
                        </h4>
                        <span className="text-[10px] font-mono font-semibold text-accent shrink-0">
                          {currentMag}% Magnitude
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center gap-2.5">
                        <Sliders className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                        <input
                          type="range"
                          min="10"
                          max="50"
                          step="5"
                          value={currentMag}
                          onChange={(e) => handleMagnitudeChange(preset.id, parseInt(e.target.value))}
                          className="w-full accent-accent h-1.5 bg-surface-muted rounded-lg cursor-pointer"
                          aria-label={`${preset.title} magnitude percent`}
                        />
                        <span className="text-xs font-mono font-bold text-foreground w-10 text-right shrink-0">
                          {currentMag}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Action Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex-1 min-w-[240px] flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow-md shadow-accent/25 hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Computing Multi-Edge Scenario Flow...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Run What-If Simulation</span>
                </>
              )}
            </button>

            {appliedSimulatedInterventions.length > 0 && (
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Baseline</span>
              </button>
            )}
          </div>

          {/* Section 3: Multi-Horizon Outcome Display */}
          {activeScenarioResult && primaryZone && (
            <div className="space-y-4 rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5 animate-in fade-in duration-300">
              {/* Header & Horizon Selection */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Projected Multi-Edge Scenario Outcome
                    </h3>
                    <p className="text-[11px] text-foreground-muted">
                      {activeScenarioResult.overallOutcomeSummary}
                    </p>
                  </div>
                </div>

                {/* Horizon Switcher */}
                <div className="flex items-center gap-1 rounded-lg bg-surface border border-border p-1 shadow-xs">
                  <Clock className="h-3.5 w-3.5 text-foreground-muted ml-1 shrink-0" />
                  {(["5m", "15m", "30m"] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setActiveHorizon(h)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                        activeHorizon === h
                          ? "bg-accent text-accent-foreground shadow-xs"
                          : "text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      +{h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary & Secondary Zone Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Primary Zone (Relieved) */}
                <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      Primary Target: {primaryZone.zoneName}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      RELIEVED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-surface-muted/50 p-2 flex flex-col justify-between">
                      <span className="text-[10px] font-semibold uppercase text-foreground-muted">Occupancy</span>
                      <div className="mt-1 flex items-baseline gap-1 font-mono">
                        <span className="text-xs text-rose-400 line-through opacity-75">{primaryZone.currentOccupancyPercent}%</span>
                        <ArrowRight className="h-3 w-3 text-foreground-muted shrink-0 self-center" />
                        <span className="text-sm font-bold text-emerald-400">{primaryZone.projectedOccupancyPercent}%</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-surface-muted/50 p-2 flex flex-col justify-between">
                      <span className="text-[10px] font-semibold uppercase text-foreground-muted">Net Flow</span>
                      <div className="mt-1 flex items-baseline gap-1 font-mono">
                        <span className="text-xs text-rose-400 line-through opacity-75">+{primaryZone.currentNetInflow}/m</span>
                        <ArrowRight className="h-3 w-3 text-foreground-muted shrink-0 self-center" />
                        <span className="text-sm font-bold text-emerald-400">+{primaryZone.projectedNetInflow}/m</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-surface-muted/50 p-2 flex flex-col justify-between">
                      <span className="text-[10px] font-semibold uppercase text-foreground-muted">Critical Risk</span>
                      <div className="mt-1 flex items-baseline">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {primaryZone.projectedTimeToCriticalMinutes
                            ? `~${primaryZone.projectedTimeToCriticalMinutes}m`
                            : ">30m Clear"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                    <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                    <span>↓ {Math.abs(primaryZone.occupancyDeltaPercent)} pts reduction (+{activeHorizon})</span>
                  </span>
                </div>

                {/* Secondary Zone (Absorbed Load) */}
                {secondaryZone && (
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        Secondary Impact: {secondaryZone.zoneName}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        ABSORBED LOAD
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-surface-muted/50 p-2 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold uppercase text-foreground-muted">Occupancy</span>
                        <div className="mt-1 flex items-baseline gap-1 font-mono">
                          <span className="text-xs text-foreground-muted">{secondaryZone.currentOccupancyPercent}%</span>
                          <ArrowRight className="h-3 w-3 text-foreground-muted shrink-0 self-center" />
                          <span className="text-sm font-bold text-amber-400">{secondaryZone.projectedOccupancyPercent}%</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-surface-muted/50 p-2 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold uppercase text-foreground-muted">Net Flow</span>
                        <div className="mt-1 flex items-baseline gap-1 font-mono">
                          <span className="text-xs text-foreground-muted">+{secondaryZone.currentNetInflow}/m</span>
                          <ArrowRight className="h-3 w-3 text-foreground-muted shrink-0 self-center" />
                          <span className="text-sm font-bold text-amber-400">+{secondaryZone.projectedNetInflow}/m</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-surface-muted/50 p-2 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold uppercase text-foreground-muted">Capacity</span>
                        <div className="mt-1 flex items-baseline">
                          <span className="text-xs font-bold text-emerald-400 font-mono">Safe (42% spare)</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 pt-0.5">
                      <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                      <span>↑ {secondaryZone.occupancyDeltaPercent} pts absorbed flow (+{activeHorizon})</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Visitor Route Impact Card */}
              {routing && (
                <div className="rounded-xl border border-border bg-surface p-4 space-y-2.5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Compass className="h-4 w-4 text-accent" />
                      Visitor Routing Re-Evaluation Impact
                    </span>
                    <span className="text-[10px] font-mono text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      Bypass Route: {routing.preferredAlternativeCorridor}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                    <div className="rounded-lg bg-surface-muted/50 p-2.5">
                      <span className="text-[10px] font-semibold text-foreground-muted block uppercase">Active Journeys</span>
                      <span className="text-base font-extrabold text-foreground font-mono">{routing.totalActiveJourneys}</span>
                    </div>

                    <div className="rounded-lg bg-surface-muted/50 p-2.5">
                      <span className="text-[10px] font-semibold text-foreground-muted block uppercase">Unchanged</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">{routing.unchangedJourneys}</span>
                    </div>

                    <div className="rounded-lg bg-surface-muted/50 p-2.5">
                      <span className="text-[10px] font-semibold text-foreground-muted block uppercase">Rerouted</span>
                      <span className="text-base font-extrabold text-amber-400 font-mono">{routing.reroutedJourneys}</span>
                    </div>

                    <div className="rounded-lg bg-surface-muted/50 p-2.5">
                      <span className="text-[10px] font-semibold text-foreground-muted block uppercase">Avg Travel Time</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {routing.averageTravelTimeDeltaMinutes < 0 ? `${routing.averageTravelTimeDeltaMinutes} min` : "No Change"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-surface border border-border p-3 text-xs text-foreground-muted flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Applying this plan will dispatch field task orders to sector captains, trigger dynamic visitor app rerouting via transport bridge, and update flow vectors with an active simulated intervention tag.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3.5 sm:px-6 sm:py-4 bg-surface-muted/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            Close Window
          </button>

          {activeScenarioResult && (
            <button
              type="button"
              onClick={handleApplyToDemo}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md ${
                justApplied
                  ? "bg-emerald-500 text-emerald-950 shadow-emerald-500/20"
                  : "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20"
              }`}
            >
              {justApplied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Applied to Live Simulation State</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span>Apply to Live Simulation State</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
