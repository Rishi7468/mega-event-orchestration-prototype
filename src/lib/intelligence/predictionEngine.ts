import type {
  CrowdPredictionForecast,
  ZoneCrowdState,
  ZoneFlowState,
  ZonePredictionState,
} from "@/types/dataPipeline";
import { deriveCrowdLevel } from "@/lib/intelligence/crowdStateEngine";
import { zones as defaultZones } from "@/data/zones";

export type ZoneCapacityMap = Record<string, number>;

const DEFAULT_ZONE_CAPACITIES: ZoneCapacityMap = {
  central: 50000,
  north: 40000,
  east: 35000,
  south: 30000,
};

/**
 * Computes deterministic predictive intelligence for a single zone.
 */
export function computeZonePrediction(
  zoneId: string,
  currentState?: ZoneCrowdState,
  flowState?: ZoneFlowState,
  zoneCapacity?: number,
  whatIfReductionPercent: number = 30
): ZonePredictionState {
  const capacity = zoneCapacity ?? DEFAULT_ZONE_CAPACITIES[zoneId] ?? 40000;

  // Fallback defaults if states are missing
  const currentPeopleCount = currentState?.peopleCount ?? Math.round(capacity * 0.45);
  const currentOccupancyPercent = currentState?.occupancyPercent ?? Math.round((currentPeopleCount / capacity) * 100);
  const currentCrowdLevel = currentState?.crowdLevel ?? deriveCrowdLevel(currentOccupancyPercent);

  const incomingFlowPerMin = flowState?.incomingFlowPerMin ?? 320;
  const outgoingFlowPerMin = flowState?.outgoingFlowPerMin ?? 180;
  const netAccumulationPerMin = incomingFlowPerMin - outgoingFlowPerMin;
  const flowTrend = flowState?.flowTrend ?? (netAccumulationPerMin > 30 ? "INCREASING" : netAccumulationPerMin < -30 ? "DECREASING" : "STABLE");

  // Thresholds (Phase 1 alignment)
  const highThresholdPeople = Math.round(capacity * 0.75); // 75%
  const criticalThresholdPeople = Math.round(capacity * 0.88); // 88%

  // Time-To-Threshold Calculation (Minutes)
  let timeToHighMinutes: number | null = null;
  let timeToCriticalMinutes: number | null = null;

  if (netAccumulationPerMin > 0) {
    if (currentPeopleCount < highThresholdPeople) {
      const mins = (highThresholdPeople - currentPeopleCount) / netAccumulationPerMin;
      timeToHighMinutes = mins <= 30 ? Math.max(0.5, Math.round(mins * 10) / 10) : null;
    } else {
      timeToHighMinutes = 0;
    }

    if (currentPeopleCount < criticalThresholdPeople) {
      const mins = (criticalThresholdPeople - currentPeopleCount) / netAccumulationPerMin;
      timeToCriticalMinutes = mins <= 30 ? Math.max(0.5, Math.round(mins * 10) / 10) : null;
    } else {
      timeToCriticalMinutes = 0;
    }
  } else {
    // Net accumulation <= 0 means crowd is decreasing or stable
    timeToHighMinutes = currentPeopleCount >= highThresholdPeople ? 0 : null;
    timeToCriticalMinutes = currentPeopleCount >= criticalThresholdPeople ? 0 : null;
  }

  // 15-Minute Forecast Horizon
  const horizonMinutes = 15;
  const projectedPeopleCount = Math.min(
    capacity,
    Math.max(0, currentPeopleCount + netAccumulationPerMin * horizonMinutes)
  );
  const predictedOccupancyPercent = Math.min(
    100,
    Math.max(0, Math.round((projectedPeopleCount / capacity) * 100))
  );
  const predictedCrowdLevel = deriveCrowdLevel(predictedOccupancyPercent);

  // Prediction Confidence Calculation
  const sourceBase = currentState?.source === "CV" ? 92 : 84;
  const stateConfidence = currentState?.confidencePercent ?? 88;
  const stabilityBonus = flowTrend === "STABLE" ? 4 : 2;
  const predictionConfidence = Math.min(
    98,
    Math.max(60, Math.round(sourceBase * 0.4 + stateConfidence * 0.5 + stabilityBonus))
  );

  // Explainable Operator Recommendation
  const zoneName = defaultZones.find((z) => z.id === zoneId)?.name ?? zoneId.toUpperCase();
  let recommendationActionNeeded = false;
  let recommendationText = "No intervention currently required. Flow is within safe limits.";
  let recommendationUrgency: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
  let explainability = `Incoming flow (${incomingFlowPerMin}/m) is balanced by egress (${outgoingFlowPerMin}/m).`;

  if (predictedCrowdLevel === "CRITICAL" || (timeToCriticalMinutes !== null && timeToCriticalMinutes <= 12)) {
    recommendationActionNeeded = true;
    recommendationUrgency = "CRITICAL";
    recommendationText = `Consider redirecting incoming visitors away from ${zoneName}. Projected to reach CRITICAL density in ~${timeToCriticalMinutes ?? 5} min.`;
    explainability = `Net influx (+${netAccumulationPerMin}/m) exceeds egress. Remaining capacity to CRITICAL threshold (${criticalThresholdPeople - currentPeopleCount} people) will be exhausted in ~${timeToCriticalMinutes ?? 5}m.`;
  } else if (predictedCrowdLevel === "HIGH" || (timeToHighMinutes !== null && timeToHighMinutes <= 12)) {
    recommendationActionNeeded = true;
    recommendationUrgency = "HIGH";
    recommendationText = `Monitor ingress corridors into ${zoneName}. Elevated density expected in ~${timeToHighMinutes ?? 8} min.`;
    explainability = `Net accumulation rate of +${netAccumulationPerMin}/m is driving zone occupancy toward 75% capacity threshold.`;
  } else if (netAccumulationPerMin < -40) {
    recommendationUrgency = "LOW";
    recommendationText = `Congestion in ${zoneName} is easing naturally (-${Math.abs(netAccumulationPerMin)}/m). No intervention required.`;
    explainability = `Egress flow (${outgoingFlowPerMin}/m) exceeds incoming traffic (${incomingFlowPerMin}/m).`;
  }

  // What-If Intervention Simulation (e.g., 30% influx reduction)
  const mitigatedIncoming = Math.round(incomingFlowPerMin * (1 - whatIfReductionPercent / 100));
  const mitigatedNet = mitigatedIncoming - outgoingFlowPerMin;

  let mitigatedTimeToCriticalMinutes: number | null = null;
  if (mitigatedNet > 0 && currentPeopleCount < criticalThresholdPeople) {
    const mins = (criticalThresholdPeople - currentPeopleCount) / mitigatedNet;
    mitigatedTimeToCriticalMinutes = mins <= 60 ? Math.max(1, Math.round(mins * 10) / 10) : null;
  }

  const mitigatedProjectedPeople = Math.min(
    capacity,
    Math.max(0, currentPeopleCount + mitigatedNet * horizonMinutes)
  );
  const mitigatedPredictedPercent = Math.round((mitigatedProjectedPeople / capacity) * 100);
  const mitigatedPredictedLevel = deriveCrowdLevel(mitigatedPredictedPercent);

  const whatIfExplanation = mitigatedNet <= 0
    ? `Applying a ${whatIfReductionPercent}% influx reduction halts congestion completely (net flow turns negative: ${mitigatedNet}/m).`
    : `A ${whatIfReductionPercent}% influx reduction decreases net accumulation from +${netAccumulationPerMin}/m to +${mitigatedNet}/m, extending time-to-critical from ~${timeToCriticalMinutes ?? "N/A"}m to ~${mitigatedTimeToCriticalMinutes ?? "30+"}m.`;

  const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return {
    zoneId,
    currentPeopleCount,
    capacity,
    currentOccupancyPercent,
    currentCrowdLevel,
    incomingFlowPerMin,
    outgoingFlowPerMin,
    netAccumulationPerMin,
    flowTrend,
    predictedOccupancyPercent,
    predictedCrowdLevel,
    timeToHighMinutes,
    timeToCriticalMinutes,
    predictionConfidence,
    lastUpdated: timestampStr,
    recommendation: {
      actionNeeded: recommendationActionNeeded,
      text: recommendationText,
      urgency: recommendationUrgency,
      explainability,
    },
    whatIfIntervention: {
      incomingFlowReductionPercent: whatIfReductionPercent,
      mitigatedTimeToCriticalMinutes,
      mitigatedPredictedLevel,
      explanation: whatIfExplanation,
    },
  };
}

/**
 * Computes deterministic crowd predictions across all active system zones.
 */
export function computeAllZonePredictions(
  liveCrowdStates: Record<string, ZoneCrowdState>,
  flowStates: Record<string, ZoneFlowState>,
  capacities: ZoneCapacityMap = DEFAULT_ZONE_CAPACITIES,
  whatIfReductionPercent: number = 30
): CrowdPredictionForecast {
  const zoneIds = Array.from(
    new Set([...Object.keys(liveCrowdStates), ...Object.keys(flowStates), "central", "north", "east", "south"])
  );

  const zonePredictions: Record<string, ZonePredictionState> = {};

  zoneIds.forEach((zoneId) => {
    zonePredictions[zoneId] = computeZonePrediction(
      zoneId,
      liveCrowdStates[zoneId],
      flowStates[zoneId],
      capacities[zoneId],
      whatIfReductionPercent
    );
  });

  return {
    horizonMinutes: 15,
    zonePredictions,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}
