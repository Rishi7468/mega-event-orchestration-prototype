export type TransportMode = "bus" | "shuttle" | "metro" | "walk";
export type CongestionLevel = "low" | "medium" | "high";

export type TransportRoute = {
  id: string;
  name: string;
  mode: TransportMode;
  fromZoneId: string;
  toZoneId: string;
  capacityPerHour: number;
  currentDemandPerHour: number;
  travelMinutes: number;
  congestion: CongestionLevel;
  reliability: number;
  frequencyMinutes: number;
};

/**
 * The parts of a route that move with the simulation. Capacity, travel time
 * and frequency are fixed infrastructure facts; demand and reliability are
 * conditions, so they live in per-phase snapshots exactly like zone
 * pressure does.
 */
export type TransportSnapshot = {
  routeId: string;
  currentDemandPerHour: number;
  reliability: number;
};
