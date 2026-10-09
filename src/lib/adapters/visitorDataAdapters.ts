import { getDestinationGeography, primaryGeography, type DestinationGeography, type LatLng } from "@/data/geography";
import { mahaKumbhLandmarks, type EventLandmark } from "@/data/landmarks";
import { MAHA_KUMBH_NODES, canonicalPedestrianGraph, type PedestrianNode, type PedestrianGraph } from "@/lib/graph/pedestrianGraph";
import { calculateEventAwareRoutes } from "@/lib/intelligence/eventRoutingEngine";
import { computeZonePrediction } from "@/lib/intelligence/predictionEngine";
import { useSimulationStore } from "@/store/simulationStore";
import type { EventAwareRoutingResult, ZoneCrowdState, ZonePredictionState } from "@/types";

/**
 * Single Source of Truth Adapter Layer for Visitor-Facing Intelligence.
 *
 * Connects operational stores (simulationStore, video perception, predictions)
 * to visitor UI screens and maps, ensuring data consistency and clear fallback handling.
 */

/**
 * Returns the canonical event pedestrian navigation graph.
 */
export function getCanonicalPedestrianGraph(): PedestrianGraph {
  return canonicalPedestrianGraph;
}

/**
 * Resolves geography for the given destination ID, falling back to canonical primary event geography.
 */
export function getVisitorEventGeography(destinationId?: string | null): DestinationGeography {
  return getDestinationGeography(destinationId) ?? primaryGeography;
}

/**
 * Maps landmark ID to its canonical pedestrian graph node and coordinates.
 */
export function getLandmarkGraphNode(landmarkId: string): { landmark?: EventLandmark; node?: PedestrianNode; coordinates: LatLng } {
  const landmark = mahaKumbhLandmarks.find((l) => l.id === landmarkId);
  const node = MAHA_KUMBH_NODES.find(
    (n) => n.id === `node-${landmarkId}` || n.name.toLowerCase().includes(landmark?.name.toLowerCase() ?? "")
  );

  const coordinates: LatLng = landmark ? landmark.coordinates : node ? node.coordinates : primaryGeography.venue.position;

  return { landmark, node, coordinates };
}

/**
 * Computes event-aware graph routing for a visitor moving between origin and destination.
 */
export function getVisitorRoute(
  originZoneId: string = "south",
  destinationZoneId: string = "central"
): EventAwareRoutingResult {
  const { liveCrowdStates, predictions, edgeCrowdStates, incidents } = useSimulationStore.getState();
  const activeIncidentZoneIds = (incidents ?? []).map((inc) => inc.zoneId);

  return calculateEventAwareRoutes(
    originZoneId,
    destinationZoneId,
    liveCrowdStates,
    predictions,
    activeIncidentZoneIds,
    edgeCrowdStates
  );
}

/**
 * Summarizes crowd state and 15-minute predictive forecast for a given zone.
 */
export function getVisitorZoneCrowdSummary(zoneId: string): {
  currentState: ZoneCrowdState | undefined;
  prediction: ZonePredictionState;
  crowdLabel: string;
} {
  const { liveCrowdStates, predictions } = useSimulationStore.getState();
  const currentState = liveCrowdStates[zoneId];
  const prediction = predictions[zoneId] ?? computeZonePrediction(zoneId, currentState);

  let crowdLabel = "Moderate Crowd";
  const level = currentState?.crowdLevel ?? prediction.currentCrowdLevel;

  switch (level) {
    case "CRITICAL":
      crowdLabel = "Critical Congestion";
      break;
    case "HIGH":
      crowdLabel = "Heavy Density";
      break;
    case "MODERATE":
      crowdLabel = "Moderate Flow";
      break;
    case "LOW":
    default:
      crowdLabel = "Light Flow";
      break;
  }

  return { currentState, prediction, crowdLabel };
}

/**
 * Reactive Hook: Subscribes to live simulationStore telemetry and calculates event-aware routing.
 */
export function useVisitorRoutingState(
  originZoneId: string = "south",
  destinationZoneId: string = "central"
): EventAwareRoutingResult {
  const liveCrowdStates = useSimulationStore((s) => s.liveCrowdStates);
  const predictions = useSimulationStore((s) => s.predictions);
  const edgeCrowdStates = useSimulationStore((s) => s.edgeCrowdStates);
  const incidents = useSimulationStore((s) => s.incidents);

  const activeIncidentZoneIds = (incidents ?? []).map((inc) => inc.zoneId);

  return calculateEventAwareRoutes(
    originZoneId,
    destinationZoneId,
    liveCrowdStates,
    predictions,
    activeIncidentZoneIds,
    edgeCrowdStates
  );
}

/**
 * Reactive Hook: Subscribes to zone crowd state changes for visitor UI.
 */
export function useVisitorZoneSummaryState(zoneId: string) {
  const currentState = useSimulationStore((s) => s.liveCrowdStates[zoneId]);
  const predictionStore = useSimulationStore((s) => s.predictions[zoneId]);

  const prediction = predictionStore ?? computeZonePrediction(zoneId, currentState);

  let crowdLabel = "Moderate Crowd";
  const level = currentState?.crowdLevel ?? prediction.currentCrowdLevel;

  switch (level) {
    case "CRITICAL":
      crowdLabel = "Critical Congestion";
      break;
    case "HIGH":
      crowdLabel = "Heavy Density";
      break;
    case "MODERATE":
      crowdLabel = "Moderate Flow";
      break;
    case "LOW":
    default:
      crowdLabel = "Light Flow";
      break;
  }

  return { currentState, prediction, crowdLabel };
}
