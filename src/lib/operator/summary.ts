import { utilizationPercent, venue, zones } from "@/data";
import type { Alert, TransportRoute, VenueGate, ZoneSnapshot } from "@/types";

/**
 * Live visitor count for a zone, derived from its capacity and the current
 * crowd-pressure snapshot — not the static seed population — so it moves
 * with the simulation instead of reporting the same number in every phase.
 */
export function getZoneLiveVisitors(zoneId: string, snapshots: ZoneSnapshot[]): number {
  const zone = zones.find((item) => item.id === zoneId);
  const snapshot = snapshots.find((item) => item.zoneId === zoneId);
  if (!zone || !snapshot) return 0;
  return Math.round(zone.capacity * (snapshot.crowdPressure / 100));
}

/** Venue sits in the Central zone, so its live occupancy tracks Central's crowd pressure. */
export function getVenueLiveOccupancy(snapshots: ZoneSnapshot[]): number {
  const centralSnapshot = snapshots.find((item) => item.zoneId === venue.zoneId);
  if (!centralSnapshot) return venue.currentOccupancy;
  return Math.round(venue.capacity * (centralSnapshot.crowdPressure / 100));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export type DestinationSummary = {
  overallPressurePercent: number;
  totalVisitors: number;
  transportUtilizationPercent: number;
  venueOccupancyPercent: number;
  criticalAlertCount: number;
};

/**
 * The Command Center's top-line numbers, all derived from the same live
 * snapshot the rest of the operator surface reads — never a disconnected
 * hardcoded figure (docs/05 "Main dashboard" top strip).
 */
export function computeDestinationSummary(
  snapshots: ZoneSnapshot[],
  alerts: Alert[],
): DestinationSummary {
  const totalVisitors = zones.reduce(
    (sum, zone) => sum + getZoneLiveVisitors(zone.id, snapshots),
    0,
  );

  return {
    overallPressurePercent: average(snapshots.map((s) => s.accommodationPressure)),
    totalVisitors,
    transportUtilizationPercent: average(snapshots.map((s) => s.transportUtilization)),
    venueOccupancyPercent: Math.round((getVenueLiveOccupancy(snapshots) / venue.capacity) * 100),
    criticalAlertCount: alerts.filter((a) => a.tone === "critical").length,
  };
}

export function formatVisitorCount(count: number): string {
  if (count >= 100_000) return `${(count / 100_000).toFixed(1)}L`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export function routeUtilizationPercent(route: TransportRoute): number {
  return utilizationPercent(route.currentDemandPerHour, route.capacityPerHour);
}

export function gateByZone(gates: VenueGate[], zoneId: string): VenueGate | undefined {
  return gates.find((gate) => gate.zoneId === zoneId);
}
