import type { CrowdFlowEdge, CrowdFlowGraph, ZoneFlowState } from "@/types/dataPipeline";
import { mahaKumbhGeography } from "@/data/geography";

export type ZoneTransition = {
  sourceZoneId: string;
  targetZoneId: string;
  timestamp: number;
};

/**
 * Derives a compass direction heading string from latitude/longitude delta vector.
 */
export function computeHeadingFromVector(dLat: number, dLng: number): string {
  if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) return "STATIONARY";

  // Angle in degrees clockwise from North
  const angleRad = Math.atan2(dLng, dLat);
  let deg = (angleRad * 180) / Math.PI;
  if (deg < 0) deg += 360;

  if (deg >= 337.5 || deg < 22.5) return "NORTH";
  if (deg >= 22.5 && deg < 67.5) return "NORTHEAST";
  if (deg >= 67.5 && deg < 112.5) return "EAST";
  if (deg >= 112.5 && deg < 157.5) return "SOUTHEAST";
  if (deg >= 157.5 && deg < 202.5) return "SOUTH";
  if (deg >= 202.5 && deg < 247.5) return "SOUTHWEST";
  if (deg >= 247.5 && deg < 292.5) return "WEST";
  return "NORTHWEST";
}

/**
 * Calculates dominant direction from outgoing zone connections based on geographic centroid vectors.
 */
export function computeDominantDirectionForZone(
  zoneId: string,
  outgoingEdges: CrowdFlowEdge[]
): string {
  const sourceGeo = mahaKumbhGeography.zones.find((z) => z.zoneId === zoneId);
  if (!sourceGeo || outgoingEdges.length === 0) return "STABLE";

  let sumDLat = 0;
  let sumDLng = 0;
  let totalWeight = 0;

  outgoingEdges.forEach((edge) => {
    const targetGeo = mahaKumbhGeography.zones.find((z) => z.zoneId === edge.targetZoneId);
    if (!targetGeo || edge.peoplePerMinute <= 0) return;

    const dLat = targetGeo.center[0] - sourceGeo.center[0];
    const dLng = targetGeo.center[1] - sourceGeo.center[1];

    sumDLat += dLat * edge.peoplePerMinute;
    sumDLng += dLng * edge.peoplePerMinute;
    totalWeight += edge.peoplePerMinute;
  });

  if (totalWeight <= 0) return "STABLE";
  return computeHeadingFromVector(sumDLat / totalWeight, sumDLng / totalWeight);
}

/**
 * Creates default initial Crowd Flow Graph with baseline edges between Pravaah zones.
 */
export function createInitialCrowdFlowGraph(): CrowdFlowGraph {
  const initialEdges: CrowdFlowEdge[] = [
    {
      id: "south->central",
      sourceZoneId: "south",
      targetZoneId: "central",
      peoplePerMinute: 420,
      trend: "INCREASING",
      confidencePercent: 94,
      lastUpdated: "Just now",
      active: true,
    },
    {
      id: "central->north",
      sourceZoneId: "central",
      targetZoneId: "north",
      peoplePerMinute: 280,
      trend: "STABLE",
      confidencePercent: 92,
      lastUpdated: "Just now",
      active: true,
    },
    {
      id: "east->central",
      sourceZoneId: "east",
      targetZoneId: "central",
      peoplePerMinute: 190,
      trend: "STABLE",
      confidencePercent: 90,
      lastUpdated: "Just now",
      active: true,
    },
    {
      id: "central->east",
      sourceZoneId: "central",
      targetZoneId: "east",
      peoplePerMinute: 110,
      trend: "DECREASING",
      confidencePercent: 88,
      lastUpdated: "Just now",
      active: true,
    },
    {
      id: "north->central",
      sourceZoneId: "north",
      targetZoneId: "central",
      peoplePerMinute: 85,
      trend: "STABLE",
      confidencePercent: 88,
      lastUpdated: "Just now",
      active: false,
    },
  ];

  const zoneIds = ["central", "north", "east", "south"];
  const zoneFlows = computeZoneFlowStates(initialEdges, zoneIds);

  return {
    edges: initialEdges,
    zoneFlows,
    windowSeconds: 60,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

/**
 * Computes per-zone flow metrics (incoming, outgoing, net accumulation, dominant direction, top connections)
 * from active flow graph edges.
 */
export function computeZoneFlowStates(
  edges: CrowdFlowEdge[],
  zoneIds: string[]
): Record<string, ZoneFlowState> {
  const result: Record<string, ZoneFlowState> = {};
  const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  zoneIds.forEach((zoneId) => {
    const incomingEdges = edges.filter((e) => e.targetZoneId === zoneId && e.active && e.peoplePerMinute > 0);
    const outgoingEdges = edges.filter((e) => e.sourceZoneId === zoneId && e.active && e.peoplePerMinute > 0);

    const incomingFlowPerMin = incomingEdges.reduce((sum, e) => sum + e.peoplePerMinute, 0);
    const outgoingFlowPerMin = outgoingEdges.reduce((sum, e) => sum + e.peoplePerMinute, 0);
    const netAccumulationPerMin = incomingFlowPerMin - outgoingFlowPerMin;

    const dominantDirection = computeDominantDirectionForZone(zoneId, outgoingEdges);

    const topIncoming = incomingEdges
      .map((e) => ({ sourceZoneId: e.sourceZoneId, flowPerMin: e.peoplePerMinute }))
      .sort((a, b) => b.flowPerMin - a.flowPerMin);

    const topOutgoing = outgoingEdges
      .map((e) => ({ targetZoneId: e.targetZoneId, flowPerMin: e.peoplePerMinute }))
      .sort((a, b) => b.flowPerMin - a.flowPerMin);

    const flowTrend = netAccumulationPerMin > 50 ? "INCREASING" : netAccumulationPerMin < -50 ? "DECREASING" : "STABLE";

    result[zoneId] = {
      zoneId,
      incomingFlowPerMin,
      outgoingFlowPerMin,
      netAccumulationPerMin,
      dominantDirection,
      flowTrend,
      topIncoming,
      topOutgoing,
      lastUpdated: timestampStr,
    };
  });

  return result;
}

/**
 * Dynamically updates graph edges with new zone transition observations and updates per-zone flow states.
 */
export function updateCrowdFlowGraphWithTelemetry(
  currentGraph: CrowdFlowGraph,
  updatedEdgesPatch: Partial<CrowdFlowEdge>[]
): CrowdFlowGraph {
  const updatedEdges = currentGraph.edges.map((existingEdge) => {
    const patch = updatedEdgesPatch.find((p) => p.id === existingEdge.id || (p.sourceZoneId === existingEdge.sourceZoneId && p.targetZoneId === existingEdge.targetZoneId));
    if (!patch) return existingEdge;

    const peoplePerMinute = patch.peoplePerMinute ?? existingEdge.peoplePerMinute;
    const delta = peoplePerMinute - existingEdge.peoplePerMinute;
    const trend = delta > 20 ? "INCREASING" : delta < -20 ? "DECREASING" : existingEdge.trend;

    return {
      ...existingEdge,
      ...patch,
      peoplePerMinute,
      trend,
      lastUpdated: "Just now",
      active: peoplePerMinute > 10,
    };
  });

  // Also add any completely new edges passed in patch
  updatedEdgesPatch.forEach((patch) => {
    if (!patch.sourceZoneId || !patch.targetZoneId) return;
    const exists = updatedEdges.some((e) => e.sourceZoneId === patch.sourceZoneId && e.targetZoneId === patch.targetZoneId);
    if (!exists) {
      updatedEdges.push({
        id: `${patch.sourceZoneId}->${patch.targetZoneId}`,
        sourceZoneId: patch.sourceZoneId,
        targetZoneId: patch.targetZoneId,
        peoplePerMinute: patch.peoplePerMinute ?? 120,
        trend: patch.trend ?? "STABLE",
        confidencePercent: patch.confidencePercent ?? 92,
        lastUpdated: "Just now",
        active: true,
      });
    }
  });

  const zoneIds = Array.from(new Set([
    ...updatedEdges.map((e) => e.sourceZoneId),
    ...updatedEdges.map((e) => e.targetZoneId),
    "central", "north", "east", "south"
  ]));

  const zoneFlows = computeZoneFlowStates(updatedEdges, zoneIds);

  return {
    ...currentGraph,
    edges: updatedEdges,
    zoneFlows,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}
