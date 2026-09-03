import type { CongestionLevel, TransportRoute, TransportSnapshot } from "@/types";

/**
 * Fixed infrastructure facts for each route. `travelMinutes` reconciles with
 * each zone's `venueTravelMinutes` in zones.ts: walk to the hub + ride = the
 * zone's door-to-venue figure (e.g. North = 5 min walk + 25 min shuttle = 30).
 *
 * Demand and reliability are NOT here — those are conditions that change
 * with the simulation, and live in the snapshot tables below.
 */
type TransportRouteBase = Omit<
  TransportRoute,
  "currentDemandPerHour" | "congestion" | "reliability"
>;

export const transportRouteBase: TransportRouteBase[] = [
  {
    id: "route-s1",
    name: "Shuttle S1 — Central Line",
    mode: "shuttle",
    fromZoneId: "central",
    toZoneId: "central",
    capacityPerHour: 3_000,
    travelMinutes: 15,
    frequencyMinutes: 6,
  },
  {
    id: "route-s3",
    name: "Shuttle S3 — North Line",
    mode: "shuttle",
    fromZoneId: "north",
    toZoneId: "central",
    capacityPerHour: 2_400,
    travelMinutes: 25,
    frequencyMinutes: 9,
  },
  {
    id: "route-east-bus",
    name: "East Express Bus",
    mode: "bus",
    fromZoneId: "east",
    toZoneId: "central",
    capacityPerHour: 1_800,
    travelMinutes: 50,
    frequencyMinutes: 15,
  },
  {
    id: "route-south-shuttle",
    name: "South Connector Shuttle",
    mode: "shuttle",
    fromZoneId: "south",
    toZoneId: "central",
    capacityPerHour: 2_000,
    travelMinutes: 38,
    frequencyMinutes: 12,
  },
];

/**
 * Route demand is authored so that each route's utilization equals its
 * origin zone's `transportUtilization` in zones.ts for the same phase.
 * That is what stops the operator's zone table and route table from ever
 * disagreeing — one number, shown two ways.
 *
 * Central's S1 therefore runs 70% → 88% → 68% across normal/spike/outcome,
 * matching docs/12_SIMULATION_ENGINE.md's "main route utilization 86% → 68%"
 * outcome line, while North's S3 rises 52% → 61% as it absorbs redirected
 * demand.
 */
export const transportSnapshotsNormal: TransportSnapshot[] = [
  { routeId: "route-s1", currentDemandPerHour: 2_100, reliability: 0.88 }, // 70%
  { routeId: "route-s3", currentDemandPerHour: 1_248, reliability: 0.94 }, // 52%
  { routeId: "route-east-bus", currentDemandPerHour: 810, reliability: 0.9 }, // 45%
  { routeId: "route-south-shuttle", currentDemandPerHour: 960, reliability: 0.88 }, // 48%
];

export const transportSnapshotsSpike: TransportSnapshot[] = [
  { routeId: "route-s1", currentDemandPerHour: 2_640, reliability: 0.72 }, // 88%
  { routeId: "route-s3", currentDemandPerHour: 1_248, reliability: 0.94 }, // 52%
  { routeId: "route-east-bus", currentDemandPerHour: 810, reliability: 0.9 }, // 45%
  { routeId: "route-south-shuttle", currentDemandPerHour: 960, reliability: 0.88 }, // 48%
];

export const transportSnapshotsOutcome: TransportSnapshot[] = [
  { routeId: "route-s1", currentDemandPerHour: 2_040, reliability: 0.86 }, // 68%
  { routeId: "route-s3", currentDemandPerHour: 1_464, reliability: 0.91 }, // 61%
  { routeId: "route-east-bus", currentDemandPerHour: 810, reliability: 0.9 }, // 45%
  { routeId: "route-south-shuttle", currentDemandPerHour: 960, reliability: 0.88 }, // 48%
];

export function utilizationPercent(demandPerHour: number, capacityPerHour: number): number {
  return Math.round((demandPerHour / capacityPerHour) * 100);
}

/** Derived, never stored — so congestion can't contradict the utilization figure. */
export function congestionFromUtilization(percent: number): CongestionLevel {
  if (percent >= 78) return "high";
  if (percent >= 55) return "medium";
  return "low";
}

/** Merges the fixed route facts with a phase's conditions into a whole route. */
export function resolveRoutes(snapshots: TransportSnapshot[]): TransportRoute[] {
  return transportRouteBase.map((base) => {
    const snapshot = snapshots.find((item) => item.routeId === base.id);
    const currentDemandPerHour = snapshot?.currentDemandPerHour ?? 0;
    return {
      ...base,
      currentDemandPerHour,
      reliability: snapshot?.reliability ?? 0.9,
      congestion: congestionFromUtilization(
        utilizationPercent(currentDemandPerHour, base.capacityPerHour),
      ),
    };
  });
}
