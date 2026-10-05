export type SituationSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SituationStatus =
  | "DETECTED"
  | "RECOMMENDED"
  | "APPROVED"
  | "EXECUTING"
  | "RESOLVED";

export type SituationSignal = {
  metric: string;
  value: number | string;
  trend?: "UP" | "DOWN" | "STABLE";
};

export type SituationAction = {
  id: string;
  type: string;
  label: string;
  rationale: string;
  expectedEffect: string;
  target: string;
};

export type SituationAssessment = {
  id: string;
  zoneId: string;
  zoneName: string;
  severity: SituationSeverity;
  title: string;
  whatIsHappening: string;
  whyItMatters: string;
  signals: SituationSignal[];
  recommendedAction?: SituationAction;
  confidence: number; // Deterministic rule confidence score (0-100)
  status: SituationStatus;
  detectedAt: string;
};

export type SystemIntelligencePulse = {
  overallCondition: "STABLE" | "WATCH" | "ELEVATED" | "CRITICAL";
  activeSituationsCount: number;
  highPriorityCount: number;
  activeInterventionsCount: number;
  improvingCount: number;
  worseningCount: number;
};
