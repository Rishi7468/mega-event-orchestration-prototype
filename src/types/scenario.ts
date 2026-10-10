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
  historicalTimestamp?: string;
  replayTimeSeconds?: number;
  provenance?: "REAL SOURCE DATA" | "DERIVED" | "REPLAY SIMULATED" | "THRESHOLD TRIGGER" | "UNAVAILABLE";
  isWarningStep?: boolean;
  isPeakStep?: boolean;
  warningTime?: string;
  projectedPeakTime?: string;
  historicalFact?: string;
  simulatedInputNote?: string;
  canonicalRecordId?: string;
  measurementNote?: string;
};

export type EventScenario = {
  id: string;
  name: string;
  description: string;
  category: "congestion" | "facility" | "incident" | "stress_test" | "historical_replay";
  totalDurationSeconds?: number;
  isHistoricalReplay?: boolean;
  sourceManifestId?: string;
  warningTime?: string;
  projectedPeakTime?: string;
  steps: ScenarioStep[];
};

export type ScenarioPlaybackState = {
  activeScenarioId: string | null;
  currentStepIndex: number;
  isPlaying: boolean;
  totalSteps: number;
};
