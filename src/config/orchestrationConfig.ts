/**
 * Centralized Configuration for the Mega-Event Orchestration Engine.
 * 
 * Extracts magic numbers, operational thresholds, and redistribution parameters
 * into a single configurable seam for rapid hackathon adaptation.
 */

export const orchestrationConfig = {
  thresholds: {
    crowdElevated: 70,
    crowdCritical: 85,
    transportHigh: 80,
    transportModerate: 70,
    gateWaitElevatedMinutes: 15,
  },
  prediction: {
    linearRatePerMin: 0.6,
  },
  redistribution: {
    pressuredZoneId: "central",
    spareZoneId: "north",
    centralPressureDelta: -19,
    northPressureDelta: 11,
    transportUtilDelta: -20,
    gateAWaitDelta: -12,
    gateBWaitDelta: 2,
    routeS1UtilDelta: -20,
    routeS3UtilDelta: 12,
  },
} as const;
