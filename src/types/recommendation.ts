export type Audience = "visitor" | "operator";
export type Confidence = "low" | "medium" | "high";

export type RecommendationType =
  | "accommodation"
  | "route"
  | "timing"
  | "transport"
  | "venue"
  | "operations";

export type Recommendation = {
  id: string;
  audience: Audience;
  type: RecommendationType;
  title: string;
  reason: string[];
  expectedImpact: string;
  confidence: Confidence;
};

export type IncidentType = "crowd" | "medical" | "traffic" | "security";
export type IncidentStatus = "open" | "responding" | "resolved";

export type Incident = {
  id: string;
  type: IncidentType;
  zoneId: string;
  severity: "low" | "medium" | "high" | "critical";
  status: IncidentStatus;
  description: string;
};

export type AlertTone = "info" | "advisory" | "critical";

export type Alert = {
  id: string;
  audience: Audience;
  tone: AlertTone;
  title: string;
  message: string;
  createdAt: string;
};
