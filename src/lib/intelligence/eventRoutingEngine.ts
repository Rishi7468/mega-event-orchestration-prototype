import type {
  ZoneCrowdState,
  ZonePredictionState,
  EventAwareRouteCandidate,
  EventAwareRoutingResult,
  CrowdLevel,
  EdgeCrowdState,
} from "@/types/dataPipeline";
import type { LatLng } from "@/data/geography";
import {
  MAHA_KUMBH_EDGES,
  CONFIGURABLE_WALKING_SPEED_M_PER_MIN,
} from "@/lib/graph/pedestrianGraph";
import { deriveEdgeCrowdStateFromZones } from "@/lib/cv/cameraEdgeRegistry";

// ==========================================
// CONFIGURABLE ROUTE COST WEIGHTS
// ==========================================

export const ROUTE_WEIGHTS = {
  WALKING_SPEED_METERS_PER_MIN: CONFIGURABLE_WALKING_SPEED_M_PER_MIN, // ~4.2 km/h
  CROWD_PENALTY: {
    LOW: 0,
    MODERATE: 3,
    HIGH: 14,
    CRITICAL: 35,
  } as Record<CrowdLevel, number>,
  PREDICTED_CRITICAL_PENALTY: 25,
  PREDICTED_HIGH_PENALTY: 10,
  INCIDENT_PENALTY: 50,
};

// ==========================================
// PEDESTRIAN GRAPH ROUTE CANDIDATE DEFINITIONS
// ==========================================

type GraphCandidateDefinition = {
  id: string;
  name: string;
  originZoneId: string;
  destinationZoneId: string;
  edgeIds: string[];
  zonePath: string[];
};

const CANONICAL_GRAPH_CANDIDATES: GraphCandidateDefinition[] = [
  {
    id: "route-central-direct",
    name: "Central Zone Direct Corridor",
    originZoneId: "south",
    destinationZoneId: "central",
    edgeIds: ["edge-south-gate-a", "edge-gate-a-sangam"],
    zonePath: ["south", "central"],
  },
  {
    id: "route-east-bypass",
    name: "East Sector Bypass Corridor",
    originZoneId: "south",
    destinationZoneId: "central",
    edgeIds: ["edge-south-east", "edge-east-sangam"],
    zonePath: ["south", "east"],
  },
  {
    id: "route-north-ring",
    name: "North Ring Approach Corridor",
    originZoneId: "south",
    destinationZoneId: "central",
    edgeIds: ["edge-south-north", "edge-north-gate-b", "edge-gate-b-sangam"],
    zonePath: ["south", "north"],
  },
];

const NORTH_ORIGIN_GRAPH_CANDIDATES: GraphCandidateDefinition[] = [
  {
    id: "route-north-direct",
    name: "North Zone Gate B Direct",
    originZoneId: "north",
    destinationZoneId: "central",
    edgeIds: ["edge-north-gate-b", "edge-gate-b-sangam"],
    zonePath: ["north"],
  },
  {
    id: "route-north-east-bypass",
    name: "North-East Outer Perimeter Bypass",
    originZoneId: "north",
    destinationZoneId: "central",
    edgeIds: ["edge-north-east", "edge-east-sangam"],
    zonePath: ["north", "east"],
  },
];

/**
 * Calculates event-aware candidate routes over the local pedestrian graph
 * using edge-level crowd telemetry, Haversine physical geometry distances, and predictions.
 */
export function calculateEventAwareRoutes(
  originZoneId: string = "south",
  destinationZoneId: string = "central",
  liveCrowdStates: Record<string, ZoneCrowdState> = {},
  predictions: Record<string, ZonePredictionState> = {},
  activeIncidentsZoneIds: string[] = [],
  edgeCrowdStates: Record<string, EdgeCrowdState> = {}
): EventAwareRoutingResult {
  const pool =
    originZoneId === "north" ? NORTH_ORIGIN_GRAPH_CANDIDATES : CANONICAL_GRAPH_CANDIDATES;

  const scoredCandidates: EventAwareRouteCandidate[] = pool.map((candDef) => {
    // Resolve graph edges for this candidate path
    const edges = candDef.edgeIds
      .map((eId) => MAHA_KUMBH_EDGES.find((e) => e.id === eId))
      .filter((e): e is NonNullable<typeof e> => e !== undefined);

    // Concatenate edge waypoints
    const waypoints: LatLng[] = edges.flatMap((e) => e.geometry);

    // Calculate real Haversine physical distance from waypoints
    const distanceMeters = edges.reduce(
      (sum, e) => sum + e.distanceMeters,
      0
    );

    const baseEtaMinutes = Math.max(
      1,
      edges.reduce((sum, e) => sum + e.baseTravelTimeMinutes, 0)
    );
    const travelTimeCost = baseEtaMinutes;

    let currentCrowdPenalty = 0;
    let predictedCongestionPenalty = 0;
    let incidentPenalty = 0;

    let highestCurrentLevel: CrowdLevel = "LOW";
    let highestPredictedLevel: CrowdLevel = "LOW";

    // Evaluate edge-level crowd state (with fallback to zone state)
    edges.forEach((edge) => {
      const edgeState =
        edgeCrowdStates[edge.id] ??
        deriveEdgeCrowdStateFromZones(edge, liveCrowdStates, predictions, activeIncidentsZoneIds);

      const currentLevel: CrowdLevel = edgeState.crowdLevel;
      const currentPenalty = ROUTE_WEIGHTS.CROWD_PENALTY[currentLevel] ?? 0;
      currentCrowdPenalty += currentPenalty;

      if (getCrowdLevelOrder(currentLevel) > getCrowdLevelOrder(highestCurrentLevel)) {
        highestCurrentLevel = currentLevel;
      }

      const predLevel = edgeState.predictedCrowdLevel;
      if (getCrowdLevelOrder(predLevel) > getCrowdLevelOrder(highestPredictedLevel)) {
        highestPredictedLevel = predLevel;
      }

      if (predLevel === "CRITICAL") {
        predictedCongestionPenalty += ROUTE_WEIGHTS.PREDICTED_CRITICAL_PENALTY;
      } else if (predLevel === "HIGH") {
        predictedCongestionPenalty += ROUTE_WEIGHTS.PREDICTED_HIGH_PENALTY;
      }

      if (edgeState.hasIncident) {
        incidentPenalty += ROUTE_WEIGHTS.INCIDENT_PENALTY;
      }
    });

    const totalRouteCost =
      travelTimeCost +
      currentCrowdPenalty +
      predictedCongestionPenalty +
      incidentPenalty;

    const effectiveEtaMinutes =
      baseEtaMinutes +
      Math.round((currentCrowdPenalty + predictedCongestionPenalty) / 4);

    return {
      id: candDef.id,
      name: candDef.name,
      originZoneId: candDef.originZoneId,
      destinationZoneId: candDef.destinationZoneId,
      waypoints,
      zonePath: candDef.zonePath,
      distanceMeters,
      baseEtaMinutes,
      effectiveEtaMinutes,
      travelTimeCost,
      currentCrowdPenalty,
      predictedCongestionPenalty,
      incidentPenalty,
      totalRouteCost,
      dominantCrowdLevel: highestCurrentLevel,
      predictedRiskLevel: highestPredictedLevel,
      status: "alternative",
      explanation: "",
    };
  });

  // Sort candidates by totalRouteCost ascending
  scoredCandidates.sort((a, b) => a.totalRouteCost - b.totalRouteCost);

  // Shortest physical route candidate
  const shortestRaw = scoredCandidates.reduce((prev, curr) =>
    curr.distanceMeters < prev.distanceMeters ? curr : prev
  );

  const best = scoredCandidates[0];
  best.status = "recommended";

  // Build human-readable explainability
  scoredCandidates.forEach((cand) => {
    if (cand.id === best.id) {
      if (best.id === shortestRaw.id) {
        cand.explanation = `Recommended as the fastest direct route (${best.effectiveEtaMinutes} min, ${best.distanceMeters}m) with low corridor crowd density.`;
      } else {
        const timeDiff = cand.effectiveEtaMinutes - shortestRaw.effectiveEtaMinutes;
        const distDiff = cand.distanceMeters - shortestRaw.distanceMeters;
        cand.explanation = `Recommended route: ~${Math.max(1, Math.abs(timeDiff))} min longer (+${distDiff}m), but avoids ${shortestRaw.dominantCrowdLevel} crowd congestion on ${shortestRaw.name}.`;
      }
    } else {
      const costDiff = cand.totalRouteCost - best.totalRouteCost;
      cand.status = cand.dominantCrowdLevel === "CRITICAL" ? "congested" : "alternative";
      cand.explanation = `Alternative path (${cand.effectiveEtaMinutes} min, ${cand.distanceMeters}m). Corridor risk: ${cand.dominantCrowdLevel}, Predicted: ${cand.predictedRiskLevel} (+${costDiff} cost index).`;
    }
  });

  return {
    originZoneId,
    destinationZoneId,
    recommendedRoute: best,
    candidates: scoredCandidates,
    lastUpdated: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

function getCrowdLevelOrder(level: CrowdLevel): number {
  switch (level) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "MODERATE":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
}
