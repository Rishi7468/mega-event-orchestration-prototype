import { utilizationPercent, zones } from "@/data";
import type { Alert, TransportRoute, VenueGate, ZoneSnapshot } from "@/types";
import { predictZonePressure } from "./prediction";

let counter = 0;
function alert(tone: Alert["tone"], title: string, message: string): Alert {
  counter += 1;
  return { id: `op-alert-${counter}`, audience: "operator", tone, title, message, createdAt: "Just now" };
}

/** Minutes until a zone's crowd pressure would cross 100% at the current growth rate. */
function minutesToCritical(snapshot: ZoneSnapshot): number {
  const remaining = 100 - snapshot.crowdPressure;
  return Math.max(1, Math.round(remaining / 0.6));
}

function routeUtilization(route: TransportRoute): number {
  return utilizationPercent(route.currentDemandPerHour, route.capacityPerHour);
}

/**
 * Generates a small, meaningful set of operator alerts from live state —
 * never a fixed seed list — so the alert panel actually tracks the
 * simulation instead of showing the same three lines forever.
 *
 * Each alert follows What → Why → what it means for the response, per
 * docs/05_OPERATOR_EXPERIENCE.md §11. Capped at three: a flood of low-value
 * alerts is worse than a few that matter.
 */
export function getOperatorAlerts(
  snapshots: ZoneSnapshot[],
  gates: VenueGate[],
  routes: TransportRoute[],
): Alert[] {
  const alerts: Alert[] = [];

  const mostPressured = [...snapshots].sort((a, b) => b.crowdPressure - a.crowdPressure)[0];
  const zoneName = (zoneId: string) => zones.find((z) => z.id === zoneId)?.name ?? zoneId;

  if (mostPressured && mostPressured.crowdPressure >= 85) {
    alerts.push(
      alert(
        "critical",
        `High crowd at ${zoneName(mostPressured.zoneId)}`,
        `${zoneName(mostPressured.zoneId)} is at ${mostPressured.crowdPressure}% crowd pressure and projected to reach critical density in about ${minutesToCritical(mostPressured)} minutes. Deploy crowd management and consider redirecting arrivals.`,
      ),
    );
  }

  const busiestGate = [...gates].sort((a, b) => b.estimatedWaitMinutes - a.estimatedWaitMinutes)[0];
  if (busiestGate && busiestGate.status === "busy") {
    alerts.push(
      alert(
        "critical",
        `${busiestGate.name} queue building`,
        `${busiestGate.currentQueue.toLocaleString()} people are queued, roughly a ${busiestGate.estimatedWaitMinutes} minute wait. Promoting a lower-wait gate to arriving visitors will ease this.`,
      ),
    );
  }

  const busiestRoute = [...routes].sort((a, b) => routeUtilization(b) - routeUtilization(a))[0];
  if (busiestRoute && routeUtilization(busiestRoute) >= 80) {
    alerts.push(
      alert(
        "advisory",
        `${busiestRoute.name} approaching capacity`,
        `Running at ${routeUtilization(busiestRoute)}% of capacity. Shifting shuttle frequency toward a quieter route would relieve it before it saturates.`,
      ),
    );
  }

  const spareZone = [...snapshots].sort(
    (a, b) => a.accommodationPressure - b.accommodationPressure,
  )[0];
  if (spareZone && mostPressured && spareZone.zoneId !== mostPressured.zoneId && mostPressured.accommodationPressure >= 80) {
    alerts.push(
      alert(
        "info",
        `${zoneName(spareZone.zoneId)} has spare capacity`,
        `Accommodation pressure is only ${spareZone.accommodationPressure}% here, with transport utilization at ${spareZone.transportUtilization}%. It's the best destination for redirected demand.`,
      ),
    );
  }

  if (alerts.length === 0) {
    alerts.push(
      alert(
        "info",
        "All zones within normal parameters",
        "No zone is under elevated pressure right now. The destination is operating normally.",
      ),
    );
  }

  const toneOrder: Record<Alert["tone"], number> = { critical: 0, advisory: 1, info: 2 };
  return alerts.sort((a, b) => toneOrder[a.tone] - toneOrder[b.tone]).slice(0, 3);
}

/** Forecast for the single most urgent zone — used for the compact command-center view. */
export function getUrgentForecast(snapshots: ZoneSnapshot[]) {
  const mostPressured = [...snapshots].sort((a, b) => b.crowdPressure - a.crowdPressure)[0];
  if (!mostPressured) return null;
  return {
    zoneName: zones.find((z) => z.id === mostPressured.zoneId)?.name ?? mostPressured.zoneId,
    current: mostPressured,
    plus10: predictZonePressure(mostPressured, 10),
    plus20: predictZonePressure(mostPressured, 20),
  };
}
