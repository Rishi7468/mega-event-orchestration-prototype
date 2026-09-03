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
