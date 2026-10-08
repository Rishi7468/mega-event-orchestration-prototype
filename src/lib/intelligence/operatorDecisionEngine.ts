import type {
  ZoneCrowdState,
  ZonePredictionState,
  CrowdFlowGraph,
  CrowdLevel,
} from "@/types/dataPipeline";
import type { Incident } from "@/types";
import {
  MAHA_KUMBH_EDGES,
  type EdgeCrowdState,
} from "@/lib/graph/pedestrianGraph";
import { deriveEdgeCrowdStateFromZones } from "@/lib/cv/cameraEdgeRegistry";

// ==========================================
// OPERATOR RECOMMENDATION DATA CONTRACT
// ==========================================

export type OperatorRecommendationSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type OperatorRecommendationType =
  | "approaching_critical_zone"
  | "dangerous_corridor"
  | "excessive_inflow"
  | "safer_alternative_available";

export type OperatorRecommendation = {
  id: string;
  type: OperatorRecommendationType;
  severity: OperatorRecommendationSeverity;
  title: string;
  affectedZoneId?: string;
  affectedEdgeId?: string;
  recommendedAlternativeEdgeId?: string;
  trigger: string;
  evidence: {
    zoneName?: string;
    corridorName?: string;
    occupancyPercent: number;
    predictedOccupancyPercent: number;
    netInflowPerMin: number;
    timeToCriticalMinutes: number | null;
    edgeCrowdLevel?: CrowdLevel;
    alternativeEdgeCrowdLevel?: CrowdLevel;
    alternativeEdgeName?: string;
    incomingFlowPerMin?: number;
    outgoingFlowPerMin?: number;
  };
  recommendedAction: string;
  whyExplanation: string;
  expectedImpact: {
    summary: string;
    currentNetInflow: number;
    mitigatedNetInflow: number;
    currentProjectedOccupancy: number;
    mitigatedProjectedOccupancy: number;
    whatIfReductionPercent: number;
    mitigatedTimeToCriticalMinutes: number | null;
  };
  confidencePercent: number;
  timestamp: string;
  source: "REAL_VIDEO" | "SIMULATED";
  acknowledged: boolean;
};

// Zone name helper
const ZONE_NAMES: Record<string, string> = {
  central: "Central Triveni Ghat Sector",
  north: "North Gate Approach Sector",
  east: "East Ring Egress Sector",
  south: "South Hub Arrival Sector",
};

/**
 * Deterministic Operator Decision Engine.
 * Evaluates live telemetry, prediction forecasts, edge states, and pedestrian graph topology
 * to generate prioritized, explainable operational recommendations.
 */
export function evaluateOperatorRecommendations(
  liveCrowdStates: Record<string, ZoneCrowdState> = {},
  edgeCrowdStates: Record<string, EdgeCrowdState> = {},
  predictions: Record<string, ZonePredictionState> = {},
  flowGraph?: CrowdFlowGraph,
  incidents: Incident[] = [],
  acknowledgedIds: string[] = [],
  whatIfReductionPercent: number = 30
): OperatorRecommendation[] {
  const recommendations: OperatorRecommendation[] = [];
  const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const activeIncidentZones = incidents
    .filter((i) => i.status !== "resolved")
    .map((i) => i.zoneId);

  // Evaluate all edges in the pedestrian graph
  const resolvedEdgeStates: Record<string, EdgeCrowdState> = {};
  MAHA_KUMBH_EDGES.forEach((edge) => {
    resolvedEdgeStates[edge.id] =
      edgeCrowdStates[edge.id] ??
      deriveEdgeCrowdStateFromZones(edge, liveCrowdStates, predictions, activeIncidentZones);
  });

  // ------------------------------------------------------------------
  // RULE 1: APPROACHING CRITICAL CROWD IN A ZONE
  // ------------------------------------------------------------------
  Object.keys(predictions).forEach((zoneId) => {
    const pred = predictions[zoneId];
    if (!pred) return;

    const zoneName = ZONE_NAMES[zoneId] ?? zoneId.toUpperCase();
    const isCritical =
      pred.predictedCrowdLevel === "CRITICAL" ||
      (pred.timeToCriticalMinutes !== null && pred.timeToCriticalMinutes <= 15);

    if (isCritical) {
      const recId = `rec_zone_crit_${zoneId}`;
      if (acknowledgedIds.includes(recId)) return;

      const source: "REAL_VIDEO" | "SIMULATED" =
        liveCrowdStates[zoneId]?.source === "CV" ? "REAL_VIDEO" : "SIMULATED";

      // Calculate What-If impact
      const mitigatedIncoming = Math.round(pred.incomingFlowPerMin * (1 - whatIfReductionPercent / 100));
      const mitigatedNet = mitigatedIncoming - pred.outgoingFlowPerMin;
      const mitigatedProjectedPeople = Math.max(
        0,
        pred.currentPeopleCount + mitigatedNet * 15
      );
      const mitigatedProjectedOccupancy = Math.min(
        100,
        Math.round((mitigatedProjectedPeople / pred.capacity) * 100)
      );

      recommendations.push({
        id: recId,
        type: "approaching_critical_zone",
        severity: "CRITICAL",
        title: `${zoneName} Approaching Critical Capacity`,
        affectedZoneId: zoneId,
        trigger: `Projected to reach CRITICAL capacity in ~${pred.timeToCriticalMinutes ?? 10} minutes`,
        evidence: {
          zoneName,
          occupancyPercent: pred.currentOccupancyPercent,
          predictedOccupancyPercent: pred.predictedOccupancyPercent,
          netInflowPerMin: pred.netAccumulationPerMin,
          timeToCriticalMinutes: pred.timeToCriticalMinutes,
          incomingFlowPerMin: pred.incomingFlowPerMin,
          outgoingFlowPerMin: pred.outgoingFlowPerMin,
        },
        recommendedAction: `Prepare crowd diversion stanchions at Gate A and initiate ingress metering into ${zoneName}.`,
        whyExplanation: `Net arrival flow (+${pred.netAccumulationPerMin}/m) exceeds egress rate (${pred.outgoingFlowPerMin}/m). Remaining buffer to critical threshold will exhaust in ~${pred.timeToCriticalMinutes ?? 10}m.`,
        expectedImpact: {
          summary: `Reducing incoming flow by ${whatIfReductionPercent}% drops projected 15m occupancy from ${pred.predictedOccupancyPercent}% down to ${mitigatedProjectedOccupancy}%.`,
          currentNetInflow: pred.netAccumulationPerMin,
          mitigatedNetInflow: mitigatedNet,
          currentProjectedOccupancy: pred.predictedOccupancyPercent,
          mitigatedProjectedOccupancy,
          whatIfReductionPercent,
          mitigatedTimeToCriticalMinutes: mitigatedNet <= 0 ? null : Math.round((pred.capacity * 0.88 - pred.currentPeopleCount) / mitigatedNet),
        },
        confidencePercent: pred.predictionConfidence,
        timestamp: timestampStr,
        source,
        acknowledged: false,
      });
    }
  });

  // ------------------------------------------------------------------
  // RULE 2: DANGEROUS HIGH/CRITICAL EDGE CORRIDOR
  // ------------------------------------------------------------------
  MAHA_KUMBH_EDGES.forEach((edge) => {
    const eState = resolvedEdgeStates[edge.id];
    if (!eState) return;

    if (eState.crowdLevel === "CRITICAL" || eState.crowdLevel === "HIGH") {
      const recId = `rec_edge_danger_${edge.id}`;
      if (acknowledgedIds.includes(recId)) return;

      // Find alternative edge in pedestrian graph that bypasses or connects same destination
      const altEdge = MAHA_KUMBH_EDGES.find(
        (e) =>
          e.id !== edge.id &&
          e.toNodeId === edge.toNodeId &&
          (resolvedEdgeStates[e.id]?.crowdLevel === "LOW" ||
            resolvedEdgeStates[e.id]?.crowdLevel === "MODERATE")
      ) ?? MAHA_KUMBH_EDGES.find((e) => e.id === "edge-east-sangam" && edge.id !== "edge-east-sangam");

      const altState = altEdge ? resolvedEdgeStates[altEdge.id] : undefined;
      const primaryZoneId = edge.zoneIds[0] ?? "central";
      const pred = predictions[primaryZoneId];

      const currentNetInflow = eState.inflowPerMinute - eState.outflowPerMinute;
      const mitigatedNetInflow = Math.round(currentNetInflow * (1 - whatIfReductionPercent / 100));

      recommendations.push({
        id: recId,
        type: "dangerous_corridor",
        severity: eState.crowdLevel === "CRITICAL" ? "CRITICAL" : "HIGH",
        title: `High Congestion along ${edge.name}`,
        affectedZoneId: primaryZoneId,
        affectedEdgeId: edge.id,
        recommendedAlternativeEdgeId: altEdge?.id,
        trigger: `Corridor density reached ${eState.crowdLevel} (${eState.occupancyPercent}% capacity)`,
        evidence: {
          corridorName: edge.name,
          occupancyPercent: eState.occupancyPercent,
          predictedOccupancyPercent: pred?.predictedOccupancyPercent ?? eState.occupancyPercent + 10,
          netInflowPerMin: currentNetInflow,
          timeToCriticalMinutes: eState.crowdLevel === "CRITICAL" ? 0 : 8,
          edgeCrowdLevel: eState.crowdLevel,
          alternativeEdgeCrowdLevel: altState?.crowdLevel ?? "LOW",
          alternativeEdgeName: altEdge?.name,
        },
        recommendedAction: altEdge
          ? `Redirect incoming visitors away from ${edge.name} and route via ${altEdge.name}.`
          : `Deploy physical stanchions to meter entry into ${edge.name}.`,
        whyExplanation: `${edge.name} is operating at ${eState.occupancyPercent}% occupancy. ${altEdge ? `${altEdge.name} currently has ${altState?.occupancyPercent ?? 30}% lower crowd density.` : "No direct bypass is unconstrained."}`,
        expectedImpact: {
          summary: `Diversion lowers corridor influx by ${whatIfReductionPercent}%, stabilizing pedestrian velocity along ${edge.name}.`,
          currentNetInflow,
          mitigatedNetInflow,
          currentProjectedOccupancy: eState.occupancyPercent + 12,
          mitigatedProjectedOccupancy: Math.max(20, eState.occupancyPercent - 15),
          whatIfReductionPercent,
          mitigatedTimeToCriticalMinutes: 25,
        },
        confidencePercent: eState.source === "REAL_VIDEO" ? 94 : 86,
        timestamp: timestampStr,
        source: eState.source,
        acknowledged: false,
      });
    }
  });

  // ------------------------------------------------------------------
  // RULE 3: EXCESSIVE NET INFLOW (INFLOW >> EGRESS)
  // ------------------------------------------------------------------
  Object.keys(predictions).forEach((zoneId) => {
    const pred = predictions[zoneId];
    if (!pred) return;

    if (
      pred.netAccumulationPerMin >= 220 &&
      pred.currentOccupancyPercent >= 65 &&
      pred.predictedCrowdLevel !== "CRITICAL"
    ) {
      const recId = `rec_inflow_excess_${zoneId}`;
      if (acknowledgedIds.includes(recId)) return;

      const zoneName = ZONE_NAMES[zoneId] ?? zoneId.toUpperCase();
      const source: "REAL_VIDEO" | "SIMULATED" =
        liveCrowdStates[zoneId]?.source === "CV" ? "REAL_VIDEO" : "SIMULATED";

      const mitigatedIncoming = Math.round(pred.incomingFlowPerMin * (1 - whatIfReductionPercent / 100));
      const mitigatedNet = mitigatedIncoming - pred.outgoingFlowPerMin;
      const mitigatedProjectedOccupancy = Math.min(
        100,
        Math.round(((pred.currentPeopleCount + mitigatedNet * 15) / pred.capacity) * 100)
      );

      recommendations.push({
        id: recId,
        type: "excessive_inflow",
        severity: "HIGH",
        title: `Excessive Net Inflow into ${zoneName}`,
        affectedZoneId: zoneId,
        trigger: `Incoming flow (+${pred.incomingFlowPerMin}/m) significantly exceeds egress (${pred.outgoingFlowPerMin}/m)`,
        evidence: {
          zoneName,
          occupancyPercent: pred.currentOccupancyPercent,
          predictedOccupancyPercent: pred.predictedOccupancyPercent,
          netInflowPerMin: pred.netAccumulationPerMin,
          timeToCriticalMinutes: pred.timeToCriticalMinutes,
          incomingFlowPerMin: pred.incomingFlowPerMin,
          outgoingFlowPerMin: pred.outgoingFlowPerMin,
        },
        recommendedAction: `Activate hold-and-release staging at outer transit hubs feeding ${zoneName}.`,
        whyExplanation: `Net accumulation rate (+${pred.netAccumulationPerMin} people/min) will elevate zone pressure from ${pred.currentOccupancyPercent}% to ${pred.predictedOccupancyPercent}% within 15 minutes.`,
        expectedImpact: {
          summary: `Throttling arrival flow by ${whatIfReductionPercent}% reduces net influx from +${pred.netAccumulationPerMin}/m to +${mitigatedNet}/m.`,
          currentNetInflow: pred.netAccumulationPerMin,
          mitigatedNetInflow: mitigatedNet,
          currentProjectedOccupancy: pred.predictedOccupancyPercent,
          mitigatedProjectedOccupancy,
          whatIfReductionPercent,
          mitigatedTimeToCriticalMinutes: 30,
        },
        confidencePercent: pred.predictionConfidence,
        timestamp: timestampStr,
        source,
        acknowledged: false,
      });
    }
  });

  // ------------------------------------------------------------------
  // RULE 4: SAFER ALTERNATIVE CORRIDOR AVAILABLE
  // ------------------------------------------------------------------
  const primaryEdge = MAHA_KUMBH_EDGES.find((e) => e.id === "edge-south-gate-a");
  const bypassEdge = MAHA_KUMBH_EDGES.find((e) => e.id === "edge-south-east");

  if (primaryEdge && bypassEdge) {
    const primaryState = resolvedEdgeStates[primaryEdge.id];
    const bypassState = resolvedEdgeStates[bypassEdge.id];

    if (
      primaryState &&
      bypassState &&
      (primaryState.crowdLevel === "HIGH" || primaryState.crowdLevel === "CRITICAL") &&
      (bypassState.crowdLevel === "LOW" || bypassState.crowdLevel === "MODERATE")
    ) {
      const recId = `rec_safer_alt_${primaryEdge.id}_to_${bypassEdge.id}`;
      if (!acknowledgedIds.includes(recId)) {
        recommendations.push({
          id: recId,
          type: "safer_alternative_available",
          severity: "MEDIUM",
          title: `Safer Bypass Corridor Available via ${bypassEdge.name}`,
          affectedZoneId: primaryEdge.zoneIds[0],
          affectedEdgeId: primaryEdge.id,
          recommendedAlternativeEdgeId: bypassEdge.id,
          trigger: `${primaryEdge.name} has ${primaryState.occupancyPercent}% load, while ${bypassEdge.name} is only at ${bypassState.occupancyPercent}%`,
          evidence: {
            corridorName: primaryEdge.name,
            alternativeEdgeName: bypassEdge.name,
            occupancyPercent: primaryState.occupancyPercent,
            predictedOccupancyPercent: primaryState.occupancyPercent + 10,
            netInflowPerMin: primaryState.inflowPerMinute - primaryState.outflowPerMinute,
            timeToCriticalMinutes: 12,
            edgeCrowdLevel: primaryState.crowdLevel,
            alternativeEdgeCrowdLevel: bypassState.crowdLevel,
          },
          recommendedAction: `Issue digital signage advisory redirecting non-urgent visitors to ${bypassEdge.name}.`,
          whyExplanation: `${bypassEdge.name} provides a viable route with ${primaryState.occupancyPercent - bypassState.occupancyPercent}% lower crowd density.`,
          expectedImpact: {
            summary: `Diverting 30% of traffic to ${bypassEdge.name} balances corridor utilization evenly.`,
            currentNetInflow: primaryState.inflowPerMinute - primaryState.outflowPerMinute,
            mitigatedNetInflow: Math.round((primaryState.inflowPerMinute - primaryState.outflowPerMinute) * 0.7),
            currentProjectedOccupancy: primaryState.occupancyPercent + 10,
            mitigatedProjectedOccupancy: primaryState.occupancyPercent - 18,
            whatIfReductionPercent: 30,
            mitigatedTimeToCriticalMinutes: 45,
          },
          confidencePercent: 91,
          timestamp: timestampStr,
          source: primaryState.source,
          acknowledged: false,
        });
      }
    }
  }

  // Deduplicate recommendations by id
  const uniqueRecs = Array.from(
    new Map(recommendations.map((r) => [r.id, r])).values()
  );

  // Prioritize recommendations by severity, urgency, and predicted occupancy
  uniqueRecs.sort((a, b) => {
    const sevOrder: Record<OperatorRecommendationSeverity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    if (sevOrder[b.severity] !== sevOrder[a.severity]) {
      return sevOrder[b.severity] - sevOrder[a.severity];
    }
    const aTime = a.evidence.timeToCriticalMinutes ?? 999;
    const bTime = b.evidence.timeToCriticalMinutes ?? 999;
    if (aTime !== bTime) return aTime - bTime;

    return b.evidence.predictedOccupancyPercent - a.evidence.predictedOccupancyPercent;
  });

  return uniqueRecs;
}
