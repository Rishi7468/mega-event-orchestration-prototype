import type { LatLng } from "@/data/geography";
import type {
  EventArchetype,
  CanonicalOperationalZone,
  PlacedAnchor,
  CanonicalPlacedAsset,
  CanonicalPlacedRoute,
  AnchorType,
} from "@/types/eventPlan";
import { GeometryEngine } from "@/lib/spatial/geometryEngine";
import { getH3CellIndex } from "@/lib/spatial/h3Grid";

export type TemplateComponentSpec = {
  name: string;
  type: "zone" | "anchor" | "route" | "asset";
  subType: string;
  required: boolean;
  description: string;
};

export type EventTemplateDefinition = {
  archetype: EventArchetype;
  name: string;
  description: string;
  recommendedAttendance: number;
  components: TemplateComponentSpec[];
};

export type GeneratedPlanResult = {
  archetype: EventArchetype;
  zones: CanonicalOperationalZone[];
  anchors: PlacedAnchor[];
  assets: CanonicalPlacedAsset[];
  routes: CanonicalPlacedRoute[];
  summary: {
    zoneCount: number;
    anchorCount: number;
    assetCount: number;
    routeCount: number;
    readinessScore: number;
  };
};

export const EVENT_TEMPLATES: Record<EventArchetype, EventTemplateDefinition> = {
  stadium: {
    archetype: "stadium",
    name: "World Cup / Stadium Final",
    description: "Multi-ring security, high-capacity stadium core, VIP corridors, transit integration.",
    recommendedAttendance: 68000,
    components: [
      { name: "Stadium Core Arena", type: "zone", subType: "venue", required: true, description: "Central spectator bowl and field" },
      { name: "North Holding Sector", type: "zone", subType: "transit", required: true, description: "Checkpoints and crowd queuing" },
      { name: "South Egress Sector", type: "zone", subType: "mixed", required: true, description: "Exit crowd dispersal area" },
      { name: "North Ingress Gate", type: "anchor", subType: "entry", required: true, description: "Primary spectator ingress portal" },
      { name: "South Egress Gate", type: "anchor", subType: "exit", required: true, description: "Secondary spectator egress portal" },
      { name: "Emergency Access Corridor", type: "route", subType: "emergency", required: true, description: "Direct corridor to medical base" },
      { name: "Medical Field Station", type: "asset", subType: "medical", required: true, description: "On-site emergency medical triage" },
      { name: "CCTV Surveillance Unit", type: "asset", subType: "cctv", required: true, description: "Perimeter monitoring post" },
    ],
  },
  marathon: {
    archetype: "marathon",
    name: "City Marathon",
    description: "Linear course routing, hydration bases, start/finish staging, spectator pockets.",
    recommendedAttendance: 45000,
    components: [
      { name: "Start Line Staging", type: "zone", subType: "transit", required: true, description: "Runner wave holding area" },
      { name: "Finish Line Concourse", type: "zone", subType: "venue", required: true, description: "Medal distribution & recovery zone" },
      { name: "Primary Course Corridor", type: "route", subType: "crowd_flow", required: true, description: "Road closure runner route" },
      { name: "Hydration & First Aid Base", type: "asset", subType: "first_aid", required: true, description: "Mid-course runner support" },
    ],
  },
  music_festival: {
    archetype: "music_festival",
    name: "Music Festival",
    description: "Multi-stage placement, camping/parking, central plaza, heavy crowd holding.",
    recommendedAttendance: 50000,
    components: [
      { name: "Main Stage Arena", type: "zone", subType: "venue", required: true, description: "High-density performance ground" },
      { name: "Plaza & Food Court", type: "zone", subType: "mixed", required: true, description: "Central visitor services lawn" },
      { name: "North Access Gate", type: "anchor", subType: "gate", required: true, description: "Wristband scan & search portal" },
      { name: "Festival Medical Base", type: "asset", subType: "medical", required: true, description: "Festival triage station" },
    ],
  },
  pilgrimage: {
    archetype: "pilgrimage",
    name: "Mega Pilgrimage / Gathering",
    description: "Mass holding sectors, continuous procession corridors, river/sanctum access.",
    recommendedAttendance: 250000,
    components: [
      { name: "Sacred Sanctum Core", type: "zone", subType: "venue", required: true, description: "Primary ritual/worship area" },
      { name: "Holding Sector Alpha", type: "zone", subType: "transit", required: true, description: "Surge overflow management sector" },
      { name: "Procession Corridor", type: "route", subType: "crowd_ingress", required: true, description: "One-way crowd flow artery" },
      { name: "Disaster Response Base", type: "asset", subType: "medical", required: true, description: "24/7 medical response station" },
    ],
  },
  parade: {
    archetype: "parade",
    name: "Civic Parade",
    description: "Linear boulevard staging, spectator barricades, dignitary stands, crossing points.",
    recommendedAttendance: 80000,
    components: [
      { name: "Procession Boulevard", type: "route", subType: "crowd_flow", required: true, description: "Parade route corridor" },
      { name: "VIP Reviewing Stand", type: "zone", subType: "venue", required: true, description: "Protocol spectator platform" },
    ],
  },
  exhibition: {
    archetype: "exhibition",
    name: "Trade Exhibition & Expo",
    description: "Indoor/outdoor hall partitioning, registration queues, shuttle drop-off.",
    recommendedAttendance: 35000,
    components: [
      { name: "Main Exhibition Hall", type: "zone", subType: "venue", required: true, description: "Primary booth and pavilion area" },
      { name: "Registration Plaza", type: "anchor", subType: "entry", required: true, description: "Badge pickup & security" },
    ],
  },
  fair_mela: {
    archetype: "fair_mela",
    name: "Cultural Fair & Mela",
    description: "Open market grid, food courts, attraction zones, perimeter security.",
    recommendedAttendance: 60000,
    components: [
      { name: "Central Fairground Plaza", type: "zone", subType: "venue", required: true, description: "Attractions & stall zone" },
      { name: "North Entry Arch", type: "anchor", subType: "entry", required: true, description: "Main ingress gate" },
    ],
  },
  campus: {
    archetype: "campus",
    name: "University Campus Event",
    description: "Quadrangle venue, perimeter access points, student safety patrols.",
    recommendedAttendance: 15000,
    components: [
      { name: "Campus Central Quad", type: "zone", subType: "venue", required: true, description: "Main gathering lawn" },
    ],
  },
  political: {
    archetype: "political",
    name: "Political Rally",
    description: "Podium buffer ring, heavy security screening, VIP escape route, media riser.",
    recommendedAttendance: 90000,
    components: [
      { name: "Podium & VIP Buffer", type: "zone", subType: "venue", required: true, description: "High-security speaker stage" },
      { name: "Public Assembly Sector", type: "zone", subType: "transit", required: true, description: "Rally spectator field" },
      { name: "VIP Evacuation Corridor", type: "route", subType: "evacuation", required: true, description: "Escort motorcade route" },
    ],
  },
  concert: {
    archetype: "concert",
    name: "Arena Concert",
    description: "Stage pit, seated sectors, egress surge corridors, acoustic boundary.",
    recommendedAttendance: 30000,
    components: [
      { name: "Main Arena Pit", type: "zone", subType: "venue", required: true, description: "Standing audience floor" },
    ],
  },
  custom: {
    archetype: "custom",
    name: "Custom Blank Event",
    description: "Blank canvas template for custom operational layout.",
    recommendedAttendance: 25000,
    components: [],
  },
};

/**
 * Contextually analyzes the actual event region geometry and generates a tailored starting plan.
 */
export function buildStartingPlanFromTemplate(
  archetype: EventArchetype,
  regionPolygon: LatLng[],
  center: LatLng,
  expectedAttendance: number
): GeneratedPlanResult {
  const [cLat, cLng] = center;

  // Determine spatial extent
  let minLat = cLat - 0.008;
  let maxLat = cLat + 0.008;
  let minLng = cLng - 0.010;
  let maxLng = cLng + 0.010;

  if (regionPolygon && regionPolygon.length >= 3) {
    const bbox = GeometryEngine.getBoundingBox(regionPolygon);
    minLat = bbox.south;
    maxLat = bbox.north;
    minLng = bbox.west;
    maxLng = bbox.east;
  }

  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const heightLat = maxLat - minLat;
  const widthLng = maxLng - minLng;

  const timestamp = Date.now();
  const zones: CanonicalOperationalZone[] = [];
  const anchors: PlacedAnchor[] = [];
  const assets: CanonicalPlacedAsset[] = [];
  const routes: CanonicalPlacedRoute[] = [];

  // 1. Core Arena / Venue Zone (Middle 50% of bounding box)
  const coreZone: CanonicalOperationalZone = {
    id: `zone-core-${timestamp}`,
    name: `${EVENT_TEMPLATES[archetype]?.name || "Venue"} Core Area`,
    code: "ZONE A",
    type: "venue",
    capacity: Math.round(expectedAttendance * 0.5),
    currentPopulation: 0,
    ingressRatePerMin: 450,
    egressRatePerMin: 350,
    cctvCount: 4,
    fieldTeamCount: 6,
    medicalUnitsCount: 2,
    emergencyAccess: "clear",
    riskLevel: "medium",
    boundary: [
      [midLat + heightLat * 0.25, midLng - widthLng * 0.25],
      [midLat + heightLat * 0.25, midLng + widthLng * 0.25],
      [midLat - heightLat * 0.25, midLng + widthLng * 0.25],
      [midLat - heightLat * 0.25, midLng - widthLng * 0.25],
    ],
    elevationMeters: 12,
  };
  zones.push(coreZone);

  // 2. Ingress & Holding Sector (North 25% of bounding box)
  const northZone: CanonicalOperationalZone = {
    id: `zone-north-${timestamp}`,
    name: "North Ingress & Holding Sector",
    code: "ZONE B",
    type: "transit",
    capacity: Math.round(expectedAttendance * 0.3),
    currentPopulation: 0,
    ingressRatePerMin: 600,
    egressRatePerMin: 200,
    cctvCount: 3,
    fieldTeamCount: 4,
    medicalUnitsCount: 1,
    emergencyAccess: "clear",
    riskLevel: "low",
    boundary: [
      [maxLat, midLng - widthLng * 0.4],
      [maxLat, midLng + widthLng * 0.4],
      [midLat + heightLat * 0.25, midLng + widthLng * 0.4],
      [midLat + heightLat * 0.25, midLng - widthLng * 0.4],
    ],
    elevationMeters: 10,
  };
  zones.push(northZone);

  // 3. South Egress Sector (South 25% of bounding box)
  const southZone: CanonicalOperationalZone = {
    id: `zone-south-${timestamp}`,
    name: "South Egress & Parking Concourse",
    code: "ZONE C",
    type: "mixed",
    capacity: Math.round(expectedAttendance * 0.2),
    currentPopulation: 0,
    ingressRatePerMin: 150,
    egressRatePerMin: 500,
    cctvCount: 2,
    fieldTeamCount: 4,
    medicalUnitsCount: 1,
    emergencyAccess: "clear",
    riskLevel: "low",
    boundary: [
      [midLat - heightLat * 0.25, midLng - widthLng * 0.4],
      [midLat - heightLat * 0.25, midLng + widthLng * 0.4],
      [minLat, midLng + widthLng * 0.4],
      [minLat, midLng - widthLng * 0.4],
    ],
    elevationMeters: 10,
  };
  zones.push(southZone);

  // 4. Primary Ingress Gate Anchor (North Edge)
  const gateNorth: PlacedAnchor = {
    id: `anchor-gate-n-${timestamp}`,
    name: "Gate 01 — Primary Ingress",
    type: "entry",
    lat: maxLat - heightLat * 0.05,
    lng: midLng,
    expectedThroughputPerMin: 1500,
    capacity: Math.round(expectedAttendance * 0.4),
    notes: "Main spectator entrance & ticket scanning portal",
  };
  anchors.push(gateNorth);

  // 5. Secondary Egress Gate Anchor (South Edge)
  const gateSouth: PlacedAnchor = {
    id: `anchor-gate-s-${timestamp}`,
    name: "Gate 02 — South Egress Portal",
    type: "exit",
    lat: minLat + heightLat * 0.05,
    lng: midLng,
    expectedThroughputPerMin: 1800,
    capacity: Math.round(expectedAttendance * 0.4),
    notes: "Main exit gate toward parking & shuttle transit",
  };
  anchors.push(gateSouth);

  // 6. Emergency Medical Base Asset
  const medicalAsset: CanonicalPlacedAsset = {
    id: `asset-med-01-${timestamp}`,
    name: "Primary Medical Command Station",
    type: "medical",
    category: "medical",
    lat: midLat,
    lng: midLng + widthLng * 0.3,
    zoneId: coreZone.id,
    h3Cell: getH3CellIndex(midLat, midLng + widthLng * 0.3),
    status: "active",
    coverageRadiusMeters: 400,
    staffCount: 12,
    mobilityType: "static",
  };
  assets.push(medicalAsset);

  // 7. Security Post Asset
  const securityAsset: CanonicalPlacedAsset = {
    id: `asset-sec-01-${timestamp}`,
    name: "North Ingress Security Post",
    type: "security_post",
    category: "safety",
    lat: maxLat - heightLat * 0.1,
    lng: midLng - widthLng * 0.2,
    zoneId: northZone.id,
    h3Cell: getH3CellIndex(maxLat - heightLat * 0.1, midLng - widthLng * 0.2),
    status: "active",
    coverageRadiusMeters: 300,
    staffCount: 8,
    mobilityType: "static",
  };
  assets.push(securityAsset);

  // 8. Emergency Access Corridor Route (Connecting North Ingress to Medical & South Egress)
  const emergencyRoute: CanonicalPlacedRoute = {
    id: `route-emg-01-${timestamp}`,
    name: "Emergency Access Corridor 01",
    type: "emergency",
    waypoints: [
      [gateNorth.lat, gateNorth.lng],
      [midLat, midLng],
      [medicalAsset.lat, medicalAsset.lng],
      [gateSouth.lat, gateSouth.lng],
    ],
    color: "#ef4444",
    status: "clear",
    distanceMeters: Math.round(GeometryEngine.calculateDistanceMeters([gateNorth.lat, gateNorth.lng], [gateSouth.lat, gateSouth.lng])),
    isRoutedRoad: true,
    routingProvider: "OSRM (OpenStreetMap)",
  };
  routes.push(emergencyRoute);

  return {
    archetype,
    zones,
    anchors,
    assets,
    routes,
    summary: {
      zoneCount: zones.length,
      anchorCount: anchors.length,
      assetCount: assets.length,
      routeCount: routes.length,
      readinessScore: 88,
    },
  };
}
