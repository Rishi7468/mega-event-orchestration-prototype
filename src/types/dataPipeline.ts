import type { LatLng } from "@/data/geography";

export type SourceStatus = "LIVE" | "SIMULATED" | "ESTIMATED" | "DELAYED" | "UNAVAILABLE";

export type SourceCategory =
  | "cctv"
  | "drone"
  | "public_camera"
  | "social_video"
  | "manual_report"
  | "iot_sensor"
  | "gps"
  | "simulation";

export type AuthorizationStatus =
  | "authorized_event"
  | "venue_owned"
  | "municipal_partnership"
  | "security_contractor"
  | "public_camera"
  | "unverified";

export type DataSource = {
  id: string;
  name: string;
  type: SourceCategory;
  status: SourceStatus;
  authorizationStatus: AuthorizationStatus;
  lat: number;
  lng: number;
  zoneIds: string[];
  coverageRadiusMeters: number;
  fovDegrees: number;
  orientationDegrees: number;
  provider: string;
  sourceUrl?: string;
  lastUpdated: number;
  freshnessSec: number;
  confidencePercent: number;
  peopleCount: number;
  detectionModel: string;
  trackingEngine: string;
  sampleFrameUrl?: string;
};

export interface VideoSourceAdapter {
  id: string;
  name: string;
  streamType: "RTSP" | "HLS" | "WebRTC" | "MP4" | "PUBLIC_CAMERA" | "YOUTUBE" | "DRONE" | "SIMULATION";
  connect(): Promise<boolean>;
  getLatestFrame(): { frameData: string; timestamp: number };
  disconnect(): void;
}

export interface VisionAnalyticsAdapter {
  modelName: string;
  processFrame(frameData: string): {
    peopleCount: number;
    densityGrade: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    flowVector: { dx: number; dy: number };
    confidence: number;
  };
}

export type ZoneTelemetry = {
  zoneId: string;
  timestamp: number;
  occupancy: number;
  capacity: number;
  utilizationPercent: number;
  densityGrade: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  densityTrendPercent: number;
  ingressRatePerMin: number;
  egressRatePerMin: number;
  averageDwellTimeMin: number;
  riskScore: number;
  confidencePercent: number;
  sourceIds: string[];
};

export type GateTelemetry = {
  anchorId: string;
  name: string;
  entriesPerMin: number;
  exitsPerMin: number;
  queueEstimate: number;
  throughputCapacityPerMin: number;
  isBottleneck: boolean;
};

export type RouteTelemetry = {
  routeId: string;
  name: string;
  capacityPerMin: number;
  currentFlowPerMin: number;
  status: "CLEAR" | "CONGESTED" | "OVERLOADED" | "BLOCKED";
  estTravelTimeMin: number;
};

export type EvidenceItem = {
  sourceId: string;
  sourceName: string;
  metric: string;
  value: string;
  freshness: string;
  confidence: number;
};

export type CandidatePath = {
  id: string;
  name: string;
  type: "FASTEST" | "SAFEST" | "LOWEST_DENSITY" | "EMERGENCY" | "ACCESSIBLE";
  etaMinutes: number;
  currentDensity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  projectedDensity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  waypoints: LatLng[];
  viaZoneNames: string[];
};

export type PredictiveStateForecast = {
  horizonMinutes: number; // 5, 10, 20
  projectedOccupancy: number;
  projectedUtilizationPercent: number;
  isBreachPredicted: boolean;
  predictedBreachTimeMinutes?: number;
};

export type InterventionEffect = {
  recommendationId: string;
  targetZoneId: string;
  beforeUtilizationPercent: number;
  afterUtilizationPercent: number;
  beforeRiskLevel: string;
  afterRiskLevel: string;
  projectedQueueBefore: number;
  projectedQueueAfter: number;
  emergencyAccessStatus: "MAINTAINED" | "ENHANCED" | "CONSTRAINED";
  timestamp: number;
};
