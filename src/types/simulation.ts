/**
 * The demo story is a deterministic walk through these phases, in order.
 * See docs/12_SIMULATION_ENGINE.md — no uncontrolled randomness.
 */
export type SimulationPhase =
  | "normal"
  | "demand-spike"
  | "prediction"
  | "recommendation"
  | "accepted"
  | "response"
  | "outcome";

export type ZoneSnapshot = {
  zoneId: string;
  accommodationPressure: number;
  crowdPressure: number;
  transportUtilization: number;
};

export type OutcomeMetric = {
  label: string;
  before: string;
  after: string;
};

export type ActiveIntervention = {
  id: string;
  type: string;
  title: string;
  target: string;
  initiatedAt: string;
  status: "active" | "completed";
};

export type MetricDelta = {
  pressuredZoneId: string;
  pressuredZoneName: string;
  pressuredBefore: number;
  pressuredAfter: number;
  pressuredDelta: number;
  spareZoneId: string;
  spareZoneName: string;
  spareBefore: number;
  spareAfter: number;
  spareDelta: number;
  transportBefore: number;
  transportAfter: number;
  transportDelta: number;
  gateAWaitBefore?: number;
  gateAWaitAfter?: number;
};

export type MetricSnapshot = {
  zoneSnapshots: ZoneSnapshot[];
};

export type Measurement = {
  id: string;
  interventionId: string;
  interventionTitle: string;
  timestamp: string;
  before: MetricSnapshot;
  after: MetricSnapshot;
  impact: MetricDelta;
};

