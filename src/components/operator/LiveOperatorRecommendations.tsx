"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  FlaskConical,
  Radio,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
} from "lucide-react";
import { useSimulationStore } from "@/store/simulationStore";
import {
  evaluateOperatorRecommendations,
  type OperatorRecommendation,
  type OperatorRecommendationSeverity,
} from "@/lib/intelligence/operatorDecisionEngine";

type LiveOperatorRecommendationsProps = {
  onRunWhatIf?: (zoneId: string) => void;
};

const SEVERITY_STYLES: Record<
  OperatorRecommendationSeverity,
  { badgeBg: string; badgeBorder: string; badgeText: string; cardBorder: string; iconColor: string }
> = {
  CRITICAL: {
    badgeBg: "bg-rose-500/15",
    badgeBorder: "border-rose-500/40",
    badgeText: "text-rose-400",
    cardBorder: "border-rose-500/40 bg-rose-950/10",
    iconColor: "text-rose-400",
  },
  HIGH: {
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/40",
    badgeText: "text-amber-400",
    cardBorder: "border-amber-500/40 bg-amber-950/10",
    iconColor: "text-amber-400",
  },
  MEDIUM: {
    badgeBg: "bg-blue-500/15",
    badgeBorder: "border-blue-500/40",
    badgeText: "text-blue-400",
    cardBorder: "border-blue-500/30 bg-blue-950/10",
    iconColor: "text-blue-400",
  },
  LOW: {
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/40",
    badgeText: "text-emerald-400",
    cardBorder: "border-emerald-500/30 bg-emerald-950/10",
    iconColor: "text-emerald-400",
  },
};

export function LiveOperatorRecommendations({ onRunWhatIf }: LiveOperatorRecommendationsProps) {
  const liveCrowdStates = useSimulationStore((state) => state.liveCrowdStates);
  const edgeCrowdStates = useSimulationStore((state) => state.edgeCrowdStates);
  const predictions = useSimulationStore((state) => state.predictions);
  const flowGraph = useSimulationStore((state) => state.flowGraph);
  const incidents = useSimulationStore((state) => state.incidents);
  const acknowledgedIds = useSimulationStore((state) => state.acknowledgedRecommendationIds);
  const acknowledgeRecommendation = useSimulationStore((state) => state.acknowledgeRecommendation);
  const activeHighlight = useSimulationStore((state) => state.activeRecommendationHighlight);
  const setRecommendationHighlight = useSimulationStore((state) => state.setRecommendationHighlight);

  // Compute prioritized recommendations dynamically from live telemetry & prediction engine
  const recommendations = useMemo(() => {
    return evaluateOperatorRecommendations(
      liveCrowdStates,
      edgeCrowdStates,
      predictions,
      flowGraph,
      incidents,
      acknowledgedIds
    );
  }, [liveCrowdStates, edgeCrowdStates, predictions, flowGraph, incidents, acknowledgedIds]);

  const activeRecommendations = recommendations.filter((r) => !r.acknowledged);

  if (activeRecommendations.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Optimal Crowd Stability</h3>
            <p className="text-xs text-foreground-muted">
              All zones and pedestrian corridors operating within safe capacity limits. No operational interventions required.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
          STABLE
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/20 text-accent border border-accent/40">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Live Operational Recommendations ({activeRecommendations.length})
          </h2>
        </div>
        <span className="text-[10px] font-mono text-foreground-muted">
          Prioritized by Risk & Urgency
        </span>
      </div>

      <div className="space-y-3">
        {activeRecommendations.map((rec) => {
          const style = SEVERITY_STYLES[rec.severity];
          const isHighlighted =
            activeHighlight?.affectedZoneId === rec.affectedZoneId ||
            activeHighlight?.affectedEdgeId === rec.affectedEdgeId;

          return (
            <div
              key={rec.id}
              className={`rounded-2xl border p-4 shadow-sm transition-all ${style.cardBorder} ${
                isHighlighted ? "ring-2 ring-accent" : ""
              }`}
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${style.badgeBg} ${style.badgeBorder} ${style.badgeText}`}
                  >
                    {rec.severity === "CRITICAL"
                      ? "🔴 CRITICAL INTERVENTION"
                      : rec.severity === "HIGH"
                      ? "🟠 HIGH ATTENTION"
                      : "🔵 ADVISORY"}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold border ${
                      rec.source === "REAL_VIDEO"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-surface-muted text-foreground-muted border-border"
                    }`}
                  >
                    SOURCE: {rec.source === "REAL_VIDEO" ? "REAL_VIDEO / CV" : "SIMULATED"}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-foreground-muted">
                  Updated {rec.timestamp} (Confidence: {rec.confidencePercent}%)
                </span>
              </div>

              {/* Recommendation Title */}
              <div className="mt-3">
                <h3 className="text-base font-extrabold text-foreground">{rec.title}</h3>
                <p className="mt-0.5 text-xs text-rose-400 font-semibold">{rec.trigger}</p>
              </div>

              {/* Core 3-Column Decision Grid */}
              <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* 1. WHY (Evidence) */}
                <div className="rounded-xl border border-border/60 bg-surface/80 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                    1. Why (Evidence)
                  </span>
                  <div className="mt-1.5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Occupancy:</span>
                      <span className="font-bold text-foreground">
                        {rec.evidence.occupancyPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">15m Projected:</span>
                      <span className="font-bold text-amber-400">
                        {rec.evidence.predictedOccupancyPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Net Inflow:</span>
                      <span className="font-bold text-rose-400 font-mono">
                        +{rec.evidence.netInflowPerMin}/min
                      </span>
                    </div>
                    {rec.evidence.timeToCriticalMinutes !== null && (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">Time to Critical:</span>
                        <span className="font-bold text-rose-300 font-mono">
                          ~{rec.evidence.timeToCriticalMinutes}m
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-foreground-muted leading-snug">
                    {rec.whyExplanation}
                  </p>
                </div>

                {/* 2. RECOMMENDED ACTION */}
                <div className="rounded-xl border border-border/60 bg-surface/80 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                      2. Recommended Action
                    </span>
                    <p className="mt-2 text-xs font-semibold text-foreground leading-relaxed">
                      {rec.recommendedAction}
                    </p>
                  </div>
                  {rec.evidence.alternativeEdgeName && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] font-medium text-emerald-300">
                      <Layers className="h-3.5 w-3.5 shrink-0" />
                      <span>Route via: <strong>{rec.evidence.alternativeEdgeName}</strong></span>
                    </div>
                  )}
                </div>

                {/* 3. EXPECTED IMPACT (What-If Simulation) */}
                <div className="rounded-xl border border-border/60 bg-surface/80 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> 3. Expected Impact
                  </span>

                  <div className="mt-2 rounded-lg bg-surface-muted/60 p-2 text-center">
                    <span className="text-[10px] text-foreground-muted uppercase font-mono">15m Projected Occupancy</span>
                    <div className="mt-0.5 flex items-center justify-center gap-2">
                      <span className="text-xs line-through text-rose-400 font-mono">
                        {rec.expectedImpact.currentProjectedOccupancy}%
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {rec.expectedImpact.mitigatedProjectedOccupancy}%
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-emerald-300/90 leading-snug">
                    {rec.expectedImpact.summary}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRecommendationHighlight(
                        isHighlighted
                          ? null
                          : {
                              affectedZoneId: rec.affectedZoneId,
                              affectedEdgeId: rec.affectedEdgeId,
                              alternativeEdgeId: rec.recommendedAlternativeEdgeId,
                            }
                      )
                    }
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                      isHighlighted
                        ? "border-accent bg-accent text-accent-foreground shadow-sm"
                        : "border-border bg-surface-muted/60 text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    <Compass className="h-3.5 w-3.5" />
                    {isHighlighted ? "Highlighted on Map" : "View on Map"}
                  </button>

                  {onRunWhatIf && rec.affectedZoneId && (
                    <button
                      type="button"
                      onClick={() => onRunWhatIf(rec.affectedZoneId!)}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      Run What-If Scenario
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    acknowledgeRecommendation(rec.id);
                    setRecommendationHighlight(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Acknowledge & Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
