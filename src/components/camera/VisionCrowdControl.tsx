"use client";

import { useState } from "react";
import { VisionCrowdProvider, type RawVisionTelemetry } from "@/lib/adapters/crowdDataProvider";
import { useSimulationStore } from "@/store/simulationStore";

export function VisionCrowdControl() {
  const [visionMode, setVisionMode] = useState<"simulation" | "vision_adapter">("simulation");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [telemetryLog, setTelemetryLog] = useState<RawVisionTelemetry | null>(null);

  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);

  const triggerVisionIngest = async (highDensity: boolean = true) => {
    setIsProcessing(true);

    const provider = new VisionCrowdProvider();
    const density = highDensity ? 3.25 : 1.4; // 3.25 persons/m² = ~93% pressure
    const count = highDensity ? 287 : 110;
    const trackIds = Array.from({ length: highDensity ? 6 : 3 }, (_, i) => `trk_central_${101 + i}`);

    const rawData: RawVisionTelemetry = {
      cameraId: "cam-central-01",
      zoneId: "central",
      personCount: count,
      densityPerSqMeter: density,
      timestamp: new Date().toLocaleTimeString(),
      model: "yolo11",
      confidencePercent: highDensity ? 96 : 94,
      trackIds,
      source: "CV",
    };

    provider.ingestVisionTelemetry(rawData);
    setTelemetryLog(rawData);

    const updatedSnapshots = await provider.fetchZoneSnapshots(zoneSnapshots);
    const liveCrowdState = provider.getLiveCrowdState("central", 50000);

    const store = useSimulationStore.getState();
    store.updateZoneCrowdState("central", {
      ...liveCrowdState,
      peopleCount: highDensity ? 47500 : 21000,
      occupancyPercent: highDensity ? 95 : 42,
      crowdLevel: highDensity ? "CRITICAL" : "LOW",
      trend: highDensity ? "INCREASING" : "DECREASING",
      confidencePercent: 96,
      source: "CV",
      anonymousTrackIds: trackIds,
    });

    store.updateFlowEdges([
      { sourceZoneId: "south", targetZoneId: "central", peoplePerMinute: highDensity ? 680 : 310 },
      { sourceZoneId: "central", targetZoneId: "north", peoplePerMinute: highDensity ? 540 : 220 },
      { sourceZoneId: "east", targetZoneId: "central", peoplePerMinute: highDensity ? 390 : 150 },
    ]);

    useSimulationStore.setState({
      zoneSnapshots: updatedSnapshots,
      phase: highDensity ? "recommendation" : "normal",
    });

    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Crowd Telemetry Boundary</h3>
            <span className="rounded-full bg-accent-glow/15 px-2.5 py-0.5 text-[10px] uppercase font-bold text-accent-glow border border-accent-glow/30">
              Provider: {visionMode === "simulation" ? "Simulation Engine" : "Vision Adapter (YOLO Contract)"}
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            Normalized crowd metrics entering Pravaah via CrowdDataProvider abstraction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVisionMode("simulation");
              useSimulationStore.getState().reset();
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              visionMode === "simulation"
                ? "bg-surface-muted text-foreground border border-surface-border"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Simulated Provider
          </button>
          <button
            onClick={() => {
              setVisionMode("vision_adapter");
              triggerVisionIngest(true);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              visionMode === "vision_adapter"
                ? "bg-accent-glow/20 text-accent-glow border border-accent-glow/40"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Vision Telemetry Adapter
          </button>
        </div>
      </div>

      {visionMode === "vision_adapter" && (
        <div className="space-y-3 bg-surface/50 rounded-lg p-4 border border-surface-border/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-foreground">
                Vision Adapter Active (Injected Telemetry Mode)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isProcessing}
                onClick={() => triggerVisionIngest(true)}
                className="rounded-md bg-status-critical/20 hover:bg-status-critical/30 text-status-critical text-xs px-3 py-1 font-semibold transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing Telemetry..." : "Inject High Density (3.25 p/m²)"}
              </button>
              <button
                disabled={isProcessing}
                onClick={() => triggerVisionIngest(false)}
                className="rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs px-3 py-1 font-semibold transition-colors disabled:opacity-50"
              >
                Clear Density Spike
              </button>
            </div>
          </div>

          {telemetryLog && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-surface-border/40 text-xs font-mono">
              <div className="bg-background/80 p-2 rounded border border-surface-border">
                <span className="text-[10px] text-foreground-muted block">Zone Contract</span>
                <strong className="text-foreground">{telemetryLog.zoneId}</strong>
              </div>
              <div className="bg-background/80 p-2 rounded border border-surface-border">
                <span className="text-[10px] text-foreground-muted block">People Count</span>
                <strong className="text-foreground">{telemetryLog.personCount} tracked</strong>
              </div>
              <div className="bg-background/80 p-2 rounded border border-surface-border">
                <span className="text-[10px] text-foreground-muted block">Density Payload</span>
                <strong className="text-amber-400">{telemetryLog.densityPerSqMeter} / m²</strong>
              </div>
              <div className="bg-background/80 p-2 rounded border border-surface-border">
                <span className="text-[10px] text-foreground-muted block">Contract Format</span>
                <strong className="text-accent-glow">{telemetryLog.model.toUpperCase()} Contract</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
