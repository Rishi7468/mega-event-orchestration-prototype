import type { AccommodationZone, Zone, ZoneSnapshot } from "@/types";

/**
 * Four zones tell one coherent destination story: Central is the closest
 * to the venue and the most saturated; North is the balanced alternative;
 * East is cheap but far; South sits in between. Every derived dataset
 * (transport, cameras, recommendations) must stay consistent with this
 * shape — see docs/11_DATA_MODEL.md "Data consistency".
 */
export const zones: Zone[] = [
  {
    id: "central",
    name: "Central Zone",
    type: "mixed",
    capacity: 50_000,
    currentPopulation: 31_000,
    inflowPerMinute: 420,
    outflowPerMinute: 300,
    pressurePercent: 62,
    risk: "high",
  },
  {
    id: "north",
    name: "North Zone",
    type: "accommodation",
    capacity: 40_000,
    currentPopulation: 16_800,
    inflowPerMinute: 260,
    outflowPerMinute: 240,
    pressurePercent: 42,
    risk: "medium",
  },
  {
    id: "east",
    name: "East Zone",
    type: "accommodation",
    capacity: 35_000,
    currentPopulation: 10_850,
    inflowPerMinute: 150,
    outflowPerMinute: 145,
    pressurePercent: 31,
    risk: "low",
  },
  {
    id: "south",
    name: "South Zone",
    type: "accommodation",
    capacity: 30_000,
    currentPopulation: 11_400,
    inflowPerMinute: 180,
    outflowPerMinute: 170,
    pressurePercent: 38,
    risk: "low",
  },
];

export const accommodationZones: AccommodationZone[] = [
  {
    zoneId: "central",
    totalRooms: 3_200,
    availableRooms: 260,
    averagePrice: 4_500,
    demandTrend: "rising",
    venueTravelMinutes: 20,
    transportQuality: "good",
    crowdLevel: "high",
  },
  {
    zoneId: "north",
    totalRooms: 4_100,
    availableRooms: 2_460,
    averagePrice: 2_800,
    demandTrend: "stable",
    venueTravelMinutes: 30,
    transportQuality: "good",
    crowdLevel: "medium",
  },
  {
    zoneId: "east",
    totalRooms: 3_600,
    availableRooms: 2_880,
    averagePrice: 1_600,
    demandTrend: "falling",
    venueTravelMinutes: 60,
    transportQuality: "moderate",
    crowdLevel: "low",
  },
  {
    zoneId: "south",
    totalRooms: 2_900,
    availableRooms: 1_450,
    averagePrice: 2_200,
    demandTrend: "stable",
    venueTravelMinutes: 45,
    transportQuality: "moderate",
    crowdLevel: "medium",
  },
];

/**
 * Exact per-phase pressure figures, matching docs/12_SIMULATION_ENGINE.md
 * phases 1 (normal) and 8 (outcome). Deliberately table-driven rather than
 * formula-driven so the demo is 100% repeatable — no randomness.
 */
export const zoneSnapshotsNormal: ZoneSnapshot[] = [
  { zoneId: "central", accommodationPressure: 72, crowdPressure: 62, transportUtilization: 70 },
  { zoneId: "north", accommodationPressure: 48, crowdPressure: 42, transportUtilization: 52 },
  { zoneId: "east", accommodationPressure: 34, crowdPressure: 31, transportUtilization: 45 },
  { zoneId: "south", accommodationPressure: 40, crowdPressure: 38, transportUtilization: 48 },
];

export const zoneSnapshotsSpike: ZoneSnapshot[] = [
  { zoneId: "central", accommodationPressure: 91, crowdPressure: 95, transportUtilization: 88 },
  { zoneId: "north", accommodationPressure: 48, crowdPressure: 42, transportUtilization: 52 },
  { zoneId: "east", accommodationPressure: 34, crowdPressure: 31, transportUtilization: 45 },
  { zoneId: "south", accommodationPressure: 40, crowdPressure: 38, transportUtilization: 48 },
];

export const zoneSnapshotsOutcome: ZoneSnapshot[] = [
  { zoneId: "central", accommodationPressure: 72, crowdPressure: 70, transportUtilization: 68 },
  { zoneId: "north", accommodationPressure: 59, crowdPressure: 50, transportUtilization: 61 },
  { zoneId: "east", accommodationPressure: 34, crowdPressure: 31, transportUtilization: 45 },
  { zoneId: "south", accommodationPressure: 40, crowdPressure: 38, transportUtilization: 48 },
];
