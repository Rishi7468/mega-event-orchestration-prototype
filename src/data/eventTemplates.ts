import type { LatLng } from "@/data/geography";
import type { EventType, OperationalZoneDefinition, PlacedAsset, PlacedRoute, AssetType, AssetCategory } from "@/store/eventAuthoringStore";

export type EventArchetypeDefinition = {
  id: EventType;
  label: string;
  emoji: string;
  tagline: string;
  defaultAttendance: number;
  defaultDurationHours: number;
  iconName: string;
};

export const EVENT_ARCHETYPES_CATALOG: EventArchetypeDefinition[] = [
  {
    id: "sports",
    label: "Marathon / Road Race / Sports",
    emoji: "🏃",
    tagline: "Linear road corridor, start/finish hubs, hydration & medical posts",
    defaultAttendance: 35000,
    defaultDurationHours: 6,
    iconName: "Activity",
  },
  {
    id: "concert",
    label: "Music Festival / Concert",
    emoji: "🎵",
    tagline: "Stage arena, high-density audience lawn, access gates & service hubs",
    defaultAttendance: 45000,
    defaultDurationHours: 12,
    iconName: "Music",
  },
  {
    id: "religious",
    label: "Pilgrimage / Religious Mass Gathering",
    emoji: "🛕",
    tagline: "Core shrine/sanctum zone, holding areas, high-capacity ingress",
    defaultAttendance: 250000,
    defaultDurationHours: 24,
    iconName: "Sparkles",
  },
  {
    id: "fair_mela",
    label: "Cultural Fair / Mela",
    emoji: "🎉",
    tagline: "Distributed food & craft stalls, central stage, emergency lanes",
    defaultAttendance: 50000,
    defaultDurationHours: 10,
    iconName: "Smile",
  },
  {
    id: "parade",
    label: "Parade / Procession",
    emoji: "🚶",
    tagline: "Linear spectator boulevard, intersection checkpoints & VIP stands",
    defaultAttendance: 60000,
    defaultDurationHours: 4,
    iconName: "Flag",
  },
  {
    id: "exhibition",
    label: "Exhibition / Expo",
    emoji: "🏢",
    tagline: "Structured indoor/outdoor halls, badge entry & loading docks",
    defaultAttendance: 20000,
    defaultDurationHours: 8,
    iconName: "Building",
  },
  {
    id: "political",
    label: "Public Gathering / Rally",
    emoji: "📢",
    tagline: "Podium core, heavy crowd holding lawn, strict security buffer",
    defaultAttendance: 80000,
    defaultDurationHours: 4,
    iconName: "Megaphone",
  },
  {
    id: "campus",
    label: "Campus Festival / University Event",
    emoji: "🎓",
    tagline: "Multi-venue quad, student volunteer hubs & perimeter gates",
    defaultAttendance: 15000,
    defaultDurationHours: 8,
    iconName: "GraduationCap",
  },
  {
    id: "custom",
    label: "Custom Event Blueprint",
    emoji: "⚙",
    tagline: "Clean canvas with customizable operational zones & assets",
    defaultAttendance: 25000,
    defaultDurationHours: 6,
    iconName: "Sliders",
  },
];

function makeZone(
  id: string,
  code: string,
  name: string,
  boundary: LatLng[],
  capacity: number,
  riskLevel: "low" | "medium" | "high" | "critical" = "low",
): OperationalZoneDefinition {
  return {
    id,
    code,
    name,
    type: "venue",
    boundary,
    capacity,
    currentPopulation: Math.round(capacity * 0.4),
    ingressRatePerMin: 120,
    egressRatePerMin: 100,
    cctvCount: 3,
    fieldTeamCount: 5,
    medicalUnitsCount: 2,
    emergencyAccess: "clear",
    riskLevel,
    elevationMeters: 10,
  };
}

function makeAsset(
  id: string,
  name: string,
  type: AssetType,
  lat: number,
  lng: number,
  zoneId: string = "",
): PlacedAsset {
  let category: AssetCategory = "infrastructure";
  if (type === "cctv" || type === "security_post" || type === "assembly_area" || type === "restricted_area" || type === "emergency_station") {
    category = "safety";
  } else if (type === "medical" || type === "first_aid" || type === "hospital_access" || type === "ambulance_stand") {
    category = "medical";
  } else if (type === "gate" || type === "entry" || type === "exit" || type === "barricade" || type === "checkpoint" || type === "crowd_marshal") {
    category = "crowd_management";
  } else if (type === "volunteer" || type === "police" || type === "field_team" || type === "info_desk") {
    category = "people";
  }

  return {
    id,
    name,
    type,
    category,
    lat,
    lng,
    status: "active",
    coverageRadiusMeters: type === "cctv" ? 300 : type === "medical" ? 400 : 200,
    zoneId,
    h3Cell: "",
  };
}

export function generateRecommendedPlan(
  eventType: EventType,
  center: LatLng,
  locationName: string,
): {
  suggestedPolygon: LatLng[];
  zones: OperationalZoneDefinition[];
  assets: PlacedAsset[];
  routes: PlacedRoute[];
} {
  const [lat, lng] = center;
  const delta = 0.008;

  const suggestedPolygon: LatLng[] = [
    [lat + delta, lng - delta * 1.2],
    [lat + delta, lng + delta * 1.2],
    [lat - delta, lng + delta * 1.2],
    [lat - delta, lng - delta * 1.2],
  ];

  const now = Date.now();

  if (eventType === "sports" || eventType === "parade") {
    const zoneStartId = `zone-mara-start-${now}`;
    const zoneFinishId = `zone-mara-finish-${now}`;
    return {
      suggestedPolygon,
      zones: [
        makeZone(
          zoneStartId,
          "START-HUB",
          "Start Line Hub",
          [
            [lat + delta * 0.9, lng - delta * 1.1],
            [lat + delta * 0.9, lng - delta * 0.3],
            [lat + delta * 0.3, lng - delta * 0.3],
            [lat + delta * 0.3, lng - delta * 1.1],
          ],
          15000,
          "low",
        ),
        makeZone(
          zoneFinishId,
          "FINISH-HUB",
          "Finish Line & Recovery Plaza",
          [
            [lat - delta * 0.3, lng + delta * 0.3],
            [lat - delta * 0.3, lng + delta * 1.1],
            [lat - delta * 0.9, lng + delta * 1.1],
            [lat - delta * 0.9, lng + delta * 0.3],
          ],
          20000,
          "medium",
        ),
      ],
      assets: [
        makeAsset(`ast-gate-1-${now}`, "Start Gate Ingress", "gate", lat + delta * 0.6, lng - delta * 0.9, zoneStartId),
        makeAsset(`ast-med-1-${now}`, "Start Medical Tent", "medical", lat + delta * 0.5, lng - delta * 0.5, zoneStartId),
        makeAsset(`ast-med-2-${now}`, "Finish Line Hospital", "medical", lat - delta * 0.6, lng + delta * 0.7, zoneFinishId),
        makeAsset(`ast-cctv-1-${now}`, "Finish Gate CCTV", "cctv", lat - delta * 0.5, lng + delta * 0.5, zoneFinishId),
        makeAsset(`ast-vol-1-${now}`, "Volunteer Desk", "volunteer", lat, lng, zoneStartId),
      ],
      routes: [
        {
          id: `rte-marathon-${now}`,
          name: "Main Event Race Corridor",
          type: "crowd_ingress",
          waypoints: [
            [lat + delta * 0.6, lng - delta * 0.7],
            [lat + delta * 0.2, lng - delta * 0.2],
            [lat - delta * 0.2, lng + delta * 0.2],
            [lat - delta * 0.6, lng + delta * 0.7],
          ],
          color: "#3b82f6",
          status: "clear",
        },
        {
          id: `rte-emerg-${now}`,
          name: "Emergency Ambulance Corridor",
          type: "emergency",
          waypoints: [
            [lat + delta * 0.8, lng + delta * 0.8],
            [lat, lng + delta * 0.6],
            [lat - delta * 0.8, lng + delta * 0.8],
          ],
          color: "#ef4444",
          status: "clear",
        },
      ],
    };
  }

  if (eventType === "concert" || eventType === "fair_mela") {
    const stageZoneId = `zone-stage-${now}`;
    const foodZoneId = `zone-food-${now}`;
    return {
      suggestedPolygon,
      zones: [
        makeZone(
          stageZoneId,
          "MAIN-STAGE",
          "Main Stage & Fan Pit",
          [
            [lat + delta * 0.8, lng - delta * 0.8],
            [lat + delta * 0.8, lng + delta * 0.8],
            [lat + delta * 0.1, lng + delta * 0.8],
            [lat + delta * 0.1, lng - delta * 0.8],
          ],
          30000,
          "medium",
        ),
        makeZone(
          foodZoneId,
          "FOOD-PLAZA",
          "Food & Refreshments Lawn",
          [
            [lat - delta * 0.1, lng - delta * 0.8],
            [lat - delta * 0.1, lng + delta * 0.8],
            [lat - delta * 0.8, lng + delta * 0.8],
            [lat - delta * 0.8, lng - delta * 0.8],
          ],
          15000,
          "low",
        ),
      ],
      assets: [
        makeAsset(`ast-cctv-stage-${now}`, "Stage Main Camera Tower", "cctv", lat + delta * 0.6, lng, stageZoneId),
        makeAsset(`ast-gate-north-${now}`, "Gate North", "gate", lat + delta * 0.8, lng - delta * 0.6, stageZoneId),
        makeAsset(`ast-med-fest-${now}`, "Festival Aid Station", "medical", lat - delta * 0.4, lng - delta * 0.5, foodZoneId),
        makeAsset(`ast-sec-1-${now}`, "Police Security Desk", "police", lat + delta * 0.3, lng - delta * 0.4, stageZoneId),
      ],
      routes: [
        {
          id: `rte-egress-${now}`,
          name: "Main Crowd Exit Route",
          type: "crowd_egress",
          waypoints: [
            [lat + delta * 0.2, lng],
            [lat - delta * 0.5, lng],
            [lat - delta * 0.8, lng],
          ],
          color: "#10b981",
          status: "clear",
        },
      ],
    };
  }

  // Default / Religious / Political / Custom Archetype Plan
  const coreZoneId = `zone-core-${now}`;
  const transitZoneId = `zone-holding-${now}`;
  return {
    suggestedPolygon,
    zones: [
      makeZone(
        coreZoneId,
        "CORE-SECTOR",
        `${locationName} Core Arena`,
        [
          [lat + delta * 0.7, lng - delta * 0.7],
          [lat + delta * 0.7, lng + delta * 0.7],
          [lat - delta * 0.1, lng + delta * 0.7],
          [lat - delta * 0.1, lng - delta * 0.7],
        ],
        40000,
        "low",
      ),
      makeZone(
        transitZoneId,
        "TRANSIT-HUB",
        "Transit & Holding Precinct",
        [
          [lat - delta * 0.2, lng - delta * 0.7],
          [lat - delta * 0.2, lng + delta * 0.7],
          [lat - delta * 0.8, lng + delta * 0.7],
          [lat - delta * 0.8, lng - delta * 0.7],
        ],
        25000,
        "low",
      ),
    ],
    assets: [
      makeAsset(`ast-gate-1-${now}`, "Main Gate Alpha", "gate", lat + delta * 0.5, lng - delta * 0.6, coreZoneId),
      makeAsset(`ast-cctv-1-${now}`, "Perimeter CCTV Cam 1", "cctv", lat + delta * 0.4, lng + delta * 0.4, coreZoneId),
      makeAsset(`ast-med-1-${now}`, "Central First Aid Post", "medical", lat - delta * 0.4, lng - delta * 0.3, transitZoneId),
      makeAsset(`ast-vol-1-${now}`, "Visitor Info Desk", "volunteer", lat - delta * 0.5, lng + delta * 0.3, transitZoneId),
    ],
    routes: [
      {
        id: `rte-evac-${now}`,
        name: "Evacuation Corridor",
        type: "emergency",
        waypoints: [
          [lat + delta * 0.7, lng],
          [lat, lng],
          [lat - delta * 0.8, lng],
        ],
        color: "#ef4444",
        status: "clear",
      },
    ],
  };
}
