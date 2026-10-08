import type {
  CrowdLevel,
  EventAwareRouteCandidate,
  ItineraryPreferences,
  ItineraryStop,
  MultiStopOptimizerResult,
  ZoneCrowdState,
  ZonePredictionState,
} from "@/types";
import { mahaKumbhLandmarks, type EventLandmark } from "@/data/landmarks";
import { calculateEventAwareRoutes } from "./eventRoutingEngine";

function getWaitTimeForCrowdLevel(level: CrowdLevel): number {
  switch (level) {
    case "CRITICAL":
      return 35;
    case "HIGH":
      return 20;
    case "MODERATE":
      return 10;
    case "LOW":
    default:
      return 5;
  }
}

function getCrowdComfortScore(level: CrowdLevel): number {
  switch (level) {
    case "LOW":
      return 30;
    case "MODERATE":
      return 10;
    case "HIGH":
      return -30;
    case "CRITICAL":
      return -80;
    default:
      return 0;
  }
}

function formatTimeOffset(startMinutes: number): string {
  const baseHour = 9; // Default 09:00 AM start
  const totalMinutes = baseHour * 60 + startMinutes;
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const displayHour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${displayHour.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${period}`;
}

function permute<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [[]];
  const results: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const innerPerms = permute(rest);
    for (const perm of innerPerms) {
      results.push([arr[i], ...perm]);
    }
  }
  return results;
}

export function optimizeMultiStopItinerary(
  startZoneId: string,
  availableTimeMinutes: number,
  selectedLandmarkIds: string[],
  preferences: ItineraryPreferences,
  liveCrowdStates: Record<string, ZoneCrowdState>,
  predictions: Record<string, ZonePredictionState>,
  activeIncidentZoneIds: string[] = []
): MultiStopOptimizerResult {
  const landmarks = selectedLandmarkIds
    .map((id) => mahaKumbhLandmarks.find((l) => l.id === id))
    .filter((l): l is EventLandmark => Boolean(l));

  if (landmarks.length === 0) {
    return {
      stops: [],
      totalDurationMinutes: 0,
      totalTravelMinutes: 0,
      totalWaitMinutes: 0,
      fittedCount: 0,
      totalRequestedCount: 0,
      overallScore: 0,
      explanation: "No destinations selected.",
      generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }

  // Generate all ordering permutations of the selected landmarks
  const permutations = permute(landmarks);

  let bestScore = -Infinity;
  let bestStops: ItineraryStop[] = [];
  let bestTravelMins = 0;
  let bestWaitMins = 0;
  let bestTotalDuration = 0;

  const crowdWeight = preferences.avoidCrowds ? 2.0 : 1.0;
  const walkWeight = preferences.minimizeWalking ? 2.0 : 1.0;
  const attractionBonus = preferences.maximizeAttractions ? 25 : 10;

  for (const perm of permutations) {
    let currentZone = startZoneId;
    let accumulatedMinutes = 0;
    let sequenceScore = 0;
    let totalTravelMins = 0;
    let totalWaitMins = 0;
    const evaluatedStops: ItineraryStop[] = [];
    const validPerm: EventLandmark[] = [];

    for (let i = 0; i < perm.length; i++) {
      const landmark = perm[i];
      // 1. Calculate leg routing using existing Phase 5 eventRoutingEngine
      const routingResult = calculateEventAwareRoutes(
        currentZone,
        landmark.zoneId,
        liveCrowdStates,
        predictions,
        activeIncidentZoneIds
      );
      const leg: EventAwareRouteCandidate = routingResult.recommendedRoute;
      const travelMins = leg.effectiveEtaMinutes;

      // 2. Query zone crowd state & prediction for landmark
      const zoneState = liveCrowdStates[landmark.zoneId];
      const zonePred = predictions[landmark.zoneId];
      const crowdLevel: CrowdLevel = zoneState?.crowdLevel ?? "LOW";
      const predictedRisk: CrowdLevel = zonePred?.predictedCrowdLevel ?? crowdLevel;
      const waitMins = getWaitTimeForCrowdLevel(crowdLevel);
      const dwellMins = landmark.estimatedDwellMinutes;

      const legTotalMins = travelMins + waitMins + dwellMins;

      // Time constraint check
      if (accumulatedMinutes + legTotalMins > availableTimeMinutes) {
        // Can't fit remaining landmarks in available budget
        break;
      }

      const arrivalTimeStr = formatTimeOffset(accumulatedMinutes + travelMins);
      accumulatedMinutes += legTotalMins;
      const departureTimeStr = formatTimeOffset(accumulatedMinutes);

      totalTravelMins += travelMins;
      totalWaitMins += waitMins;
      validPerm.push(landmark);

      // Score calculation
      const priorityVal = landmark.priorityScore;
      const crowdComfort = getCrowdComfortScore(crowdLevel) * crowdWeight;
      const predPenalty = predictedRisk === "CRITICAL" ? -50 * crowdWeight : 0;
      const travelPenalty = travelMins * 2 * walkWeight;
      const waitPenalty = waitMins * 1.5 * crowdWeight;

      const stopScore = priorityVal + crowdComfort + predPenalty - travelPenalty - waitPenalty + attractionBonus;
      sequenceScore += stopScore;

      evaluatedStops.push({
        stepNumber: evaluatedStops.length + 1,
        landmarkId: landmark.id,
        name: landmark.name,
        zoneId: landmark.zoneId,
        coordinates: landmark.coordinates,
        estimatedArrival: arrivalTimeStr,
        estimatedDeparture: departureTimeStr,
        dwellMinutes: dwellMins,
        expectedWaitMinutes: waitMins,
        crowdLevel,
        predictedRisk,
        legFromPrevious: leg,
        completed: false,
      });

      currentZone = landmark.zoneId;
    }

    if (sequenceScore > bestScore || bestStops.length === 0) {
      bestScore = sequenceScore;
      bestStops = evaluatedStops;
      bestTravelMins = totalTravelMins;
      bestWaitMins = totalWaitMins;
      bestTotalDuration = accumulatedMinutes;
    }
  }

  const fittedCount = bestStops.length;
  const totalRequestedCount = landmarks.length;

  // Generate human-readable explanation
  let explanation = "";
  if (fittedCount < totalRequestedCount) {
    explanation = `${fittedCount} of ${totalRequestedCount} destinations fit within your ${availableTimeMinutes} min budget. `;
  } else {
    explanation = `All ${fittedCount} destinations fit within your ${availableTimeMinutes} min budget. `;
  }

  if (bestStops.length > 0) {
    const firstStop = bestStops[0];
    const lastStop = bestStops[bestStops.length - 1];
    explanation += `Sequence prioritizes ${firstStop.name} (${firstStop.crowdLevel} crowd) first, saving high-traffic stops like ${lastStop.name} for optimal flow windows.`;
  }

  return {
    stops: bestStops,
    totalDurationMinutes: bestTotalDuration,
    totalTravelMinutes: bestTravelMins,
    totalWaitMinutes: bestWaitMins,
    fittedCount,
    totalRequestedCount,
    overallScore: Math.round(bestScore),
    explanation,
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}
