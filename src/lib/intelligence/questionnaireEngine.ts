import type { LatLng } from "@/data/geography";
import type { EventType } from "@/store/eventAuthoringStore";
import type {
  EventQuestionnaireAnswers,
  DraftOperationalPlan,
  CanonicalOperationalZone,
  PlacedAnchor,
  CanonicalPlacedRoute,
  CanonicalPlacedAsset,
} from "@/types/eventPlan";

export class QuestionnaireEngine {
  /**
   * Generate default questionnaire answers tuned for event archetype
   */
  public static getDefaultAnswers(eventType: EventType, attendance: number): EventQuestionnaireAnswers {
    const isLarge = attendance > 50000;
    return {
      expectedAttendance: attendance,
      peakArrivalRatePerHour: Math.round(attendance * 0.35),
      peakDepartureRatePerHour: Math.round(attendance * 0.45),
      durationHours: eventType === "marathon" ? 6 : eventType === "music_festival" ? 12 : 8,
      arrivalModes: ["walking", "transit", "vehicle"],
      pedestrianPercentage: eventType === "religious" ? 85 : 60,
      entranceCount: isLarge ? 8 : 4,
      emergencyExitCount: isLarge ? 6 : 3,
      medicalPostsRequired: isLarge ? 4 : 2,
      securityCheckpointsRequired: isLarge ? 10 : 5,
      vipAccessRequired: ["sports", "music_festival", "concert"].includes(eventType),
      parkingRequired: true,
      transitInterfaceRequired: true,
      securityLevel: isLarge ? "high" : "standard",
      crowdBehavior: eventType === "music_festival" || eventType === "concert" ? "high_movement" : "moderate",
    };
  }

  /**
   * Generate Draft Operational Plan from Questionnaire Answers + Confirmed Region
   */
  public static generateDraftPlan(
    regionPolygon: LatLng[],
    eventType: EventType,
    answers: EventQuestionnaireAnswers,
    presetId: string = "preset-standard"
  ): DraftOperationalPlan {
    if (!regionPolygon || regionPolygon.length < 3) {
      return {
        id: `draft-${Date.now()}`,
        presetId,
        presetName: "Standard Operational Blueprint",
        presetCategory: "Standard",
        confidenceScorePercent: 50,
        candidateZones: [],
        candidateAnchors: [],
        candidateRoutes: [],
        candidateAssets: [],
        warnings: ["Region polygon is undefined or invalid."],
        recommendations: [],
      };
    }

    // Compute bounding box & center
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    regionPolygon.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;

    // 1. Candidate Operational Zones
    const candidateZones: CanonicalOperationalZone[] = [
      {
        id: `zone-ingress-${Date.now()}`,
        name: "North Ingress & Ticket Gate Zone",
        code: "ZONE-A",
        type: "transit",
        capacity: Math.round(answers.expectedAttendance * 0.35),
        currentPopulation: 0,
        ingressRatePerMin: Math.round(answers.peakArrivalRatePerHour / 60),
        egressRatePerMin: 200,
        cctvCount: 4,
        fieldTeamCount: 6,
        medicalUnitsCount: 1,
        emergencyAccess: "clear",
        elevationMeters: 0,
        boundary: [
          [maxLat, minLng],
          [maxLat, maxLng],
          [maxLat - latSpan * 0.3, maxLng],
          [maxLat - latSpan * 0.3, minLng],
        ],
        riskLevel: "medium",
      },
      {
        id: `zone-core-${Date.now()}`,
        name: "Central Event Core Arena",
        code: "ZONE-B",
        type: "venue",
        capacity: Math.round(answers.expectedAttendance * 0.5),
        currentPopulation: 0,
        ingressRatePerMin: 500,
        egressRatePerMin: 500,
        cctvCount: 8,
        fieldTeamCount: 12,
        medicalUnitsCount: 2,
        emergencyAccess: "clear",
        elevationMeters: 0,
        boundary: [
          [maxLat - latSpan * 0.3, minLng],
          [maxLat - latSpan * 0.3, maxLng],
          [minLat + latSpan * 0.3, maxLng],
          [minLat + latSpan * 0.3, minLng],
        ],
        riskLevel: answers.securityLevel === "high" || answers.securityLevel === "critical" ? "high" : "low",
      },
      {
        id: `zone-egress-${Date.now()}`,
        name: "South Egress & Transit Hub Zone",
        code: "ZONE-C",
        type: "transit",
        capacity: Math.round(answers.expectedAttendance * 0.25),
        currentPopulation: 0,
        ingressRatePerMin: 200,
        egressRatePerMin: Math.round(answers.peakDepartureRatePerHour / 60),
        cctvCount: 3,
        fieldTeamCount: 4,
        medicalUnitsCount: 1,
        emergencyAccess: "clear",
        elevationMeters: 0,
        boundary: [
          [minLat + latSpan * 0.3, minLng],
          [minLat + latSpan * 0.3, maxLng],
          [minLat, maxLng],
          [minLat, minLng],
        ],
        riskLevel: "medium",
      },
    ];

    // 2. Candidate Anchors (Gates & Medical Bases)
    const candidateAnchors: PlacedAnchor[] = [];
    const numGates = answers.entranceCount;
    for (let i = 0; i < numGates; i++) {
      const fraction = (i + 1) / (numGates + 1);
      const gateLat = maxLat;
      const gateLng = minLng + lngSpan * fraction;
      candidateAnchors.push({
        id: `gate-cand-${i + 1}`,
        name: `Gate ${String(i + 1).padStart(2, "0")} Candidate`,
        type: "gate",
        lat: gateLat,
        lng: gateLng,
        expectedThroughputPerMin: Math.round(answers.peakArrivalRatePerHour / (numGates * 60)),
      });
    }

    // Add Egress Exits
    for (let i = 0; i < answers.emergencyExitCount; i++) {
      const fraction = (i + 1) / (answers.emergencyExitCount + 1);
      candidateAnchors.push({
        id: `exit-cand-${i + 1}`,
        name: `Egress Gate ${String(i + 1).padStart(2, "0")}`,
        type: "exit",
        lat: minLat,
        lng: minLng + lngSpan * fraction,
        expectedThroughputPerMin: Math.round(answers.peakDepartureRatePerHour / (answers.emergencyExitCount * 60)),
      });
    }

    // 3. Candidate Routes (strictly contained within region boundary)
    const candidateRoutes: CanonicalPlacedRoute[] = [
      {
        id: `route-evac-01`,
        name: "Primary Emergency Evacuation Spine",
        type: "evacuation",
        waypoints: [
          [centerLat, centerLng],
          [centerLat, minLng + lngSpan * 0.1],
        ],
        distanceMeters: Math.round(lngSpan * 0.4 * 111000),
        color: "#ef4444",
        status: "clear",
      },
      {
        id: `route-ingress-01`,
        name: "Main Crowd Ingress Corridor",
        type: "entry",
        waypoints: [
          [maxLat - latSpan * 0.05, centerLng],
          [centerLat, centerLng],
        ],
        distanceMeters: Math.round(latSpan * 0.45 * 111000),
        color: "#3b82f6",
        status: "clear",
      },
    ];

    // 4. Candidate Assets (Medical & Security)
    const candidateAssets: CanonicalPlacedAsset[] = [];
    for (let i = 0; i < answers.medicalPostsRequired; i++) {
      const offsetLat = (i % 2 === 0 ? 1 : -1) * (latSpan * 0.2);
      const offsetLng = (i < 2 ? -1 : 1) * (lngSpan * 0.25);
      candidateAssets.push({
        id: `asset-med-${i + 1}`,
        name: `Medical First-Aid Post ${i + 1}`,
        type: "medical",
        category: "medical",
        lat: centerLat + offsetLat,
        lng: centerLng + offsetLng,
        zoneId: candidateZones[1].id,
        h3Cell: "8928308280fffff",
        status: "active",
        coverageRadiusMeters: 300,
        capacity: 100,
        staffCount: 4,
        mobilityType: "static",
      });
    }

    // Security Checkpoints
    for (let i = 0; i < Math.min(6, answers.securityCheckpointsRequired); i++) {
      const fraction = (i + 1) / 7;
      candidateAssets.push({
        id: `asset-sec-${i + 1}`,
        name: `Security Screening Post ${i + 1}`,
        type: "checkpoint",
        category: "safety",
        lat: maxLat - latSpan * 0.1,
        lng: minLng + lngSpan * fraction,
        zoneId: candidateZones[0].id,
        h3Cell: "8928308280fffff",
        status: "active",
        coverageRadiusMeters: 150,
        staffCount: 6,
        mobilityType: "static",
      });
    }

    // Warnings & Recommendations
    const warnings: string[] = [];
    const recommendations: DraftOperationalPlan["recommendations"] = [];

    if (answers.peakDepartureRatePerHour > answers.emergencyExitCount * 3000) {
      warnings.push(`Projected peak departure (${answers.peakDepartureRatePerHour.toLocaleString()}/hr) exceeds planned egress exit capacity.`);
      recommendations.push({
        id: "rec-egress-01",
        title: "Add Secondary South Egress Gate",
        description: "Increase departure throughput by placing an additional 3,000/hr egress gate in South Zone.",
        actionType: "create_egress",
        spatialCandidateLocation: [minLat, centerLng],
      });
    }

    if (answers.medicalPostsRequired < 3 && answers.expectedAttendance > 40000) {
      warnings.push("Medical posts are sparse for expected attendance > 40,000.");
      recommendations.push({
        id: "rec-med-01",
        title: "Deploy Central Emergency Medical Post",
        description: "Add 1 additional rapid-response medical post in Arena Core.",
        actionType: "add_medical",
        spatialCandidateLocation: [centerLat, centerLng],
      });
    }

    return {
      id: `draft-plan-${Date.now()}`,
      presetId,
      presetName: `${eventType.toUpperCase()} Blueprint`,
      presetCategory: answers.securityLevel.toUpperCase(),
      confidenceScorePercent: 91,
      candidateZones,
      candidateAnchors,
      candidateRoutes,
      candidateAssets,
      warnings,
      recommendations,
    };
  }
}
