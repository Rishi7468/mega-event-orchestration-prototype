"use client";

import { useMemo, useState } from "react";
import { Radio, TrendingDown, TrendingUp } from "lucide-react";
import { CameraFeed, CameraFeedCard, CameraProvenance } from "@/components/camera";
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Crowd Intelligence</h1>
        <p className="text-xs text-foreground-muted">
          Site-camera observations — the raw input every forecast below is built from
        </p>
      </div>

      <LineagePipeline activeStage="observed" />

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3.5">
        <Radio className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />
        <p className="text-xs leading-relaxed text-foreground-muted">
          Every feed here is a{" "}
          <span className="font-medium text-foreground">site camera</span>. Observations flow into
          the same pipeline regardless of which sensor produced them, so additional sources can be
          connected without changing anything downstream. Every reading below is{" "}
          <span className="font-medium text-foreground">simulated demo data</span> — no live feed
          is connected.
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

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-foreground-muted">
              <th className="px-4 py-3 font-medium">Zone</th>
              <th className="px-4 py-3 font-medium">Crowd pressure</th>
              <th className="px-4 py-3 font-medium">Cameras covering</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => {
              const snapshot = zoneSnapshots.find((item) => item.zoneId === zone.id);
              const zoneCameras = cameras.filter((camera) => camera.zoneId === zone.id);
              if (!snapshot) return null;
              return (
                <tr key={zone.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{zone.name}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground-muted">
                    {snapshot.crowdPressure}%
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {zoneCameras.length > 0
                      ? zoneCameras.map((camera) => camera.name.split(" · ")[0]).join(", ")
                      : "None"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge risk={pressureToRisk(snapshot.crowdPressure)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
