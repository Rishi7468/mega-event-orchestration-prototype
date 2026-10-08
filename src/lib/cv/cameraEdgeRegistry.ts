import type { CrowdLevel, ZoneCrowdState, ZonePredictionState } from "@/types/dataPipeline";
import type { EdgeCrowdState, PedestrianEdge } from "@/lib/graph/pedestrianGraph";

export type CameraEdgeAssociation = {
  cameraId: string;
  cameraName: string;
  primaryZoneId: string;
  associatedEdgeIds: string[];
};

export const CAMERA_EDGE_REGISTRY: Record<string, CameraEdgeAssociation> = {
  "cam-07": {
    cameraId: "cam-07",
    cameraName: "CAM-07 (Gate A Main Corridor)",
    primaryZoneId: "central",
    associatedEdgeIds: ["edge-south-gate-a", "edge-gate-a-sangam", "edge-gate-b-sangam"],
  },
  "cam-03": {
    cameraId: "cam-03",
    cameraName: "CAM-03 (North Hub & Gate B)",
    primaryZoneId: "north",
    associatedEdgeIds: ["edge-north-gate-b", "edge-north-east"],
  },
  "cam-12": {
    cameraId: "cam-12",
    cameraName: "CAM-12 (East Sector Approach)",
    primaryZoneId: "east",
    associatedEdgeIds: ["edge-east-sangam"],
  },
  "cam-04": {
    cameraId: "cam-04",
    cameraName: "CAM-04 (South Connector Hub)",
    primaryZoneId: "south",
    associatedEdgeIds: ["edge-south-east", "edge-south-north"],
  },
};

/**
 * Maps raw camera vision perception telemetry (person count, tracks, confidence)
 * to edge crowd state updates for all associated graph edges.
 */
export function mapCameraTelemetryToEdges(
  cameraId: string,
  personCount: number,
  confidencePercent: number,
  trackIds: string[],
  source: "REAL_VIDEO" | "SIMULATED" = "REAL_VIDEO"
): Record<string, EdgeCrowdState> {
  const assoc = CAMERA_EDGE_REGISTRY[cameraId];
  if (!assoc) return {};

  const safePersonCount = Math.max(0, isNaN(personCount) ? 0 : Math.round(personCount));

  // Compute crowd metrics for the corridor
  const scaledPeopleCount = safePersonCount * 1200 + 8000;
  const occupancyPercent = Math.min(100, Math.max(0, Math.round((scaledPeopleCount / 35000) * 100)));

  let crowdLevel: CrowdLevel = "LOW";
  if (occupancyPercent >= 85 || safePersonCount >= 18) crowdLevel = "CRITICAL";
  else if (occupancyPercent >= 70 || safePersonCount >= 12) crowdLevel = "HIGH";
  else if (occupancyPercent >= 45 || safePersonCount >= 6) crowdLevel = "MODERATE";

  const result: Record<string, EdgeCrowdState> = {};
  const timestamp = Date.now();

  assoc.associatedEdgeIds.forEach((edgeId) => {
    result[edgeId] = {
      edgeId,
      peopleCount: scaledPeopleCount,
      occupancyPercent,
      crowdLevel,
      inflowPerMinute: safePersonCount * 45,
      outflowPerMinute: Math.round(safePersonCount * 38),
      predictedCrowdLevel: crowdLevel === "CRITICAL" ? "CRITICAL" : crowdLevel === "HIGH" ? "HIGH" : "MODERATE",
      hasIncident: false,
      source,
      lastUpdated: timestamp,
    };
  });

  return result;
}

/**
 * Gracefully derives edge crowd state from underlying zone-level crowd intelligence
 * when explicit camera feed observations are unavailable.
 */
export function deriveEdgeCrowdStateFromZones(
  edge: PedestrianEdge,
  liveCrowdStates: Record<string, ZoneCrowdState> = {},
  predictions: Record<string, ZonePredictionState> = {},
  activeIncidentsZoneIds: string[] = []
): EdgeCrowdState {
  const primaryZoneId = edge.zoneIds[0] ?? "central";
  const live = liveCrowdStates[primaryZoneId];
  const pred = predictions[primaryZoneId];

  const crowdLevel: CrowdLevel = live?.crowdLevel ?? "LOW";
  const predictedCrowdLevel: CrowdLevel = pred?.predictedCrowdLevel ?? "LOW";
  const hasIncident = edge.zoneIds.some((zId) => activeIncidentsZoneIds.includes(zId));

  return {
    edgeId: edge.id,
    peopleCount: live?.peopleCount ?? 15000,
    occupancyPercent: live?.occupancyPercent ?? 50,
    crowdLevel,
    inflowPerMinute: 250,
    outflowPerMinute: 220,
    predictedCrowdLevel,
    hasIncident,
    source: live?.source === "CV" ? "REAL_VIDEO" : "SIMULATED",
    lastUpdated: Date.now(),
  };
}
