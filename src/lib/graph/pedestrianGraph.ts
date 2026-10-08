import type { LatLng } from "@/data/geography";
import type { CrowdLevel } from "@/types/dataPipeline";

// ==========================================
// PEDESTRIAN GRAPH DATA CONTRACTS
// ==========================================

export type PedestrianNodeType =
  | "gate"
  | "hub"
  | "intersection"
  | "venue"
  | "landmark";

export type PedestrianNode = {
  id: string;
  name: string;
  zoneId: string;
  coordinates: LatLng; // [lat, lng]
  type: PedestrianNodeType;
};

export type PedestrianEdge = {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  zoneIds: string[];
  geometry: LatLng[];
  distanceMeters: number;
  baseTravelTimeMinutes: number;
  cameraIds?: string[];
  corridorType?: "direct" | "bypass" | "ring" | "shuttle";
};

export type EdgeCrowdState = {
  edgeId: string;
  peopleCount: number;
  occupancyPercent: number;
  crowdLevel: CrowdLevel;
  inflowPerMinute: number;
  outflowPerMinute: number;
  predictedCrowdLevel: CrowdLevel;
  hasIncident: boolean;
  source: "REAL_VIDEO" | "SIMULATED";
  lastUpdated: number;
};

export type PedestrianGraph = {
  id: string;
  name: string;
  nodes: PedestrianNode[];
  edges: PedestrianEdge[];
};

// ==========================================
// HAVERSINE DISTANCE & GEOMETRY CALCULATOR
// ==========================================

export const CONFIGURABLE_WALKING_SPEED_M_PER_MIN = 70; // ~4.2 km/h

/**
 * Calculates real physical ground distance between two LatLng points using Haversine formula.
 */
export function haversineDistance(p1: LatLng, p2: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates total cumulative physical distance along a polyline path of waypoints.
 */
export function computePolylineDistance(waypoints: LatLng[]): number {
  if (waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += haversineDistance(waypoints[i], waypoints[i + 1]);
  }
  return Math.max(10, total);
}

/**
 * Computes base travel time in minutes based on distance and walking speed.
 */
export function computeBaseTravelTimeMinutes(
  distanceMeters: number,
  walkingSpeedMPerMin: number = CONFIGURABLE_WALKING_SPEED_M_PER_MIN
): number {
  return Math.max(1, Math.round(distanceMeters / walkingSpeedMPerMin));
}

// ==========================================
// CANONICAL MAHA KUMBH EVENT GRAPH
// ==========================================

export const MAHA_KUMBH_NODES: PedestrianNode[] = [
  {
    id: "node-south-hub",
    name: "South Transit Hub",
    zoneId: "south",
    coordinates: [25.3892, 81.8716],
    type: "hub",
  },
  {
    id: "node-central-hub",
    name: "Central Hub",
    zoneId: "central",
    coordinates: [25.4292, 81.8770],
    type: "hub",
  },
  {
    id: "node-east-hub",
    name: "East Sector Hub",
    zoneId: "east",
    coordinates: [25.4338, 81.9204],
    type: "hub",
  },
  {
    id: "node-north-hub",
    name: "North Hub",
    zoneId: "north",
    coordinates: [25.4512, 81.8628],
    type: "hub",
  },
  {
    id: "node-gate-a",
    name: "Gate A Entry Gate",
    zoneId: "central",
    coordinates: [25.4256, 81.8824],
    type: "gate",
  },
  {
    id: "node-gate-b",
    name: "Gate B Entry Gate",
    zoneId: "north",
    coordinates: [25.4344, 81.8790],
    type: "gate",
  },
  {
    id: "node-sangam-venue",
    name: "Triveni Sangam Bathing Ghat",
    zoneId: "central",
    coordinates: [25.4228, 81.8874],
    type: "venue",
  },
];

// Raw edge geometry definitions
const RAW_EDGES_GEOMETRY = [
  {
    id: "edge-south-gate-a",
    name: "South-Central Main Corridor",
    fromNodeId: "node-south-hub",
    toNodeId: "node-gate-a",
    zoneIds: ["south", "central"],
    geometry: [
      [25.3892, 81.8716],
      [25.4022, 81.8764],
      [25.4292, 81.8770],
      [25.4256, 81.8824],
    ] as LatLng[],
    cameraIds: ["cam-07"],
    corridorType: "direct" as const,
  },
  {
    id: "edge-gate-a-sangam",
    name: "Gate A Sacred Approach",
    fromNodeId: "node-gate-a",
    toNodeId: "node-sangam-venue",
    zoneIds: ["central"],
    geometry: [
      [25.4256, 81.8824],
      [25.4228, 81.8874],
    ] as LatLng[],
    cameraIds: ["cam-07"],
    corridorType: "direct" as const,
  },
  {
    id: "edge-south-east",
    name: "South-East Perimeter Bypass Leg 1",
    fromNodeId: "node-south-hub",
    toNodeId: "node-east-hub",
    zoneIds: ["south", "east"],
    geometry: [
      [25.3892, 81.8716],
      [25.4100, 81.8950],
      [25.4338, 81.9204],
    ] as LatLng[],
    cameraIds: ["cam-04"],
    corridorType: "bypass" as const,
  },
  {
    id: "edge-east-sangam",
    name: "East Sector Ring Approach",
    fromNodeId: "node-east-hub",
    toNodeId: "node-sangam-venue",
    zoneIds: ["east", "central"],
    geometry: [
      [25.4338, 81.9204],
      [25.4300, 81.9006],
      [25.4228, 81.8874],
    ] as LatLng[],
    cameraIds: ["cam-12"],
    corridorType: "bypass" as const,
  },
  {
    id: "edge-south-north",
    name: "South-North Outer Ring Leg 1",
    fromNodeId: "node-south-hub",
    toNodeId: "node-north-hub",
    zoneIds: ["south", "north"],
    geometry: [
      [25.3892, 81.8716],
      [25.4200, 81.8650],
      [25.4512, 81.8628],
    ] as LatLng[],
    cameraIds: ["cam-04"],
    corridorType: "ring" as const,
  },
  {
    id: "edge-north-gate-b",
    name: "North Hub Gate B Direct",
    fromNodeId: "node-north-hub",
    toNodeId: "node-gate-b",
    zoneIds: ["north"],
    geometry: [
      [25.4512, 81.8628],
      [25.4408, 81.8712],
      [25.4344, 81.8790],
    ] as LatLng[],
    cameraIds: ["cam-03"],
    corridorType: "direct" as const,
  },
  {
    id: "edge-gate-b-sangam",
    name: "Gate B Sangam Confluence Way",
    fromNodeId: "node-gate-b",
    toNodeId: "node-sangam-venue",
    zoneIds: ["central"],
    geometry: [
      [25.4344, 81.8790],
      [25.4306, 81.8862],
      [25.4228, 81.8874],
    ] as LatLng[],
    cameraIds: ["cam-07"],
    corridorType: "direct" as const,
  },
  {
    id: "edge-north-east",
    name: "North-East Perimeter Connector",
    fromNodeId: "node-north-hub",
    toNodeId: "node-east-hub",
    zoneIds: ["north", "east"],
    geometry: [
      [25.4512, 81.8628],
      [25.4452, 81.8900],
      [25.4338, 81.9204],
    ] as LatLng[],
    cameraIds: ["cam-03"],
    corridorType: "bypass" as const,
  },
];

// Build Maha Kumbh Edges dynamically computing Haversine distance from waypoints
export const MAHA_KUMBH_EDGES: PedestrianEdge[] = RAW_EDGES_GEOMETRY.map((raw) => {
  const distanceMeters = computePolylineDistance(raw.geometry);
  const baseTravelTimeMinutes = computeBaseTravelTimeMinutes(distanceMeters);
  return {
    ...raw,
    distanceMeters,
    baseTravelTimeMinutes,
  };
});

export const canonicalPedestrianGraph: PedestrianGraph = {
  id: "maha-kumbh-graph",
  name: "Maha Kumbh Event Navigation Graph",
  nodes: MAHA_KUMBH_NODES,
  edges: MAHA_KUMBH_EDGES,
};
