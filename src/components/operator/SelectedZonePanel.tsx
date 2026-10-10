import { useState } from "react";
import { X, Video, UserCheck, Stethoscope, AlertCircle, Play, TrendingUp, TrendingDown, Minus, ShieldCheck, Activity, Eye, Zap, Clock, SlidersHorizontal } from "lucide-react";
import type { OperationalZoneDefinition } from "@/store/eventAuthoringStore";
import type { ZoneSnapshot, VenueGate } from "@/types";
import { useSimulationStore } from "@/store/simulationStore";

type SelectedZonePanelProps = {
  zone: OperationalZoneDefinition;
  snapshot?: ZoneSnapshot;
  gates: VenueGate[];
  onClose: () => void;
  onRunWhatIf: (zoneId: string) => void;
  onApproveIntervention: (actionLabel: string) => void;
};

export function SelectedZonePanel({
  zone,
  snapshot,
  gates,
  onClose,
  onRunWhatIf,
  onApproveIntervention,
}: SelectedZonePanelProps) {
  const liveCrowdStates = useSimulationStore((state) => state.liveCrowdStates);
  const liveState = liveCrowdStates[zone.id];

  const peopleCount = liveState?.peopleCount ?? zone.currentPopulation;
  const currentPressure = liveState?.occupancyPercent ?? snapshot?.crowdPressure ?? Math.round((zone.currentPopulation / zone.capacity) * 100);
  const crowdLevel = liveState?.crowdLevel ?? (currentPressure >= 85 ? "CRITICAL" : currentPressure >= 70 ? "HIGH" : currentPressure >= 45 ? "MODERATE" : "LOW");
  const trend = liveState?.trend ?? "STABLE";
  const confidencePercent = liveState?.confidencePercent ?? 92;
  const lastUpdated = liveState?.lastUpdated ?? "Just now";
  const trackIds = liveState?.anonymousTrackIds ?? [];

  // Configured Operational Ingress Capacity Threshold (KSDMA Standard)
  const OPERATIONAL_THRESHOLD = 4200; // people/min
  const [simulatedIngressInput, setSimulatedIngressInput] = useState<number>(
    zone.id === "central" ? 5200 : zone.ingressRatePerMin
  );
  const isThresholdBreached = simulatedIngressInput >= OPERATIONAL_THRESHOLD;

  const handleIngressChange = (newVal: number) => {
    setSimulatedIngressInput(newVal);
    if (newVal >= OPERATIONAL_THRESHOLD) {
      useSimulationStore.setState((state) => ({
        zoneSnapshots: state.zoneSnapshots.map((s) =>
          s.zoneId === zone.id ? { ...s, crowdPressure: 91 } : s
        ),
      }));
    } else {
      useSimulationStore.setState((state) => ({
        zoneSnapshots: state.zoneSnapshots.map((s) =>
          s.zoneId === zone.id ? { ...s, crowdPressure: Math.max(35, Math.round((newVal / OPERATIONAL_THRESHOLD) * 55)) } : s
        ),
      }));
    }
  };

  const isElevated = crowdLevel === "HIGH" || currentPressure > 70;
  const isCritical = crowdLevel === "CRITICAL" || currentPressure > 85 || isThresholdBreached;

  // Determine explanation reasons based on state
  const getElevationReasons = () => {
    const reasons: string[] = [];
    if (zone.ingressRatePerMin > zone.egressRatePerMin * 1.5) {
      reasons.push(`Accelerating Inflow: Ingress (${zone.ingressRatePerMin}/min) exceeds Egress (${zone.egressRatePerMin}/min)`);
    }
    if (currentPressure > 80 || crowdLevel === "HIGH" || crowdLevel === "CRITICAL") {
      reasons.push(`Capacity Limit Reached: Operating at ${currentPressure}% density (${peopleCount.toLocaleString()} visitors)`);
    }
    const gateA = gates.find((g) => g.id === "gate-a");
    if (gateA && gateA.estimatedWaitMinutes > 8) {
      reasons.push(`Primary Gate Bottleneck: Gate A queue wait time elevated to ${gateA.estimatedWaitMinutes} minutes`);
    }
    if (zone.emergencyAccess === "constrained") {
      reasons.push("Emergency Corridor Constrained: Sector egress bottleneck restricting rapid response access");
    }
    if (reasons.length === 0) {
      reasons.push("Normal operational flow within safe sector thresholds");
    }
    return reasons;
  };

  const reasons = getElevationReasons();

  const getCrowdLevelBadgeColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "MODERATE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  const renderTrendIcon = () => {
    if (trend === "INCREASING") return <TrendingUp className="h-3.5 w-3.5 text-red-400 animate-pulse" />;
    if (trend === "DECREASING") return <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />;
    return <Minus className="h-3.5 w-3.5 text-blue-400" />;
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-muted/40">
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-accent/20 px-2.5 py-1 text-xs font-mono font-bold text-accent border border-accent/30">
            {zone.code}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{zone.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${getCrowdLevelBadgeColor(crowdLevel)}`}>
                {crowdLevel}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted capitalize">{zone.type} Sector Command</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
        {/* LIVE CROWD INTELLIGENCE BANNER */}
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                Sector Crowd State
              </span>
            </div>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-bold border font-mono bg-blue-500/20 text-blue-300 border-blue-500/40">
              [SIMULATED REPLAY MODEL]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-foreground-muted">Model Confidence:</span>
              <span className="font-bold text-foreground">{confidencePercent}%</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              {renderTrendIcon()}
              <span className="text-foreground-muted">Trend:</span>
              <span className="font-bold text-foreground capitalize">{trend.toLowerCase()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-foreground-muted border-t border-accent/20 pt-2">
            <span>State Refresh: <span className="font-mono text-foreground">{lastUpdated}</span></span>
            <span className="text-[9px] text-amber-400 font-mono font-semibold">
              [LIVE SENSORS NOT CONNECTED]
            </span>
          </div>

          {trackIds.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-purple-300 font-mono">
              <Eye className="h-3 w-3 shrink-0" />
              <span className="truncate">Active Tracks ({trackIds.length}): {trackIds.slice(0, 3).join(", ")}{trackIds.length > 3 ? "..." : ""}</span>
            </div>
          )}
        </div>

        {/* Pressure & Population KPI Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-muted/30 p-3.5">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
              Crowd Pressure
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${
                isCritical ? "text-red-400" : isElevated ? "text-amber-400" : "text-emerald-400"
              }`}>
                {currentPressure}%
              </span>
              <span className="text-[10px] font-medium text-foreground-muted">of capacity</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isCritical ? "bg-red-500" : isElevated ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, currentPressure)}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/30 p-3.5">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
              Current Headcount
            </span>
            <div className="text-2xl font-extrabold text-foreground">
              {peopleCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-foreground-muted block mt-1">
              Max: {zone.capacity.toLocaleString()}
            </span>
          </div>
        </div>

        {/* PHASE 2 — CROWD FLOW MATRIX CARD */}
        {(() => {
          const flowGraph = useSimulationStore.getState().flowGraph;
          const zoneFlow = flowGraph?.zoneFlows[zone.id];
          const incoming = zoneFlow?.incomingFlowPerMin ?? zone.ingressRatePerMin;
          const outgoing = zoneFlow?.outgoingFlowPerMin ?? zone.egressRatePerMin;
          const net = zoneFlow?.netAccumulationPerMin ?? (incoming - outgoing);
          const dominantDir = zoneFlow?.dominantDirection ?? "EAST";
          const topIn = zoneFlow?.topIncoming ?? [];
          const topOut = zoneFlow?.topOutgoing ?? [];

          return (
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                    Zone Crowd Flow Dynamics
                  </span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">[REALTIME FLOW]</span>
              </div>

              {/* Incoming, Outgoing, Net Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-surface/60 border border-border p-2">
                  <span className="text-[10px] text-foreground-muted block uppercase">Incoming</span>
                  <span className="text-sm font-extrabold text-emerald-400 tabular-nums">{incoming}/min</span>
                </div>
                <div className="rounded-lg bg-surface/60 border border-border p-2">
                  <span className="text-[10px] text-foreground-muted block uppercase">Outgoing</span>
                  <span className="text-sm font-extrabold text-amber-400 tabular-nums">{outgoing}/min</span>
                </div>
                <div className="rounded-lg bg-surface/60 border border-border p-2">
                  <span className="text-[10px] text-foreground-muted block uppercase">Net Flow</span>
                  <span className={`text-sm font-extrabold tabular-nums ${net > 0 ? "text-red-400" : net < 0 ? "text-emerald-400" : "text-foreground"}`}>
                    {net >= 0 ? `+${net}` : net}/min
                  </span>
                </div>
              </div>

              {/* Dominant Direction & Top Origins / Destinations */}
              <div className="space-y-2 pt-1 border-t border-blue-500/20 text-xs">
                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Dominant Vector:</span>
                  <span className="font-bold text-blue-300 flex items-center gap-1 font-mono">
                    → {dominantDir}
                  </span>
                </div>

                {topIn.length > 0 && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground-muted">Top Incoming Origin:</span>
                    <span className="font-semibold text-emerald-400">
                      {topIn[0].sourceZoneId.toUpperCase()} Zone — {topIn[0].flowPerMin}/min
                    </span>
                  </div>
                )}

                {topOut.length > 0 && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground-muted">Top Outgoing Destination:</span>
                    <span className="font-semibold text-amber-400">
                      {topOut[0].targetZoneId.toUpperCase()} Zone — {topOut[0].flowPerMin}/min
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* PHASE 4 — PREDICTIVE CROWD INTELLIGENCE & FORECAST CARD */}
        {(() => {
          const prediction = useSimulationStore.getState().predictions[zone.id];
          const recalculatePredictions = useSimulationStore.getState().recalculatePredictions;

          if (!prediction) return null;

          const {
            predictedCrowdLevel,
            predictedOccupancyPercent,
            timeToHighMinutes,
            timeToCriticalMinutes,
            predictionConfidence,
            recommendation,
            whatIfIntervention,
          } = prediction;

          const currentLevelBadge = (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
              crowdLevel === "CRITICAL"
                ? "bg-red-500/20 text-red-400 border-red-500/40"
                : crowdLevel === "HIGH"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : crowdLevel === "MODERATE"
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            }`}>
              {crowdLevel}
            </span>
          );

          const predictedLevelBadge = (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
              predictedCrowdLevel === "CRITICAL"
                ? "bg-red-500/30 text-red-400 border-red-500/50 animate-pulse"
                : predictedCrowdLevel === "HIGH"
                ? "bg-amber-500/30 text-amber-400 border-amber-500/50"
                : predictedCrowdLevel === "MODERATE"
                ? "bg-yellow-500/30 text-yellow-400 border-yellow-500/50"
                : "bg-emerald-500/30 text-emerald-400 border-emerald-500/50"
            }`}>
              {predictedCrowdLevel} ({predictedOccupancyPercent}%)
            </span>
          );

          return (
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Predictive Intelligence & Forecast
                  </span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" /> +15m Forecast
                </span>
              </div>

              {/* Current vs Predicted State */}
              <div className="flex items-center justify-between rounded-lg bg-surface/70 border border-purple-500/20 p-2.5">
                <div className="space-y-1">
                  <span className="text-[10px] text-foreground-muted uppercase block">Current State</span>
                  {currentLevelBadge}
                </div>
                <span className="text-purple-400 font-mono font-bold text-xs">→</span>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-foreground-muted uppercase block">Predicted (+15m)</span>
                  {predictedLevelBadge}
                </div>
              </div>

              {/* Time to Threshold Meters */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-surface/60 border border-border p-2">
                  <span className="text-[10px] text-foreground-muted block uppercase">Time to HIGH (75%)</span>
                  <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                    {timeToHighMinutes === null ? "Not predicted" : timeToHighMinutes === 0 ? "Already High" : `~${timeToHighMinutes} min`}
                  </span>
                </div>
                <div className="rounded-lg bg-surface/60 border border-border p-2">
                  <span className="text-[10px] text-foreground-muted block uppercase">Time to CRITICAL (88%)</span>
                  <span className="text-sm font-extrabold text-red-400 tabular-nums">
                    {timeToCriticalMinutes === null ? "Not predicted" : timeToCriticalMinutes === 0 ? "Already Critical" : `~${timeToCriticalMinutes} min`}
                  </span>
                </div>
              </div>

              {/* Prediction Confidence Score & Flow Trend */}
              <div className="flex items-center justify-between text-[11px] text-foreground-muted border-t border-purple-500/20 pt-2">
                <span>Forecast Confidence: <strong className="text-purple-300 font-mono">{predictionConfidence}%</strong></span>
                <span>Flow Trend: <strong className="text-foreground font-mono">{prediction.flowTrend}</strong></span>
              </div>

              {/* Explainable Operator Recommendation */}
              <div className={`rounded-lg p-3 border text-xs space-y-1 ${
                recommendation.urgency === "CRITICAL"
                  ? "bg-red-950/40 border-red-500/40 text-red-200"
                  : recommendation.urgency === "HIGH"
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                  : "bg-surface/60 border-border text-foreground-muted"
              }`}>
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wide text-purple-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Operator Recommendation
                </div>
                <p className="font-semibold text-foreground text-xs leading-snug">{recommendation.text}</p>
                <p className="text-[10px] opacity-80 pt-0.5 leading-normal">{recommendation.explainability}</p>
              </div>

              {/* Interactive What-If Scenario Simulator */}
              {whatIfIntervention && (
                <div className="rounded-lg border border-purple-500/30 bg-purple-950/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-200 flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5 text-purple-400" />
                      What-If Influx Reduction Scenario
                    </span>
                    <button
                      onClick={() => recalculatePredictions(30)}
                      className="px-2.5 py-1 rounded text-[10px] font-bold bg-purple-600 text-white shadow-md shadow-purple-900/50 hover:bg-purple-500 transition-all"
                    >
                      Test -30% Inflow
                    </button>
                  </div>

                  <p className="text-[10px] text-purple-300/80 leading-snug">
                    {whatIfIntervention.explanation}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center text-[11px] pt-1">
                    <div className="rounded bg-surface/70 p-1.5 border border-border">
                      <span className="text-[9px] text-foreground-muted block uppercase">Without Intervention</span>
                      <span className="font-bold text-red-400">
                        Critical in ~{timeToCriticalMinutes ?? "N/A"}m
                      </span>
                    </div>
                    <div className="rounded bg-surface/70 p-1.5 border border-purple-500/30">
                      <span className="text-[9px] text-purple-300 block uppercase">With -30% Influx</span>
                      <span className="font-bold text-emerald-400">
                        Critical in ~{whatIfIntervention.mitigatedTimeToCriticalMinutes ?? "30+"}m
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* INTERACTIVE OPERATIONAL THRESHOLD & EARLY WARNING ENGINE */}
        <div className={`rounded-xl border p-4 space-y-3.5 transition-all ${
          isThresholdBreached
            ? "border-rose-500/50 bg-rose-950/25 shadow-lg shadow-rose-950/30"
            : "border-emerald-500/50 bg-emerald-950/20"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className={`h-4 w-4 ${isThresholdBreached ? "text-rose-400" : "text-emerald-400"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Operational Threshold & Early Warning Engine
              </span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-background/80 border border-border text-foreground font-bold">
              [DETERMINISTIC RULE — NOT PREDICTIVE AI]
            </span>
          </div>

          {/* Configured Threshold & Description */}
          <div className="flex items-center justify-between text-xs rounded-lg bg-surface/60 border border-border/60 p-2.5">
            <div>
              <span className="text-[10px] uppercase font-semibold text-foreground-muted block">
                Configured Operational Ingress Threshold:
              </span>
              <span className="text-sm font-extrabold text-foreground font-mono">
                {OPERATIONAL_THRESHOLD.toLocaleString()} people/min
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-foreground-muted block">Regulatory Standard:</span>
              <span className="text-[11px] font-bold text-accent-glow font-mono">KSDMA Mass Gathering Standard</span>
            </div>
          </div>

          {/* Ingress Input Selector: Buttons & Range Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                Simulated Ingress Input:
                <strong className={`font-mono text-sm ${isThresholdBreached ? "text-rose-400" : "text-emerald-400"}`}>
                  {simulatedIngressInput.toLocaleString()}/min
                </strong>
              </span>
              <span className="text-[9px] font-mono text-amber-400 font-bold">
                [REPLAY SIMULATED INPUT]
              </span>
            </div>

            {/* Quick Test Preset Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleIngressChange(1200)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  simulatedIngressInput === 1200
                    ? "bg-emerald-500/30 text-emerald-300 border-emerald-400 shadow-sm"
                    : "bg-surface-card text-foreground-muted hover:text-foreground border-border"
                }`}
              >
                1,200/min [BELOW]
              </button>
              <button
                type="button"
                onClick={() => handleIngressChange(3100)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  simulatedIngressInput === 3100
                    ? "bg-amber-500/30 text-amber-300 border-amber-400 shadow-sm"
                    : "bg-surface-card text-foreground-muted hover:text-foreground border-border"
                }`}
              >
                3,100/min [NEAR]
              </button>
              <button
                type="button"
                onClick={() => handleIngressChange(5200)}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  simulatedIngressInput === 5200
                    ? "bg-rose-500/30 text-rose-300 border-rose-400 shadow-sm"
                    : "bg-surface-card text-foreground-muted hover:text-foreground border-border"
                }`}
              >
                5,200/min [ABOVE]
              </button>
            </div>

            {/* Slider */}
            <div className="pt-1">
              <input
                type="range"
                min="800"
                max="6000"
                step="100"
                value={simulatedIngressInput}
                onChange={(e) => handleIngressChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-accent-glow"
              />
              <div className="flex justify-between text-[9px] text-foreground-muted font-mono pt-1">
                <span>800/min (Low)</span>
                <span className="text-amber-400 font-bold">▲ 4,200/min Threshold</span>
                <span>6,000/min (Extreme)</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC RULE EVALUATION RESULT BOX */}
          <div className={`rounded-xl border p-3.5 space-y-2 text-xs transition-all ${
            isThresholdBreached
              ? "border-rose-500/60 bg-rose-950/40 text-rose-200"
              : "border-emerald-500/60 bg-emerald-950/40 text-emerald-200"
          }`}>
            <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                <AlertCircle className={`h-4 w-4 shrink-0 ${isThresholdBreached ? "text-rose-400" : "text-emerald-400"}`} />
                <span>
                  {isThresholdBreached ? "CRITICAL THRESHOLD BREACH DETECTED" : "RULE STATUS: SAFE (WITHIN CAPACITY)"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isThresholdBreached ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {isThresholdBreached ? "SEVERITY: CRITICAL" : "SEVERITY: NORMAL"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
              <div>
                <span className="text-foreground-muted block text-[10px]">Affected Zone:</span>
                <strong className="text-foreground font-mono">{zone.name} ({zone.code})</strong>
              </div>
              <div>
                <span className="text-foreground-muted block text-[10px]">Evaluation Condition:</span>
                <strong className="font-mono text-foreground">
                  {simulatedIngressInput} {isThresholdBreached ? ">=" : "<"} {OPERATIONAL_THRESHOLD}/min
                </strong>
              </div>
            </div>

            <div className="pt-1 text-[11px] space-y-1">
              <div>
                <span className="font-semibold text-foreground">Trigger Reason: </span>
                <span className="text-foreground-muted">
                  {isThresholdBreached
                    ? `Net arrival rate (${simulatedIngressInput.toLocaleString()}/min) exceeds physical turnstile capacity (4,200/min) by +${(simulatedIngressInput - OPERATIONAL_THRESHOLD).toLocaleString()}/min. Arrival accumulation risks queuing crush within ~15 minutes.`
                    : `Inflow (${simulatedIngressInput.toLocaleString()}/min) is below the 4,200/min turnstile threshold. Inflow clears normally through active turnstiles.`}
                </span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Recommended Action: </span>
                <span className={isThresholdBreached ? "text-amber-300 font-medium" : "text-emerald-300"}>
                  {isThresholdBreached
                    ? "Activate Gate 3 Bypass & Reroute Ingress to Alternate Gates"
                    : "Maintain standard gate entry monitoring; no diversion required."}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Metrics Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-border/30">
            <div className="rounded-lg border border-border bg-surface p-2">
              <span className="text-[10px] text-foreground-muted block">Ingress Input</span>
              <span className={`font-bold font-mono ${isThresholdBreached ? "text-rose-400" : "text-emerald-400"}`}>
                {simulatedIngressInput}/m ↑
              </span>
            </div>
            <div className="rounded-lg border border-border bg-surface p-2">
              <span className="text-[10px] text-foreground-muted block">Egress</span>
              <span className="font-bold text-foreground font-mono">{zone.egressRatePerMin}/m ↓</span>
            </div>
            <div className="rounded-lg border border-border bg-surface p-2">
              <span className="text-[10px] text-foreground-muted block">Field Units</span>
              <span className="font-bold text-emerald-400">{zone.fieldTeamCount} Teams</span>
            </div>
          </div>
        </div>

        {/* WHY IS THIS ZONE ELEVATED? Section */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>WHY IS THIS ZONE ELEVATED?</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-200/90 pl-1">
            {reasons.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Resource Allocation Summary */}
        <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
            Sector Resource Infrastructure
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <Video className="h-3.5 w-3.5 text-blue-400" />
              <span>{zone.cctvCount} CCTV Feeds</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{zone.fieldTeamCount} Officers</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <Stethoscope className="h-3.5 w-3.5 text-pink-400" />
              <span>{zone.medicalUnitsCount} Medics</span>
            </div>
          </div>
        </div>

        {/* CROWD HEADCOUNT ESTIMATION: ZERO-CONFLATION & AUDIT INTEGRITY */}
        <div className="rounded-xl border border-border/80 bg-surface-card p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
              App Users Tracked vs Estimated Total Crowd
            </span>
            <span className="rounded px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              SIDE-BY-SIDE AUDIT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* 1. App Users Tracked */}
            <div className="rounded-lg bg-surface/70 border border-border p-2.5 space-y-1">
              <span className="text-[10px] text-foreground-muted block uppercase font-semibold">
                1. App Users Tracked
              </span>
              <div className="text-sm font-bold text-foreground font-mono">
                NOT AVAILABLE
              </div>
              <span className="text-[9px] text-amber-400 font-mono block">
                LIVE SESSION TELEMETRY NOT CONNECTED
              </span>
              <div className="pt-1 border-t border-border/40 text-[9px] text-foreground-muted space-y-0.5">
                <div>Source: <span className="text-foreground">Client App Connection Registry</span></div>
                <div>Status: <span className="text-rose-400 font-mono font-bold">UNAVAILABLE (NO ACTIVE DEVICE TELEMETRY)</span></div>
                <div>Check Time: <span className="text-foreground font-mono">{lastUpdated}</span></div>
              </div>
            </div>

            {/* 2. Estimated Total Crowd */}
            <div className="rounded-lg bg-surface/70 border border-border p-2.5 space-y-1">
              <span className="text-[10px] text-foreground-muted block uppercase font-semibold">
                2. Estimated Total Crowd
              </span>
              <div className="text-base font-extrabold text-foreground font-mono">
                200,000 – 300,000
              </div>
              <span className="text-[9px] text-emerald-400 font-mono block">
                OFFICIAL POLICE ASSESSMENT RANGE
              </span>
              <div className="pt-1 border-t border-border/40 text-[9px] text-foreground-muted space-y-0.5">
                <div>Source: <span className="text-foreground">Justice D&apos;Cunha Inquiry (§4.2) / Police Report</span></div>
                <div>Status: <span className="text-emerald-400 font-mono font-bold">VERIFIED OFFICIAL ESTIMATE RANGE</span></div>
                <div>Venue Context: <span className="text-foreground font-mono">35,000 rated capacity (KSCA spec; not attendance)</span></div>
              </div>
            </div>
          </div>

          {/* Sampling Multiplier Calibration Status */}
          <div className="rounded bg-surface/40 p-2.5 border border-border/40 text-[10px] text-foreground-muted leading-relaxed space-y-1">
            <div className="text-foreground font-semibold flex items-center justify-between">
              <span>Sampling Multiplier Status:</span>
              <span className="text-[9px] font-mono text-amber-400 uppercase font-bold">
                MULTIPLIER UNAVAILABLE — CALIBRATION REQUIRED
              </span>
            </div>
            <div>
              A statistical multiplier requires empirical ground-truth calibration (e.g. mobile SIM tower registrations or physical optical turnstile counts). Deriving total crowd from uncalibrated app counters is mathematically invalid and prohibited under PRAVAAH zero-fabrication standards.
            </div>
          </div>
        </div>

        {/* Action Buttons: WHAT-IF SIMULATION & APPLY INTERVENTION */}
        <div className="space-y-2.5 pt-1">
          {/* Emergency Mark Zone Red Override Button */}
          <button
            type="button"
            onClick={() => {
              const markZoneRed = useSimulationStore.getState().markZoneRed;
              markZoneRed(zone.id);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-rose-950/50 transition-all border border-rose-400/30"
          >
            <ShieldCheck className="h-4 w-4" /> MARK ZONE RED (EMERGENCY OVERRIDE & REROUTE)
          </button>

          <button
            type="button"
            onClick={() => onRunWhatIf(zone.id)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow-md shadow-accent/25 hover:bg-accent/90 transition-all"
          >
            <Play className="h-4 w-4" /> Run &ldquo;What-If?&rdquo; Simulation Scenario
          </button>

          <button
            type="button"
            onClick={() => onApproveIntervention("Redirect Central Inflow to Gate B")}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted/50 px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted transition-all"
          >
            Execute Direct Intervention →
          </button>
        </div>
      </div>
    </div>
  );
}
