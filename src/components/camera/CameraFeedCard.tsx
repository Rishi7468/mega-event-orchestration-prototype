import type { Camera } from "@/types";
import { StatusBadge } from "@/components/shared";
import type { CrowdTrend } from "@/lib/conditions";
import { CameraFeed } from "./CameraFeed";

const statusToRisk: Record<Camera["status"], "low" | "medium" | "high"> = {
  normal: "low",
  elevated: "medium",
  critical: "high",
};

/**
 * A camera as a compact grid tile: the feed itself (real footage when one is
 * registered, a labelled placeholder otherwise) with its readings underneath.
 */
export function CameraFeedCard({
  camera,
  trend,
  selected,
  onSelect,
}: {
  camera: Camera;
  trend?: CrowdTrend;
  selected?: boolean;
  onSelect?: (cameraId: string) => void;
}) {
  const body = (
    <div
      className={`overflow-hidden rounded-xl border bg-surface-muted text-left transition-colors ${
        selected ? "border-accent" : "border-border"
      }`}
    >
      <CameraFeed camera={camera} trend={trend} />
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="truncate text-sm font-medium text-foreground">{camera.name}</span>
        <StatusBadge risk={statusToRisk[camera.status]} />
      </div>
    </div>
  );

  if (!onSelect) return body;

  return (
    <button
      type="button"
      onClick={() => onSelect(camera.id)}
      aria-pressed={selected}
      className="block w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {body}
    </button>
  );
}
