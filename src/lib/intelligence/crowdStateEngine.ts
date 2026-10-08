import type { ZoneCrowdState, CrowdLevel, CrowdTrendDirection } from "@/types";

export type RawCrowdObservation = {
  zoneId: string;
  cameraId?: string;
  personCount?: number;
  densityPerSqMeter?: number;
  confidencePercent?: number;
  source: "CV" | "SIMULATED";
  timestamp?: number;
  trackIds?: string[];
};

export type ZoneMetadata = {
  zoneId: string;
  name: string;
  capacity: number;
  areaSqMeters?: number;
};

/**
 * Deterministically computes crowd level grade from occupancy percentage or density.
 */
export function deriveCrowdLevel(occupancyPercent: number, densityPerSqMeter?: number): CrowdLevel {
  if (occupancyPercent >= 88 || (densityPerSqMeter !== undefined && densityPerSqMeter >= 3.0)) {
    return "CRITICAL";
  }
  if (occupancyPercent >= 75 || (densityPerSqMeter !== undefined && densityPerSqMeter >= 2.2)) {
    return "HIGH";
  }
  if (occupancyPercent >= 45 || (densityPerSqMeter !== undefined && densityPerSqMeter >= 1.2)) {
    return "MODERATE";
  }
  return "LOW";
}

/**
 * Deterministically computes crowd trend by comparing current headcount/occupancy against recent state.
 */
export function deriveCrowdTrend(
  currentOccupancy: number,
  previousState?: ZoneCrowdState
): CrowdTrendDirection {
  if (!previousState) return "STABLE";
  const delta = currentOccupancy - previousState.occupancyPercent;
  if (delta >= 2) return "INCREASING";
  if (delta <= -2) return "DECREASING";
  return "STABLE";
}

/**
 * Format relative time for freshness (e.g. "Updated 4s ago" or "Just now")
 */
export function formatFreshness(timestampMs: number): string {
  const secondsAgo = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (secondsAgo < 5) return "Just now";
  if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
  const minutesAgo = Math.floor(secondsAgo / 60);
  return `Updated ${minutesAgo}m ago`;
}

/**
 * Computes deterministic live crowd state for a single zone.
 */
export function computeZoneCrowdState(
  meta: ZoneMetadata,
  observation?: RawCrowdObservation,
  previousState?: ZoneCrowdState,
  fallbackPressurePercent: number = 40
): ZoneCrowdState {
  const capacity = Math.max(100, meta.capacity || 30000);
  const areaSqMeters = meta.areaSqMeters || Math.round(capacity / 2.5);

  let peopleCount: number;
  let occupancyPercent: number;
  let densityPerSqMeter: number;
  const source: "CV" | "SIMULATED" = observation?.source ?? "SIMULATED";
  let confidencePercent: number;

  if (observation?.personCount !== undefined) {
    peopleCount = observation.personCount;
    occupancyPercent = Math.min(100, Math.max(0, Math.round((peopleCount / capacity) * 100)));
    densityPerSqMeter = observation.densityPerSqMeter ?? Number((peopleCount / areaSqMeters).toFixed(2));
    confidencePercent = observation.confidencePercent ?? (source === "CV" ? 94 : 88);
  } else if (observation?.densityPerSqMeter !== undefined) {
    densityPerSqMeter = observation.densityPerSqMeter;
    peopleCount = Math.round(densityPerSqMeter * areaSqMeters);
    occupancyPercent = Math.min(100, Math.max(0, Math.round((peopleCount / capacity) * 100)));
    confidencePercent = observation.confidencePercent ?? (source === "CV" ? 92 : 88);
  } else {
    // Fallback using pressure percent from simulation state
    occupancyPercent = Math.min(100, Math.max(0, Math.round(fallbackPressurePercent)));
    peopleCount = Math.round((occupancyPercent / 100) * capacity);
    densityPerSqMeter = Number((peopleCount / areaSqMeters).toFixed(2));
    confidencePercent = previousState?.confidencePercent ?? 88;
  }

  const crowdLevel = deriveCrowdLevel(occupancyPercent, densityPerSqMeter);
  const trend = deriveCrowdTrend(occupancyPercent, previousState);

  // Preserve anonymous track IDs (e.g. ByteTrack outputs) if present
  let anonymousTrackIds = observation?.trackIds ?? previousState?.anonymousTrackIds;
  if (!anonymousTrackIds && source === "CV") {
    // Generate representative anonymous track IDs for CV inputs
    const trackCount = Math.min(6, Math.max(2, Math.floor(peopleCount / 40)));
    anonymousTrackIds = Array.from({ length: trackCount }, (_, i) => `trk_${meta.zoneId}_${101 + i}`);
  }

  const timestampMs = observation?.timestamp ?? Date.now();
  const lastUpdated = formatFreshness(timestampMs);

  return {
    zoneId: meta.zoneId,
    peopleCount,
    occupancyPercent,
    densityPerSqMeter,
    crowdLevel,
    trend,
    confidencePercent,
    lastUpdated,
    source,
    anonymousTrackIds,
  };
}

/**
 * Computes live crowd states for all zones given metadata, observations, and previous states.
 */
export function computeAllZoneCrowdStates(
  zonesMeta: ZoneMetadata[],
  observationsMap: Map<string, RawCrowdObservation>,
  previousStatesMap: Record<string, ZoneCrowdState> = {},
  fallbackSnapshots: { zoneId: string; crowdPressure: number }[] = []
): Record<string, ZoneCrowdState> {
  const result: Record<string, ZoneCrowdState> = {};

  zonesMeta.forEach((meta) => {
    const observation = observationsMap.get(meta.zoneId);
    const prevState = previousStatesMap[meta.zoneId];
    const fallbackSnap = fallbackSnapshots.find((s) => s.zoneId === meta.zoneId);
    const fallbackPressure = fallbackSnap?.crowdPressure ?? 40;

    result[meta.zoneId] = computeZoneCrowdState(meta, observation, prevState, fallbackPressure);
  });

  return result;
}
