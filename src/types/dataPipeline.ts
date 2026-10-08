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

export type CrowdLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type CrowdTrendDirection = "INCREASING" | "STABLE" | "DECREASING";

export type ZoneCrowdState = {
  zoneId: string;
  peopleCount: number;
  occupancyPercent: number;
  densityPerSqMeter: number;
  crowdLevel: CrowdLevel;
  trend: CrowdTrendDirection;
  confidencePercent: number;
  lastUpdated: string;
  source: "CV" | "SIMULATED";
  anonymousTrackIds?: string[];
};

export type TrackObservation = {
  trackId: string;
  zoneId: string;
  position: LatLng;
  timestamp: number;
  velocityVector?: { dx: number; dy: number };
  heading?: string; // "NORTH" | "SOUTH" | "EAST" | "WEST" | "NORTHEAST" | "NORTHWEST" | "SOUTHEAST" | "SOUTHWEST" | "STATIONARY"
};

export type ZoneFlowState = {
  zoneId: string;
  incomingFlowPerMin: number;
  outgoingFlowPerMin: number;
  netAccumulationPerMin: number;
  dominantDirection: string; // e.g. "NORTH", "SOUTH", "EAST", "WEST", "NORTHEAST"
  flowTrend: CrowdTrendDirection;
  topIncoming: Array<{ sourceZoneId: string; flowPerMin: number }>;
  topOutgoing: Array<{ targetZoneId: string; flowPerMin: number }>;
  lastUpdated: string;
};

export type CrowdFlowEdge = {
  id: string; // e.g. "central->north"
  sourceZoneId: string;
  targetZoneId: string;
  peoplePerMinute: number;
  trend: CrowdTrendDirection;
  confidencePercent: number;
  lastUpdated: string;
  active: boolean;
};

export type CrowdFlowGraph = {
  edges: CrowdFlowEdge[];
  zoneFlows: Record<string, ZoneFlowState>;
  windowSeconds: number; // default rolling window (e.g. 60s)
  lastUpdated: string;
};

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

export type ZonePredictionState = {
  zoneId: string;
  currentPeopleCount: number;
  capacity: number;
  currentOccupancyPercent: number;
  currentCrowdLevel: CrowdLevel;

  incomingFlowPerMin: number;
  outgoingFlowPerMin: number;
  netAccumulationPerMin: number;
  flowTrend: CrowdTrendDirection;

  predictedOccupancyPercent: number; // e.g. 15m forecast
  predictedCrowdLevel: CrowdLevel;

  timeToHighMinutes: number | null;
  timeToCriticalMinutes: number | null;

  predictionConfidence: number; // 0 - 100%
  lastUpdated: string;

  recommendation: {
    actionNeeded: boolean;
    text: string;
    urgency: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    explainability: string;
  };

  whatIfIntervention?: {
    incomingFlowReductionPercent: number; // e.g. 30%
    mitigatedTimeToCriticalMinutes: number | null;
    mitigatedPredictedLevel: CrowdLevel;
    explanation: string;
  };
};

export type CrowdPredictionForecast = {
  horizonMinutes: number; // default 15
  zonePredictions: Record<string, ZonePredictionState>;
  lastUpdated: string;
};

// ==========================================
// PHASE 5: EVENT-AWARE ROUTING CONTRACTS
// ==========================================

export type EventAwareRouteCandidate = {
  id: string;
  name: string;
  originZoneId: string;
  destinationZoneId: string;
  waypoints: [number, number][]; // [lat, lng] array for Leaflet rendering
  zonePath: string[]; // List of zone IDs traversed e.g. ["south", "central"]
  distanceMeters: number;
  baseEtaMinutes: number;
  effectiveEtaMinutes: number;

  // Cost Breakdown
  travelTimeCost: number;
  currentCrowdPenalty: number;
  predictedCongestionPenalty: number;
  incidentPenalty: number;
  totalRouteCost: number;

  dominantCrowdLevel: CrowdLevel;
  predictedRiskLevel: CrowdLevel;
  status: "recommended" | "alternative" | "congested";
  explanation: string;
};

export type EventAwareRoutingResult = {
  originZoneId: string;
  destinationZoneId: string;
  recommendedRoute: EventAwareRouteCandidate;
  candidates: EventAwareRouteCandidate[];
  lastUpdated: string;
};

// ==========================================
// PHASE 6: DYNAMIC LIVE REROUTING CONTRACTS
// ==========================================

export type ActiveJourneyState = {
  journeyActive: boolean;
  originZoneId: string;
  destinationZoneId: string;
  currentRoute: EventAwareRouteCandidate | null;
  startedAt: string | null;
  currentRouteCost: number;
  lastEvaluatedAt: string | null;

  rerouteAvailable: boolean;
  rerouteReason: string | null;
  pendingAlternativeRoute: EventAwareRouteCandidate | null;
  lastRerouteTimestamp: number;
  userAcceptedRerouteCount: number;
};

// ==========================================
// PHASE 7: DYNAMIC MULTI-STOP ITINERARY CONTRACTS
// ==========================================

export type ItineraryPreferences = {
  avoidCrowds: boolean;
  minimizeWalking: boolean;
  maximizeAttractions: boolean;
};

export type ItineraryStop = {
  stepNumber: number;
  landmarkId: string;
  name: string;
  zoneId: string;
  coordinates: [number, number];
  estimatedArrival: string;
  estimatedDeparture: string;
  dwellMinutes: number;
  expectedWaitMinutes: number;
  crowdLevel: CrowdLevel;
  predictedRisk: CrowdLevel;
  legFromPrevious?: EventAwareRouteCandidate;
  completed: boolean;
};

export type MultiStopOptimizerResult = {
  stops: ItineraryStop[];
  totalDurationMinutes: number;
  totalTravelMinutes: number;
  totalWaitMinutes: number;
  fittedCount: number;
  totalRequestedCount: number;
  overallScore: number;
  explanation: string;
  generatedAt: string;
};

export type ActiveItineraryState = {
  active: boolean;
  startZoneId: string;
  availableTimeMinutes: number;
  selectedLandmarkIds: string[];
  preferences: ItineraryPreferences;
  result: MultiStopOptimizerResult | null;
  reorderAvailable: boolean;
  reorderReason: string | null;
  pendingResult: MultiStopOptimizerResult | null;
  lastEvaluatedTimestamp: number;
  userAcceptedReorderCount: number;
};

export type {
  PedestrianNode,
  PedestrianEdge,
  EdgeCrowdState,
  PedestrianGraph,
} from "@/lib/graph/pedestrianGraph";
