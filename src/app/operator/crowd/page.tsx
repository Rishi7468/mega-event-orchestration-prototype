"use client";

import { useMemo, useState } from "react";
import { Radio, TrendingDown, TrendingUp } from "lucide-react";
import { CameraFeed, CameraFeedCard, CameraProvenance, VisionCrowdControl, RealtimeVideoAnalyzer } from "@/components/camera";
import { LineagePipeline } from "@/components/operator";
import { StatusBadge } from "@/components/shared";
import { zones } from "@/data";
import { getCameraTrend, getCamerasForPhase } from "@/lib/conditions";
import { pressureToRisk } from "@/lib/recommendation";
import { useSimulationStore } from "@/store/simulationStore";
import type { Camera } from "@/types";

const statusToRisk: Record<Camera["status"], "low" | "medium" | "high"> = {
  normal: "low",
  elevated: "medium",
  critical: "high",
};

/** "all" plus one entry per zone that actually has a camera in it. */
type CameraFilter = "all" | "attention" | `zone:${string}`;

export default function CrowdIntelligencePage() {
  const phase = useSimulationStore((state) => state.phase);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const liveCrowdStates = useSimulationStore((state) => state.liveCrowdStates);
  const predictions = useSimulationStore((state) => state.predictions);
  const cameras = getCamerasForPhase(phase);

  const [filter, setFilter] = useState<CameraFilter>("all");
  const [selectedId, setSelectedId] = useState<string>(cameras[0]?.id ?? "");

  const filtered = useMemo(() => {
    if (filter === "attention") return cameras.filter((camera) => camera.status !== "normal");
    if (filter.startsWith("zone:")) {
      const zoneId = filter.slice(5);
      return cameras.filter((camera) => camera.zoneId === zoneId);
    }
    return cameras;
  }, [cameras, filter]);

  // Keep a valid selection when the active filter excludes the current pick.
  const selected =
    filtered.find((camera) => camera.id === selectedId) ?? filtered[0] ?? cameras[0];

  const cameraZoneIds = Array.from(new Set(cameras.map((camera) => camera.zoneId)));
  const attentionCount = cameras.filter((camera) => camera.status !== "normal").length;

  const filters: { id: CameraFilter; label: string; count: number }[] = [
    { id: "all", label: "All cameras", count: cameras.length },
    ...cameraZoneIds.map((zoneId) => ({
      id: `zone:${zoneId}` as CameraFilter,
      label: zones.find((zone) => zone.id === zoneId)?.name.replace(" Zone", "") ?? zoneId,
      count: cameras.filter((camera) => camera.zoneId === zoneId).length,
    })),
    { id: "attention", label: "Needs attention", count: attentionCount },
  ];

  const selectedTrend = selected ? getCameraTrend(selected, phase) : "stable";
  const TrendIcon =
    selectedTrend === "increasing" ? TrendingUp : selectedTrend === "decreasing" ? TrendingDown : Radio;
  const trendLabel =
    selectedTrend === "increasing"
      ? "Increasing"
      : selectedTrend === "decreasing"
        ? "Decreasing"
        : "Stable";

  const activeJourney = useSimulationStore((state) => state.activeJourney);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Crowd Intelligence</h1>
          <p className="text-xs text-foreground-muted">
            Site-camera observations — the raw input every forecast below is built from
          </p>
        </div>

        {activeJourney?.journeyActive && (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">
              ⚡ Live Visitor Rerouting Active
            </span>
            <span className="text-[10px] text-amber-200/80 font-mono">
              ({activeJourney.userAcceptedRerouteCount} accepted)
            </span>
          </div>
        )}
      </div>

      <LineagePipeline activeStage="observed" />

      {/* PHASE 3 — REAL MP4 VIDEO PERCEPTION PIPELINE */}
      <RealtimeVideoAnalyzer />

      <VisionCrowdControl />

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3.5">
        <Radio className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />
        <p className="text-xs leading-relaxed text-foreground-muted">
          Every feed here is a{" "}
          <span className="font-medium text-foreground">site camera</span>. Observations flow into
          the same pipeline regardless of which sensor produced them, so additional sources can be
          connected without changing anything downstream. Connected providers can toggle between{" "}
          <span className="font-medium text-foreground">simulation telemetry</span> and{" "}
          <span className="font-medium text-foreground">YOLOv11 computer vision telemetry</span>.
        </p>
      </div>

      {/* --- filters ------------------------------------------------------ */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
          Show
        </span>
        {filters.map(({ id, label, count }) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={active}
              disabled={count === 0}
              className={`rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 ${
                active
                  ? "border-accent/60 bg-surface-muted font-medium text-foreground"
                  : "border-border text-foreground-muted"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-foreground-muted">No cameras match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
          {/* --- the selected feed, at working size ----------------------- */}
          <div className="space-y-3">
            {selected && (
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <CameraFeed camera={selected} trend={selectedTrend} size="primary" controls />
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {selected.name}
                      </p>
                      <CameraProvenance camera={selected} />
                    </div>
                    <StatusBadge risk={statusToRisk[selected.status]} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[11px] text-foreground-muted">People detected</p>
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {selected.peopleDetected.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-foreground-muted">Density</p>
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {selected.densityPercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-foreground-muted">Flow</p>
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {selected.flowPerMinute}/min
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-foreground-muted">Trend</p>
                      <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <TrendIcon className="h-3.5 w-3.5" />
                        {trendLabel}
                      </p>
                    </div>
                  </div>

                  <p className="border-t border-border pt-3 text-[11px] text-foreground-muted">
                    Movement {selected.movementDirection} ·{" "}
                    {zones.find((zone) => zone.id === selected.zoneId)?.name} · observed{" "}
                    {selected.observedAt}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* --- every other feed, selectable ----------------------------- */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
              Feeds ({filtered.length})
            </p>
            <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-1">
              {filtered.map((camera) => (
                <CameraFeedCard
                  key={camera.id}
                  camera={camera}
                  trend={getCameraTrend(camera, phase)}
                  selected={camera.id === selected?.id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {useMemo(() => (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="px-4 py-3 border-b border-border bg-surface-muted/30 flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Live Zone Crowd Intelligence Matrix
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">[LIVE SSE AGGREGATED]</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-foreground-muted">
                <th className="px-4 py-3 font-medium">Zone Sector</th>
                <th className="px-4 py-3 font-medium">Live Headcount</th>
                <th className="px-4 py-3 font-medium">Occupancy</th>
                <th className="px-4 py-3 font-medium">Crowd Level</th>
                <th className="px-4 py-3 font-medium">Trend</th>
                <th className="px-4 py-3 font-medium">Forecast (+15m)</th>
                <th className="px-4 py-3 font-medium">Time to Critical</th>
                <th className="px-4 py-3 font-medium">Confidence & Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const liveState = liveCrowdStates[zone.id];
                const prediction = predictions[zone.id];
                const snapshot = zoneSnapshots.find((item) => item.zoneId === zone.id);
                const zoneCameras = cameras.filter((camera) => camera.zoneId === zone.id);

                const headcount = liveState?.peopleCount ?? Math.round((zone.capacity * (snapshot?.crowdPressure ?? 40)) / 100);
                const pressure = liveState?.occupancyPercent ?? snapshot?.crowdPressure ?? 40;
                const crowdLevel = liveState?.crowdLevel ?? (pressure >= 85 ? "CRITICAL" : pressure >= 70 ? "HIGH" : pressure >= 45 ? "MODERATE" : "LOW");
                const trend = liveState?.trend ?? "STABLE";
                const confidencePercent = liveState?.confidencePercent ?? 92;
                const source = liveState?.source ?? "SIMULATED";

                const predictedLevel = prediction?.predictedCrowdLevel ?? crowdLevel;
                const timeToCritical = prediction?.timeToCriticalMinutes;

                return (
                  <tr key={zone.id} className="border-b border-border last:border-0 hover:bg-surface-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{zone.name}</div>
                      <div className="text-[10px] font-mono text-foreground-muted">{zone.id.toUpperCase()} · {zoneCameras.length} CCTV Feeds</div>
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-foreground">
                      {headcount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground-muted">
                      <span className="font-bold text-foreground">{pressure}%</span>
                      <div className="w-16 h-1 bg-surface-muted rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${pressure >= 85 ? "bg-red-500" : pressure >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, pressure)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-xs">
                      <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${
                        crowdLevel === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/40" :
                        crowdLevel === "HIGH" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                        crowdLevel === "MODERATE" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" :
                        "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      }`}>
                        {crowdLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`font-semibold flex items-center gap-1 ${
                        trend === "INCREASING" ? "text-red-400" : trend === "DECREASING" ? "text-emerald-400" : "text-foreground-muted"
                      }`}>
                        {trend === "INCREASING" ? "↑ Increasing" : trend === "DECREASING" ? "↓ Easing" : "→ Stable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-xs">
                      <span className={`px-2 py-0.5 rounded border text-[10px] uppercase ${
                        predictedLevel === "CRITICAL" ? "bg-red-500/30 text-red-400 border-red-500/50 font-extrabold animate-pulse" :
                        predictedLevel === "HIGH" ? "bg-amber-500/30 text-amber-400 border-amber-500/50 font-bold" :
                        predictedLevel === "MODERATE" ? "bg-yellow-500/30 text-yellow-400 border-yellow-500/50" :
                        "bg-emerald-500/30 text-emerald-400 border-emerald-500/50"
                      }`}>
                        ⚡ {predictedLevel} ({prediction?.predictedOccupancyPercent ?? pressure}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold">
                      {timeToCritical === undefined || timeToCritical === null ? (
                        <span className="text-foreground-muted font-normal">Not predicted</span>
                      ) : timeToCritical === 0 ? (
                        <span className="text-red-400 font-extrabold uppercase text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/40">Critical Now</span>
                      ) : (
                        <span className="text-red-400 font-extrabold">~{timeToCritical} min</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground-muted">
                      <div>{confidencePercent}% confidence</div>
                      <span className={`text-[10px] font-mono font-bold ${source === "CV" ? "text-purple-400" : "text-blue-400"}`}>
                        {source === "CV" ? "[CV Telemetry]" : "[Simulated]"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge risk={pressureToRisk(pressure)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ), [liveCrowdStates, predictions, zoneSnapshots, cameras])}
    </div>
  );
}
