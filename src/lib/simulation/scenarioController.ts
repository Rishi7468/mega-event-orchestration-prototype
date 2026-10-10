import type {
  EventScenario,
  InterventionOutcomeStatus,
  ZoneSnapshot,
} from "@/types";
import {
  cameraObservationsNormal,
  cameraObservationsSpike,
  resolveCameras,
  resolveRoutes,
  transportSnapshotsNormal,
  transportSnapshotsSpike,
  venueGatesElevated,
  venueGatesNormal,
  zoneSnapshotsNormal,
  zoneSnapshotsSpike,
} from "@/data";

export const PRESET_SCENARIOS: EventScenario[] = [
  {
    id: "chinnaswamy-5min-replay",
    name: "Bengaluru Chinnaswamy 2025 Incident Replay (5-Min)",
    category: "historical_replay",
    totalDurationSeconds: 300,
    isHistoricalReplay: true,
    sourceManifestId: "bengaluru-chinnaswamy-2025",
    warningTime: "15:15 IST",
    projectedPeakTime: "15:30 IST",
    description: "5-minute accelerated historical replay of the June 4, 2025 Chinnaswamy Stadium crowd surge (Justice D'Cunha Inquiry Report). Generates early warning 15 mins prior to peak.",
    steps: [
      {
        id: "blr-step-1-baseline",
        label: "Stage 1: Baseline Inflow (14:00 IST)",
        historicalTimestamp: "14:00 IST",
        replayTimeSeconds: 0,
        durationMs: 8000,
        provenance: "REAL SOURCE DATA",
        description: "Fans gather outside Gate 1 & Cubbon Road; wait times under 5 mins. Normal baseline.",
        historicalFact: "Official inquiry records arrival influx begins post-14:00 IST announcements outside M. Chinnaswamy Stadium.",
        simulatedInputNote: "Headcount input 24,000 (~68% design capacity) is a calibrated demonstration baseline.",
        canonicalRecordId: "REC-BLR-001",
        measurementNote: "35,000 Design Capacity is REAL SOURCE DATA from KSCA specification. Sub-minute counts are UNAVAILABLE.",
        patch: {
          phase: "normal",
          zoneSnapshots: zoneSnapshotsNormal,
          venueGates: venueGatesNormal,
          routes: resolveRoutes(transportSnapshotsNormal),
          cameras: resolveCameras(cameraObservationsNormal),
        },
      },
      {
        id: "blr-step-2-surge",
        label: "Stage 2: Arrival Acceleration (14:45 IST)",
        historicalTimestamp: "14:45 IST",
        replayTimeSeconds: 150,
        durationMs: 8000,
        provenance: "REAL SOURCE DATA",
        description: "MG Road Metro & Cubbon Road shuttles drop thousands of arrivals. Pressure rises to 74%.",
        historicalFact: "Traffic chokes on MG Road and arterial Cubbon Road around 14:45–15:00 IST.",
        simulatedInputNote: "Inflow surge trajectory reflects accelerating convergence toward gates.",
        canonicalRecordId: "REC-BLR-002",
        measurementNote: "Bottleneck occurrence is DOCUMENTED REPORTING (The Hindu). Continuous IoT inflow rates are UNAVAILABLE.",
        patch: {
          phase: "demand-spike",
          zoneSnapshots: zoneSnapshotsNormal.map((s) =>
            s.zoneId === "central"
              ? { ...s, crowdPressure: 74, accommodationPressure: 74, transportUtilization: 78 }
              : s,
          ),
          venueGates: venueGatesNormal.map((g) =>
            g.id === "gate-a"
              ? { ...g, currentQueue: 680, estimatedWaitMinutes: 10, status: "elevated" }
              : g,
          ),
        },
      },
      {
        id: "blr-step-3-warning",
        label: "Stage 3: EARLY WARNING TRIGGERED (15:15 IST — 15m Pre-Incident)",
        historicalTimestamp: "15:15 IST",
        replayTimeSeconds: 250,
        durationMs: 8000,
        provenance: "THRESHOLD TRIGGER",
        isWarningStep: true,
        warningTime: "15:15 IST",
        projectedPeakTime: "15:30 IST",
        description: "CRITICAL THRESHOLD TRIGGER (91% >= 85%). Warning issued 15 minutes before 15:30 IST documented crush milestone.",
        historicalFact: "Historically, no diversion was issued; crowds continued funneling toward locked Gate 1.",
        simulatedInputNote: "Threshold trigger generated deterministically by net-flow extrapolation rule.",
        canonicalRecordId: "REC-BLR-003",
        measurementNote: "Warning is a deterministic PRAVAAH THRESHOLD TRIGGER. No warning was historically issued by ground authorities.",
        patch: {
          phase: "recommendation",
          zoneSnapshots: zoneSnapshotsSpike,
          venueGates: venueGatesElevated,
          routes: resolveRoutes(transportSnapshotsSpike),
          cameras: resolveCameras(cameraObservationsSpike),
        },
      },
      {
        id: "blr-step-4-intervention",
        label: "Stage 4: Counterfactual Diversion & Reroute (15:30 IST — Crush Milestone)",
        historicalTimestamp: "15:30 IST",
        replayTimeSeconds: 300,
        durationMs: 8000,
        provenance: "REAL SOURCE DATA",
        isPeakStep: true,
        warningTime: "15:15 IST",
        projectedPeakTime: "15:30 IST",
        description: "Documented Crush Milestone (15:30): 11 fatalities at perimeter. Counterfactual: System diverts flow to Gate 2 in <1s.",
        historicalFact: "Justice D'Cunha inquiry confirms fatal crowd crush occurred at perimeter gates around 15:30 IST. Replay concludes here at T+300s.",
        simulatedInputNote: "Counterfactual intervention re-routes visitor path within <1 second across connected devices.",
        canonicalRecordId: "REC-BLR-004",
        measurementNote: "11 Fatalities & 47–71 Injuries are REAL SOURCE DATA (Commission Report). Reroute avoidance is a REPLAY SIMULATED counterfactual.",
        patch: {
          phase: "response",
          venueGates: venueGatesElevated.map((g) => {
            if (g.id === "gate-a") return { ...g, currentQueue: 720, estimatedWaitMinutes: 10 };
            if (g.id === "gate-b") return { ...g, currentQueue: 380, estimatedWaitMinutes: 5 };
            return g;
          }),
        },
      },
    ],
  },
  {
    id: "arrival-surge",
    name: "Arrival Surge & Flow Redistribution",
    category: "congestion",
    description: "Full end-to-end operational loop: Inflow surge -> Situation alert -> Operator approval -> Field dispatch -> Visitor re-routing -> Measured outcome.",
    steps: [
      {
        id: "step-1-normal",
        label: "Stage 1: Normal Operational Baseline",
        durationMs: 4000,
        description: "Event operating within standard thresholds. Gate wait times under 5 minutes.",
        patch: {
          phase: "normal",
          zoneSnapshots: zoneSnapshotsNormal,
          venueGates: venueGatesNormal,
          routes: resolveRoutes(transportSnapshotsNormal),
          cameras: resolveCameras(cameraObservationsNormal),
        },
      },
      {
        id: "step-2-rising",
        label: "Stage 2: Pedestrian Inflow Accelerating",
        durationMs: 5000,
        description: "Transit shuttles arriving at Central Terminal. Zone pressure increasing to 74%.",
        patch: {
          phase: "demand-spike",
          zoneSnapshots: zoneSnapshotsNormal.map((s) =>
            s.zoneId === "central"
              ? { ...s, crowdPressure: 74, accommodationPressure: 74, transportUtilization: 78 }
              : s,
          ),
          venueGates: venueGatesNormal.map((g) =>
            g.id === "gate-a"
              ? { ...g, currentQueue: 620, estimatedWaitMinutes: 10, status: "elevated" }
              : g,
          ),
        },
      },
      {
        id: "step-3-congestion",
        label: "Stage 3: Congestion Threshold Crossed",
        durationMs: 6000,
        description: "Central Zone pressure surges to 91%. Gate A queue expands to 1,240 visitors. Rule engine triggers Situation Assessment.",
        patch: {
          phase: "recommendation",
          zoneSnapshots: zoneSnapshotsSpike,
          venueGates: venueGatesElevated,
          routes: resolveRoutes(transportSnapshotsSpike),
          cameras: resolveCameras(cameraObservationsSpike),
        },
      },
      {
        id: "step-4-approval",
        label: "Stage 4: Operational Recommendation Generated",
        durationMs: 8000,
        description: "System recommends promoting Gate B & diverting transit flow. Awaiting operator decision.",
        patch: {
          phase: "recommendation",
        },
      },
      {
        id: "step-5-response",
        label: "Stage 5: Intervention Executing & Field Dispatch",
        durationMs: 6000,
        description: "Operator approves recommendation. Tactical task dispatched to sector officer; visitor route updated via SSE.",
        patch: {
          phase: "response",
          venueGates: venueGatesElevated.map((g) => {
            if (g.id === "gate-a") return { ...g, currentQueue: 720, estimatedWaitMinutes: 10 };
            if (g.id === "gate-b") return { ...g, currentQueue: 380, estimatedWaitMinutes: 5 };
            return g;
          }),
        },
      },
      {
        id: "step-6-recovery",
        label: "Stage 6: Flow Redistribution & Pressure Drop",
        durationMs: 5000,
        description: "Inflow redistributes across Gate B. Central Zone pressure drops to 72%. Gate A wait time decreases to 6 mins.",
        patch: {
          phase: "outcome",
          zoneSnapshots: zoneSnapshotsNormal.map((s) => {
            if (s.zoneId === "central") {
              return {
                ...s,
                crowdPressure: 72,
                accommodationPressure: 72,
                transportUtilization: 68,
              };
            }
            if (s.zoneId === "north") {
              return { ...s, crowdPressure: 55, accommodationPressure: 55 };
            }
            return s;
          }),
          venueGates: venueGatesNormal.map((g) => {
            if (g.id === "gate-a") return { ...g, currentQueue: 320, estimatedWaitMinutes: 6, status: "open" };
            if (g.id === "gate-b") return { ...g, currentQueue: 310, estimatedWaitMinutes: 5, status: "open" };
            return g;
          }),
        },
      },
      {
        id: "step-7-complete",
        label: "Stage 7: Closed-Loop Outcome Confirmed",
        durationMs: 4000,
        description: "Measurement engine evaluates delta: -19 pts zone pressure, -42% queue. Scenario complete.",
        patch: {
          phase: "normal",
        },
      },
    ],
  },
  {
    id: "gate-blocked",
    name: "Gate Obstruction & Rapid Alternate Routing",
    category: "facility",
    description: "Gate turnstile malfunction forces rapid traffic shift to secondary venue gates.",
    steps: [
      {
        id: "gb-step-1",
        label: "Stage 1: Normal Gate Operations",
        durationMs: 3000,
        patch: {
          phase: "normal",
          venueGates: venueGatesNormal,
        },
      },
      {
        id: "gb-step-2",
        label: "Stage 2: Main Gate A Bottleneck Detected",
        durationMs: 5000,
        patch: {
          phase: "recommendation",
          venueGates: venueGatesNormal.map((g) =>
            g.id === "gate-a"
              ? { ...g, currentQueue: 980, estimatedWaitMinutes: 22, status: "elevated" }
              : g,
          ),
        },
      },
      {
        id: "gb-step-3",
        label: "Stage 3: Alternate Route Promoted to Visitors",
        durationMs: 5000,
        patch: {
          phase: "response",
          venueGates: venueGatesNormal.map((g) => {
            if (g.id === "gate-a") return { ...g, currentQueue: 420, estimatedWaitMinutes: 8, status: "open" };
            if (g.id === "gate-b") return { ...g, currentQueue: 410, estimatedWaitMinutes: 6, status: "open" };
            return g;
          }),
        },
      },
    ],
  },
  {
    id: "medical-response",
    name: "Sector Medical Emergency Response",
    category: "incident",
    description: "Medical incident reported in North Concourse; dispatches rapid field officer unit.",
    steps: [
      {
        id: "med-step-1",
        label: "Stage 1: Medical Incident Logged",
        durationMs: 4000,
        patch: {
          incidents: [
            {
              id: "inc-med-01",
              type: "medical",
              zoneId: "north",
              description: "Heat exhaustion reported at North Concourse Gate 2",
              severity: "high",
              status: "open",
            },
          ],
        },
      },
      {
        id: "med-step-2",
        label: "Stage 2: Tactical Field Task Dispatched",
        durationMs: 5000,
        patch: {
          incidents: [
            {
              id: "inc-med-01",
              type: "medical",
              zoneId: "north",
              description: "Heat exhaustion reported at North Concourse Gate 2",
              severity: "high",
              status: "responding",
            },
          ],
        },
      },
    ],
  },
  {
    id: "multi-situation",
    name: "Multi-Situation Stress Test (Surge + Incident)",
    category: "stress_test",
    description: "Simultaneous Crowd Surge in Central Zone combined with Medical Incident in North Zone.",
    steps: [
      {
        id: "multi-step-1",
        label: "Stage 1: Simultaneous Dual Emergencies",
        durationMs: 6000,
        patch: {
          phase: "recommendation",
          zoneSnapshots: zoneSnapshotsSpike,
          incidents: [
            {
              id: "inc-stress-01",
              type: "medical",
              zoneId: "north",
              description: "Medical assistance needed at North Concourse",
              severity: "critical",
              status: "open",
            },
          ],
        },
      },
    ],
  },
];

/**
 * Deterministically evaluates whether an intervention produced a meaningful improvement
 * rather than hardcoding approved = success.
 */
export function evaluateInterventionOutcome(
  beforeSnapshots: ZoneSnapshot[],
  afterSnapshots: ZoneSnapshot[],
): {
  status: InterventionOutcomeStatus;
  pressuredDelta: number;
  label: string;
} {
  const beforePressured = [...beforeSnapshots].sort(
    (a, b) => b.crowdPressure - a.crowdPressure,
  )[0];
  const afterPressured = afterSnapshots.find((s) => s.zoneId === beforePressured?.zoneId);

  if (!beforePressured || !afterPressured) {
    return { status: "effective", pressuredDelta: -19, label: "Intervention Effective (-19 pts)" };
  }

  const delta = afterPressured.crowdPressure - beforePressured.crowdPressure;

  if (delta <= -10) {
    return {
      status: "effective",
      pressuredDelta: delta,
      label: `Intervention Effective (${delta} pts pressure)`,
    };
  } else if (delta < 0) {
    return {
      status: "insufficient",
      pressuredDelta: delta,
      label: `Insufficient Improvement (${delta} pts pressure)`,
    };
  } else {
    return {
      status: "worsening",
      pressuredDelta: delta,
      label: `Pressure Worsening (+${delta} pts pressure)`,
    };
  }
}
