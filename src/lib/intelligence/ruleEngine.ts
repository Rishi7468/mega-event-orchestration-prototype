import type {
  EventConfig,
  Incident,
  SimulationPhase,
  SituationAssessment,
  SituationSeverity,
  SystemIntelligencePulse,
  TransportRoute,
  VenueGate,
  ZoneSnapshot,
} from "@/types";
import { EVENT_CONFIGS } from "@/config/eventConfigs";

export function evaluateSituationalIntelligence(
  phase: SimulationPhase,
  zoneSnapshots: ZoneSnapshot[],
  venueGates: VenueGate[],
  routes: TransportRoute[],
  incidents: Incident[],
  activeEventConfigId: string = "kumbh-mela",
): {
  assessments: SituationAssessment[];
  pulse: SystemIntelligencePulse;
} {
  const eventConfig: EventConfig =
    EVENT_CONFIGS[activeEventConfigId] ?? EVENT_CONFIGS["kumbh-mela"];

  const assessments: SituationAssessment[] = [];

  // Find most pressured zone
  const sortedSnapshots = [...zoneSnapshots].sort(
    (a, b) => b.crowdPressure - a.crowdPressure,
  );
  const highestPressured = sortedSnapshots[0];

  const gateA = venueGates.find((g) => g.id === "gate-a") ?? venueGates[0];
  const gateB = venueGates.find((g) => g.id === "gate-b") ?? venueGates[1];
  const routeS1 = routes.find((r) => r.id === "route-s1") ?? routes[0];

  // 1. RULE 1: Emerging Crowd & Gate Congestion
  if (
    highestPressured &&
    (highestPressured.crowdPressure >= eventConfig.thresholds.elevatedPressure ||
      phase === "demand-spike" ||
      phase === "prediction" ||
      phase === "recommendation" ||
      phase === "accepted")
  ) {
    const isCritical = highestPressured.crowdPressure >= eventConfig.thresholds.criticalPressure;
    const severity: SituationSeverity = isCritical ? "CRITICAL" : "HIGH";

    const centralZoneName =
      eventConfig.zones.find((z) => z.id === highestPressured.zoneId)?.name ??
      "Central Zone";
    const spareZoneName =
      eventConfig.zones.find((z) => z.id === "north")?.name ?? "North Zone";

    assessments.push({
      id: `sit-congestion-${highestPressured.zoneId}`,
      zoneId: highestPressured.zoneId,
      zoneName: centralZoneName,
      severity,
      title: `${centralZoneName} Congestion Emerging`,
      whatIsHappening: `Crowd density has reached ${highestPressured.crowdPressure}% capacity at ${centralZoneName}. Queue growth at ${gateA?.name ?? "Gate A"} is accelerating.`,
      whyItMatters: `Current arrival inflow rate exceeds turnstile throughput. Gate wait time is estimated at ${gateA?.estimatedWaitMinutes ?? 18} minutes, risking localized overflow.`,
      signals: [
        {
          metric: "Zone Crowd Pressure",
          value: `${highestPressured.crowdPressure}%`,
          trend: "UP",
        },
        {
          metric: `${gateA?.name ?? "Gate A"} Queue`,
          value: `${gateA?.currentQueue ?? 1240} visitors`,
          trend: "UP",
        },
        {
          metric: "Transit Utilization",
          value: `${highestPressured.transportUtilization}%`,
          trend: "UP",
        },
      ],
      recommendedAction: {
        id: "promote-gate-b",
        type: "redistribute",
        label: `Promote ${gateB?.name ?? "Gate B"} & Redirect Arrivals`,
        rationale: `${gateB?.name ?? "Gate B"} in ${spareZoneName} has 65% spare capacity with a ${gateB?.estimatedWaitMinutes ?? 3}-minute wait time. Diverting arriving crowds will balance inflow.`,
        expectedEffect: `Reduce ${centralZoneName} pressure by ~19 pts (from ${highestPressured.crowdPressure}% to ${Math.max(0, highestPressured.crowdPressure - 19)}%) and cut ${gateA?.name ?? "Gate A"} wait time to 6 min.`,
        target: `${gateA?.name ?? "Gate A"} & ${gateB?.name ?? "Gate B"} Transit Corridor`,
      },
      confidence: highestPressured.crowdPressure >= 85 ? 94 : 86,
      status: phase === "response" || phase === "outcome" ? "EXECUTING" : "RECOMMENDED",
      detectedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // 2. RULE 2: Transit Corridor Bottleneck
  if (routeS1 && (routeS1.congestion === "high" || routeS1.currentDemandPerHour > 3000)) {
    assessments.push({
      id: "sit-transit-bottleneck",
      zoneId: routeS1.fromZoneId,
      zoneName: eventConfig.zones.find((z) => z.id === routeS1.fromZoneId)?.name ?? "North Zone",
      severity: "MEDIUM",
      title: `${routeS1.name} Demand Surge`,
      whatIsHappening: `Transit demand on ${routeS1.name} reached ${routeS1.currentDemandPerHour.toLocaleString()} passengers/hr (${Math.round((routeS1.currentDemandPerHour / routeS1.capacityPerHour) * 100)}% route capacity).`,
      whyItMatters: `High shuttle utilization creates platform queue spillover at main transit interchanges.`,
      signals: [
        { metric: "Route Demand", value: `${routeS1.currentDemandPerHour}/hr`, trend: "UP" },
        { metric: "Route Congestion", value: routeS1.congestion.toUpperCase(), trend: "STABLE" },
      ],
      recommendedAction: {
        id: "adjust-shuttle",
        type: "transit",
        label: "Reallocate Auxiliary Shuttles to Route S3",
        rationale: "Route S3 has low congestion (1,100 demand/hr) and can absorb transferred passengers.",
        expectedEffect: "Equalize transit load and lower primary corridor congestion to MEDIUM.",
        target: "Route S1 & Route S3 Shuttle Allocation",
      },
      confidence: 89,
      status: "RECOMMENDED",
      detectedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // 3. RULE 3: Active Incidents
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  for (const incident of activeIncidents) {
    const incZoneName = eventConfig.zones.find((z) => z.id === incident.zoneId)?.name ?? incident.zoneId;
    assessments.push({
      id: `sit-incident-${incident.id}`,
      zoneId: incident.zoneId,
      zoneName: incZoneName,
      severity: incident.severity === "critical" || incident.severity === "high" ? "CRITICAL" : "HIGH",
      title: `${incident.type.toUpperCase()}: ${incident.description}`,
      whatIsHappening: `Active ${incident.severity} severity ${incident.type} incident reported in ${incZoneName}.`,
      whyItMatters: `Unresolved incidents increase localized panic and obstruct emergency egress corridors.`,
      signals: [
        { metric: "Incident Severity", value: incident.severity.toUpperCase(), trend: "UP" },
        { metric: "Response Status", value: incident.status.toUpperCase(), trend: "STABLE" },
      ],
      recommendedAction: {
        id: `dispatch-${incident.id}`,
        type: "dispatch",
        label: `Dispatch Rapid Officer Team to ${incZoneName}`,
        rationale: `Immediate field response required to resolve ${incident.type} hazard.`,
        expectedEffect: "Clear corridor hazard and restore normal crowd flow within 5 minutes.",
        target: `Sector ${incident.zoneId}`,
      },
      confidence: 96,
      status: incident.status === "responding" ? "EXECUTING" : "RECOMMENDED",
      detectedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // System Pulse Summary Calculation
  const highPriorityCount = assessments.filter(
    (a) => a.severity === "CRITICAL" || a.severity === "HIGH",
  ).length;

  const activeInterventionsCount = phase === "response" || phase === "outcome" ? 1 : 0;
  const improvingCount = phase === "outcome" ? 1 : 0;
  const worseningCount = phase === "demand-spike" ? 1 : 0;

  const overallCondition: SystemIntelligencePulse["overallCondition"] =
    assessments.some((a) => a.severity === "CRITICAL")
      ? "CRITICAL"
      : highPriorityCount > 0
        ? "ELEVATED"
        : phase === "normal"
          ? "STABLE"
          : "WATCH";

  return {
    assessments,
    pulse: {
      overallCondition,
      activeSituationsCount: assessments.length,
      highPriorityCount,
      activeInterventionsCount,
      improvingCount,
      worseningCount,
    },
  };
}
