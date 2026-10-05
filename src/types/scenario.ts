import type { SimulationState } from "@/store/simulationStore";

export type InterventionOutcomeStatus =
  | "effective"
  | "insufficient"
  | "worsening"
  | "evaluating";

export type ScenarioStep = {
  id: string;
  label: string;
  durationMs: number;
  patch: Partial<SimulationState>;
  description?: string;
};

export type EventScenario = {
  id: string;
  name: string;
  description: string;
  category: "congestion" | "facility" | "incident" | "stress_test";
  steps: ScenarioStep[];
};

export type ScenarioPlaybackState = {
  activeScenarioId: string | null;
  currentStepIndex: number;
  isPlaying: boolean;
  totalSteps: number;
};
