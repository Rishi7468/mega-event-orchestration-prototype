import { KpiCard } from "./KpiCard";
import { formatVisitorCount } from "@/lib/operator";
import type { DestinationSummary } from "@/lib/operator";

/**
 * Destination Status — the top-line answer to "what is happening now"
 * (docs/05 "Main dashboard" top strip). Every value is derived from the
 * live simulation snapshot via lib/operator/summary.ts, never hardcoded.
 */
export function DestinationStatusBar({ summary }: { summary: DestinationSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <KpiCard
        label="Overall Pressure"
        value={`${summary.overallPressurePercent}%`}
        tone={summary.overallPressurePercent >= 70 ? "high" : summary.overallPressurePercent >= 45 ? "medium" : "low"}
      />
      <KpiCard label="Visitor Demand" value={formatVisitorCount(summary.totalVisitors)} />
      <KpiCard
        label="Transport Utilization"
        value={`${summary.transportUtilizationPercent}%`}
        tone={summary.transportUtilizationPercent >= 70 ? "high" : "medium"}
      />
      <KpiCard
        label="Venue Occupancy"
        value={`${summary.venueOccupancyPercent}%`}
        tone={summary.venueOccupancyPercent >= 70 ? "high" : "medium"}
      />
      <KpiCard
        label="Critical Alerts"
        value={String(summary.criticalAlertCount)}
        sublabel={summary.criticalAlertCount > 0 ? "Requires action" : "All clear"}
        tone={summary.criticalAlertCount > 0 ? "critical" : "low"}
      />
    </div>
  );
}
