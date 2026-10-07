import type { EventType, OperationalZoneDefinition } from "@/store/eventAuthoringStore";
import type { LatLng } from "@/data/geography";

export type SmartZoneProposal = {
  id: string;
  name: string;
  code: string;
  type: OperationalZoneDefinition["type"];
  capacity: number;
  recommendedCctv: number;
  recommendedMedical: number;
  recommendedFieldTeams: number;
  boundary: LatLng[];
  rationale: string[];
};

export type ResourceGapWarning = {
  zoneId: string;
  zoneName: string;
  category: "cctv" | "medical" | "field_teams" | "emergency_access";
  severity: "warning" | "critical";
  currentCount: number;
  recommendedCount: number;
  message: string;
  suggestedAction: string;
};

export type ZoneCoverageScore = {
  zoneId: string;
  zoneName: string;
  cctvPercent: number; // 0-100
  medicalPercent: number;
  fieldTeamPercent: number;
  overallScore: number;
  isDeficit: boolean;
};

export function generateSmartZoningRecommendations(
  eventType: EventType,
  expectedAttendance: number,
  regionPolygon: LatLng[],
): SmartZoneProposal[] {
  // Center anchor computation
  const baseLat = regionPolygon.length > 0 ? regionPolygon[0][0] : 25.4255;
  const baseLng = regionPolygon.length > 0 ? regionPolygon[0][1] : 81.8820;

  const totalCap = Math.max(expectedAttendance, 20000);

  if (eventType === "music_festival") {
    return [
      {
        id: "smart-zone-a",
        name: "Main Stage Arena",
        code: "ZONE A",
        type: "venue",
        capacity: Math.round(totalCap * 0.5),
        recommendedCctv: 12,
        recommendedMedical: 4,
        recommendedFieldTeams: 8,
        boundary: [
          [baseLat + 0.010, baseLng + 0.010],
          [baseLat + 0.010, baseLng + 0.025],
          [baseLat - 0.002, baseLng + 0.025],
          [baseLat - 0.002, baseLng + 0.010],
        ],
        rationale: [
          "Highest expected crowd density & vocal pressure during headliner acts",
          "Concentrated acoustic bowl geometry limits natural dispersion",
          "Requires 8+ field teams and 4 medical stations on immediate standby",
        ],
      },
      {
        id: "smart-zone-b",
        name: "Food & Merch Concourse",
        code: "ZONE B",
        type: "mixed",
        capacity: Math.round(totalCap * 0.3),
        recommendedCctv: 8,
        recommendedMedical: 2,
        recommendedFieldTeams: 4,
        boundary: [
          [baseLat + 0.010, baseLng + 0.025],
          [baseLat + 0.010, baseLng + 0.040],
          [baseLat - 0.002, baseLng + 0.040],
          [baseLat - 0.002, baseLng + 0.025],
        ],
        rationale: [
          "High transaction flow and queue buildup between performances",
          "Clear 6-meter pedestrian pathway required for emergency vehicle bypass",
        ],
      },
      {
        id: "smart-zone-c",
        name: "Gate Ingress & Rideshare Hub",
        code: "ZONE C",
        type: "transit",
        capacity: Math.round(totalCap * 0.2),
        recommendedCctv: 6,
        recommendedMedical: 2,
        recommendedFieldTeams: 5,
        boundary: [
          [baseLat + 0.018, baseLng + 0.005],
          [baseLat + 0.018, baseLng + 0.020],
          [baseLat + 0.010, baseLng + 0.020],
          [baseLat + 0.010, baseLng + 0.005],
        ],
        rationale: [
          "Primary entry checkpoint with security turnstiles and ticket validation",
          "High egress rush expected at event conclusion (11 PM - Midnight)",
        ],
      },
    ];
  }

  if (eventType === "sports") {
    return [
      {
        id: "smart-zone-a",
        name: "Start Line & Athlete Staging",
        code: "ZONE A",
        type: "transit",
        capacity: Math.round(totalCap * 0.4),
        recommendedCctv: 10,
        recommendedMedical: 4,
        recommendedFieldTeams: 6,
        boundary: [
          [baseLat + 0.020, baseLng + 0.005],
          [baseLat + 0.020, baseLng + 0.025],
          [baseLat + 0.010, baseLng + 0.025],
          [baseLat + 0.010, baseLng + 0.005],
        ],
        rationale: [
          "High wave-start participant density prior to race launch",
          "Requires rapid bag-drop clearance and dedicated warmup corridors",
        ],
      },
      {
        id: "smart-zone-b",
        name: "Course Spectator Boulevard",
        code: "ZONE B",
        type: "mixed",
        capacity: Math.round(totalCap * 0.3),
        recommendedCctv: 8,
        recommendedMedical: 3,
        recommendedFieldTeams: 5,
        boundary: [
          [baseLat + 0.010, baseLng + 0.025],
          [baseLat + 0.010, baseLng + 0.045],
          [baseLat - 0.005, baseLng + 0.045],
          [baseLat - 0.005, baseLng + 0.025],
        ],
        rationale: [
          "Long linear spectator barrier route requiring rolling police escorts",
          "Hydration stations spaced every 2.5 km with medical bicycle patrols",
        ],
      },
      {
        id: "smart-zone-c",
        name: "Finish Line & Victory Podium",
        code: "ZONE C",
        type: "venue",
        capacity: Math.round(totalCap * 0.3),
        recommendedCctv: 12,
        recommendedMedical: 6,
        recommendedFieldTeams: 7,
        boundary: [
          [baseLat - 0.005, baseLng + 0.025],
          [baseLat - 0.005, baseLng + 0.055],
          [baseLat - 0.018, baseLng + 0.055],
          [baseLat - 0.018, baseLng + 0.025],
        ],
        rationale: [
          "Peak exhaustion zone with maximum spectator surge surrounding podium",
          "Requires 6 medical triage units and immediate ice/recovery bath access",
        ],
      },
    ];
  }

  // Default / Religious / Mass Gathering Smart Recommendation
  return [
    {
      id: "smart-zone-a",
      name: "Central Focal Sector",
      code: "ZONE A",
      type: "venue",
      capacity: Math.round(totalCap * 0.4),
      recommendedCctv: 14,
      recommendedMedical: 5,
      recommendedFieldTeams: 8,
      boundary: [
        [baseLat + 0.012, baseLng - 0.015],
        [baseLat + 0.012, baseLng + 0.006],
        [baseLat + 0.002, baseLng + 0.012],
        [baseLat - 0.006, baseLng + 0.006],
        [baseLat - 0.006, baseLng - 0.010],
      ],
      rationale: [
        "Primary event attraction with highest projected crowd concentration",
        "Multiple converging arrival streams require active inflow management",
        "Constrained egress geometry requires continuous CCTV surveillance",
      ],
    },
    {
      id: "smart-zone-b",
      name: "North Ingress & Transit Hub",
      code: "ZONE B",
      type: "transit",
      capacity: Math.round(totalCap * 0.3),
      recommendedCctv: 9,
      recommendedMedical: 3,
      recommendedFieldTeams: 5,
      boundary: [
        [baseLat + 0.038, baseLng - 0.033],
        [baseLat + 0.037, baseLng - 0.008],
        [baseLat + 0.024, baseLng - 0.001],
        [baseLat + 0.014, baseLng - 0.010],
      ],
      rationale: [
        "Major transport terminal feeding 40% of total event attendees",
        "Direct connection to northern arterial road network and shuttle loops",
      ],
    },
    {
      id: "smart-zone-c",
      name: "East Concourse & Parking",
      code: "ZONE C",
      type: "mixed",
      capacity: Math.round(totalCap * 0.15),
      recommendedCctv: 6,
      recommendedMedical: 2,
      recommendedFieldTeams: 4,
      boundary: [
        [baseLat + 0.020, baseLng + 0.024],
        [baseLat + 0.018, baseLng + 0.052],
        [baseLat + 0.005, baseLng + 0.059],
      ],
      rationale: [
        "Secondary parking feeder and support staging concourse",
        "Provides clear emergency ambulance access lane into Central Sector",
      ],
    },
    {
      id: "smart-zone-d",
      name: "South Encampment & Services",
      code: "ZONE D",
      type: "accommodation",
      capacity: Math.round(totalCap * 0.15),
      recommendedCctv: 7,
      recommendedMedical: 2,
      recommendedFieldTeams: 3,
      boundary: [
        [baseLat - 0.024, baseLng - 0.025],
        [baseLat - 0.025, baseLng + 0.003],
        [baseLat - 0.038, baseLng + 0.009],
      ],
      rationale: [
        "Rest area and long-stay visitor lodging buffer zone",
        "Low dynamic movement velocity; high overnight occupancy",
      ],
    },
  ];
}

export function evaluateResourceCoverage(
  zones: OperationalZoneDefinition[],
): {
  scores: ZoneCoverageScore[];
  gaps: ResourceGapWarning[];
  overallSystemHealthPercent: number;
} {
  const scores: ZoneCoverageScore[] = [];
  const gaps: ResourceGapWarning[] = [];

  let totalScoreSum = 0;

  zones.forEach((z) => {
    // Benchmark expectations based on zone capacity
    const reqCctv = Math.max(3, Math.round(z.capacity / 4500));
    const reqMed = Math.max(1, Math.round(z.capacity / 12000));
    const reqTeams = Math.max(2, Math.round(z.capacity / 6000));

    const cctvRatio = Math.min(100, Math.round((z.cctvCount / reqCctv) * 100));
    const medRatio = Math.min(100, Math.round((z.medicalUnitsCount / reqMed) * 100));
    const teamRatio = Math.min(100, Math.round((z.fieldTeamCount / reqTeams) * 100));

    const overall = Math.round((cctvRatio + medRatio * 1.5 + teamRatio * 1.2) / 3.7);
    const isDeficit = overall < 70;

    scores.push({
      zoneId: z.id,
      zoneName: z.name,
      cctvPercent: cctvRatio,
      medicalPercent: medRatio,
      fieldTeamPercent: teamRatio,
      overallScore: overall,
      isDeficit,
    });

    totalScoreSum += overall;

    // Generate specific gap warnings
    if (z.medicalUnitsCount < reqMed) {
      gaps.push({
        zoneId: z.id,
        zoneName: z.name,
        category: "medical",
        severity: z.medicalUnitsCount === 0 ? "critical" : "warning",
        currentCount: z.medicalUnitsCount,
        recommendedCount: reqMed,
        message: `${z.name}: Medical unit count (${z.medicalUnitsCount}) is below recommended threshold (${reqMed}).`,
        suggestedAction: `Deploy ${reqMed - z.medicalUnitsCount} additional medical first-responder team(s) to ${z.code}.`,
      });
    }

    if (z.fieldTeamCount < reqTeams) {
      gaps.push({
        zoneId: z.id,
        zoneName: z.name,
        category: "field_teams",
        severity: "warning",
        currentCount: z.fieldTeamCount,
        recommendedCount: reqTeams,
        message: `${z.name}: Field team count (${z.fieldTeamCount}) is below recommended deployment level (${reqTeams}).`,
        suggestedAction: `Assign ${reqTeams - z.fieldTeamCount} sector officer(s) to ${z.code}.`,
      });
    }
  });

  const overallSystemHealthPercent =
    zones.length > 0 ? Math.round(totalScoreSum / zones.length) : 100;

  return { scores, gaps, overallSystemHealthPercent };
}
