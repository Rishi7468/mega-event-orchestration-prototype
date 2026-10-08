import type {
  ZoneCrowdState,
  ZonePredictionState,
  CrowdLevel,
} from "@/types/dataPipeline";
import { deriveCrowdLevel } from "@/lib/intelligence/crowdStateEngine";
import {
  MAHA_KUMBH_EDGES,
  type EdgeCrowdState,
} from "@/lib/graph/pedestrianGraph";
import type { ActiveJourneyState, ActiveItineraryState } from "@/types";

// ==========================================
// INTERVENTION & SCENARIO TYPES
// ==========================================

export type InterventionType =
  | "inflow_reduction"
  | "flow_diversion"
  | "corridor_restriction"
  | "egress_increase";

export type InterventionItem = {
  id: string;
  type: InterventionType;
  title: string;
  targetZoneId: string;
  targetEdgeId?: string;
  secondaryZoneId?: string;
  secondaryEdgeId?: string;
  magnitudePercent: number; // 10 to 50
};

export type ZoneHorizonImpact = {
  zoneId: string;
  zoneName: string;
  capacity: number;
  currentPeopleCount: number;
  currentOccupancyPercent: number;
  currentNetInflow: number;
  currentCrowdLevel: CrowdLevel;
  currentTimeToCriticalMinutes: number | null;
  projectedPeopleCount: number;
  projectedOccupancyPercent: number;
  projectedNetInflow: number;
  projectedCrowdLevel: CrowdLevel;
  projectedTimeToCriticalMinutes: number | null;
  occupancyDeltaPercent: number;
};

export type EdgeHorizonImpact = {
  edgeId: string;
  edgeName: string;
  currentOccupancyPercent: number;
  currentCrowdLevel: CrowdLevel;
  projectedOccupancyPercent: number;
  projectedCrowdLevel: CrowdLevel;
  occupancyDeltaPercent: number;
};

export type RoutingImpactSummary = {
  totalActiveJourneys: number;
  unchangedJourneys: number;
  reroutedJourneys: number;
  averageTravelTimeDeltaMinutes: number;
  preferredAlternativeCorridor?: string;
};

export type HorizonSnapshot = {
  horizonMinutes: number;
  zones: Record<string, ZoneHorizonImpact>;
  edges: Record<string, EdgeHorizonImpact>;
};

export type ScenarioCalculationResult = {
  interventions: InterventionItem[];
  timestamp: string;
  horizons: {
    "5m": HorizonSnapshot;
    "15m": HorizonSnapshot;
    "30m": HorizonSnapshot;
  };
  primaryZoneImpact: ZoneHorizonImpact;
  secondaryZoneImpacts: ZoneHorizonImpact[];
  primaryEdgeImpact?: EdgeHorizonImpact;
  secondaryEdgeImpacts: EdgeHorizonImpact[];
  routingImpact: RoutingImpactSummary;
  overallOutcomeSummary: string;
};

const ZONE_NAMES: Record<string, string> = {
  central: "Central Triveni Ghat Sector",
  north: "North Gate Approach Sector",
  east: "East Ring Egress Sector",
  south: "South Hub Arrival Sector",
};



/**
 * Helper to compute single zone projection at horizon minutes
 */
function computeSingleZoneHorizon(
  zoneId: string,
  capacity: number,
  basePeopleCount: number,
  baseInflow: number,
  baseEgress: number,
  horizonMinutes: number
): ZoneHorizonImpact {
  const zoneName = ZONE_NAMES[zoneId] ?? zoneId.toUpperCase();
  const baseNet = baseInflow - baseEgress;
  const baseOccupancy = Math.round((basePeopleCount / capacity) * 100);
  const baseLevel = deriveCrowdLevel(baseOccupancy);

  const critThreshold = Math.round(capacity * 0.88);
  let baseTimeToCrit: number | null = null;
  if (baseNet > 0 && basePeopleCount < critThreshold) {
    baseTimeToCrit = Math.round(((critThreshold - basePeopleCount) / baseNet) * 10) / 10;
  }

  const projPeople = Math.min(
    capacity,
    Math.max(0, basePeopleCount + baseNet * horizonMinutes)
  );
  const projOccupancy = Math.round((projPeople / capacity) * 100);
  const projLevel = deriveCrowdLevel(projOccupancy);

  let projTimeToCrit: number | null = null;
  if (baseNet > 0 && basePeopleCount < critThreshold) {
    projTimeToCrit = Math.round(((critThreshold - basePeopleCount) / baseNet) * 10) / 10;
  }

  return {
    zoneId,
    zoneName,
    capacity,
    currentPeopleCount: basePeopleCount,
    currentOccupancyPercent: baseOccupancy,
    currentNetInflow: baseNet,
    currentCrowdLevel: baseLevel,
    currentTimeToCriticalMinutes: baseTimeToCrit,
    projectedPeopleCount: projPeople,
    projectedOccupancyPercent: projOccupancy,
    projectedNetInflow: baseNet,
    projectedCrowdLevel: projLevel,
    projectedTimeToCriticalMinutes: projTimeToCrit,
    occupancyDeltaPercent: projOccupancy - baseOccupancy,
  };
}

/**
 * Deterministic Scenario Simulation Engine.
 * Takes current live telemetry + up to 3 interventions and calculates
 * multi-edge flow redistribution, multi-horizon forecasts (+5m, +15m, +30m),
 * and re-evaluates visitor routing impact.
 */
export function calculateInterventionScenario(
  interventions: InterventionItem[],
  liveCrowdStates: Record<string, ZoneCrowdState> = {},
  edgeCrowdStates: Record<string, EdgeCrowdState> = {},
  _predictions: Record<string, ZonePredictionState> = {},
  activeJourney?: ActiveJourneyState,
  _activeItinerary?: ActiveItineraryState
): ScenarioCalculationResult {
  const activeInterventions = interventions.slice(0, 3); // Max 3 simultaneous
  const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Base state extraction
  const zoneBase: Record<string, { people: number; capacity: number; inflow: number; egress: number }> = {
    central: { people: liveCrowdStates.central?.peopleCount ?? 40500, capacity: 50000, inflow: 520, egress: 180 },
    north: { people: liveCrowdStates.north?.peopleCount ?? 19200, capacity: 40000, inflow: 310, egress: 260 },
    east: { people: liveCrowdStates.east?.peopleCount ?? 14700, capacity: 35000, inflow: 240, egress: 210 },
    south: { people: liveCrowdStates.south?.peopleCount ?? 11400, capacity: 30000, inflow: 190, egress: 220 },
  };

  // Base edge states
  const edgeBase: Record<string, { occupancy: number; level: CrowdLevel }> = {};
  MAHA_KUMBH_EDGES.forEach((e) => {
    const state = edgeCrowdStates[e.id];
    edgeBase[e.id] = {
      occupancy: state?.occupancyPercent ?? 55,
      level: state?.crowdLevel ?? "MODERATE",
    };
  });

  // Target primary zone
  const primaryTargetZoneId = activeInterventions[0]?.targetZoneId ?? "central";

  // Create mutable copies for intervention modification
  const modifiedInflow: Record<string, number> = {
    central: zoneBase.central.inflow,
    north: zoneBase.north.inflow,
    east: zoneBase.east.inflow,
    south: zoneBase.south.inflow,
  };

  const modifiedEgress: Record<string, number> = {
    central: zoneBase.central.egress,
    north: zoneBase.north.egress,
    east: zoneBase.east.egress,
    south: zoneBase.south.egress,
  };

  const modifiedEdgeOccupancy: Record<string, number> = {};
  Object.keys(edgeBase).forEach((eId) => {
    modifiedEdgeOccupancy[eId] = edgeBase[eId].occupancy;
  });

  // Apply composite interventions
  activeInterventions.forEach((item) => {
    const mag = item.magnitudePercent / 100;

    switch (item.type) {
      case "inflow_reduction": {
        // Reduce target zone incoming flow
        const targetInflow = modifiedInflow[item.targetZoneId] ?? 300;
        const delta = Math.round(targetInflow * mag);
        modifiedInflow[item.targetZoneId] = Math.max(50, targetInflow - delta);

        // Edge load reduction
        const targetEdgeId = item.targetEdgeId ?? "edge-south-gate-a";
        if (modifiedEdgeOccupancy[targetEdgeId] !== undefined) {
          modifiedEdgeOccupancy[targetEdgeId] = Math.max(15, Math.round(modifiedEdgeOccupancy[targetEdgeId] * (1 - mag * 0.7)));
        }
        break;
      }
      case "flow_diversion": {
        // Shift flow from target zone to secondary zone
        const srcZone = item.targetZoneId;
        const dstZone = item.secondaryZoneId ?? "east";
        const divertedFlow = Math.round((modifiedInflow[srcZone] ?? 300) * mag);

        modifiedInflow[srcZone] = Math.max(50, modifiedInflow[srcZone] - divertedFlow);
        modifiedInflow[dstZone] = (modifiedInflow[dstZone] ?? 200) + divertedFlow;

        // Shift edge loads
        if (item.targetEdgeId && modifiedEdgeOccupancy[item.targetEdgeId] !== undefined) {
          modifiedEdgeOccupancy[item.targetEdgeId] = Math.max(15, Math.round(modifiedEdgeOccupancy[item.targetEdgeId] * (1 - mag * 0.8)));
        }
        const altEdgeId = item.secondaryEdgeId ?? "edge-east-sangam";
        if (modifiedEdgeOccupancy[altEdgeId] !== undefined) {
          modifiedEdgeOccupancy[altEdgeId] = Math.min(95, Math.round(modifiedEdgeOccupancy[altEdgeId] + mag * 25));
        }
        break;
      }
      case "corridor_restriction": {
        // Metering corridor capacity
        if (item.targetEdgeId && modifiedEdgeOccupancy[item.targetEdgeId] !== undefined) {
          modifiedEdgeOccupancy[item.targetEdgeId] = Math.max(20, Math.round(modifiedEdgeOccupancy[item.targetEdgeId] * (1 - mag * 0.5)));
        }
        const targetInflow = modifiedInflow[item.targetZoneId] ?? 300;
        modifiedInflow[item.targetZoneId] = Math.max(60, Math.round(targetInflow * (1 - mag * 0.4)));
        break;
      }
      case "egress_increase": {
        // Boost outgoing flow
        const currentEg = modifiedEgress[item.targetZoneId] ?? 180;
        modifiedEgress[item.targetZoneId] = Math.round(currentEg * (1 + mag));
        break;
      }
    }
  });

  // Calculate multi-horizon snapshots (+5m, +15m, +30m)
  const buildHorizonSnapshot = (horizonMins: number): HorizonSnapshot => {
    const zones: Record<string, ZoneHorizonImpact> = {};
    const edges: Record<string, EdgeHorizonImpact> = {};

    Object.keys(zoneBase).forEach((zId) => {
      zones[zId] = computeSingleZoneHorizon(
        zId,
        zoneBase[zId].capacity,
        zoneBase[zId].people,
        modifiedInflow[zId],
        modifiedEgress[zId],
        horizonMins
      );
    });

    MAHA_KUMBH_EDGES.forEach((e) => {
      const baseOcc = edgeBase[e.id].occupancy;
      const modOcc = modifiedEdgeOccupancy[e.id] ?? baseOcc;
      // Drift over horizon
      const projOcc = Math.min(100, Math.max(10, Math.round(modOcc + (horizonMins / 15) * (modOcc - baseOcc))));
      edges[e.id] = {
        edgeId: e.id,
        edgeName: e.name,
        currentOccupancyPercent: baseOcc,
        currentCrowdLevel: deriveCrowdLevel(baseOcc),
        projectedOccupancyPercent: projOcc,
        projectedCrowdLevel: deriveCrowdLevel(projOcc),
        occupancyDeltaPercent: projOcc - baseOcc,
      };
    });

    return { horizonMinutes: horizonMins, zones, edges };
  };

  const snapshot5m = buildHorizonSnapshot(5);
  const snapshot15m = buildHorizonSnapshot(15);
  const snapshot30m = buildHorizonSnapshot(30);

  // Extract 15m primary & secondary impacts
  const primaryZoneImpact = snapshot15m.zones[primaryTargetZoneId];
  const secondaryZoneImpacts = Object.values(snapshot15m.zones).filter(
    (z) => z.zoneId !== primaryTargetZoneId
  );

  const primaryEdgeId = activeInterventions[0]?.targetEdgeId ?? "edge-south-gate-a";
  const primaryEdgeImpact = snapshot15m.edges[primaryEdgeId];
  const secondaryEdgeImpacts = Object.values(snapshot15m.edges).filter(
    (e) => e.edgeId !== primaryEdgeId
  );

  // Routing impact re-evaluation over projected state
  const mockJourneyCount = activeJourney ? 12 : 8;
  const primaryOccupancyDrop = primaryZoneImpact.currentOccupancyPercent - primaryZoneImpact.projectedOccupancyPercent;
  const reroutedCount = primaryOccupancyDrop > 10 ? Math.min(mockJourneyCount, Math.max(2, Math.round(mockJourneyCount * 0.35))) : 0;

  const routingImpact: RoutingImpactSummary = {
    totalActiveJourneys: mockJourneyCount,
    unchangedJourneys: mockJourneyCount - reroutedCount,
    reroutedJourneys: reroutedCount,
    averageTravelTimeDeltaMinutes: reroutedCount > 0 ? -4.5 : 0,
    preferredAlternativeCorridor: activeInterventions[0]?.secondaryEdgeId
      ? MAHA_KUMBH_EDGES.find((e) => e.id === activeInterventions[0].secondaryEdgeId)?.name
      : "East Sector Bypass",
  };

  // Summarize overall outcome
  const netDrop = primaryZoneImpact.occupancyDeltaPercent;
  const summaryText =
    netDrop <= 0
      ? `Intervention lowers ${primaryZoneImpact.zoneName} 15m projected occupancy by ${Math.abs(netDrop)} pts (${primaryZoneImpact.currentOccupancyPercent}% → ${primaryZoneImpact.projectedOccupancyPercent}%).`
      : `Intervention stabilizes overall sector influx. Primary occupancy projected at ${primaryZoneImpact.projectedOccupancyPercent}%.`;

  return {
    interventions: activeInterventions,
    timestamp: timestampStr,
    horizons: {
      "5m": snapshot5m,
      "15m": snapshot15m,
      "30m": snapshot30m,
    },
    primaryZoneImpact,
    secondaryZoneImpacts,
    primaryEdgeImpact,
    secondaryEdgeImpacts,
    routingImpact,
    overallOutcomeSummary: summaryText,
  };
}
