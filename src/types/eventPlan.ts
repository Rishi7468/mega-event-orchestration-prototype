import type { LatLng } from "@/data/geography";
import type { AssetType, AssetCategory, RouteType } from "@/store/eventAuthoringStore";

export type EventArchetype =
  | "marathon"
  | "music_festival"
  | "stadium"
  | "pilgrimage"
  | "parade"
  | "exhibition"
  | "fair_mela"
  | "campus"
  | "political"
  | "concert"
  | "custom";

export type AnchorType =
  | "entry"
  | "exit"
  | "checkpoint"
  | "venue_core"
  | "stage"
  | "gate"
  | "parking"
  | "transit_hub"
  | "medical_base"
  | "emergency_access"
  | "restricted_area"
  | "assembly_area"
  | "vip_zone"
  | "service_area";

export type PlacedAnchor = {
  id: string;
  name: string;
  type: AnchorType;
  lat: number;
  lng: number;
  capacity?: number;
  operatingHours?: string;
  expectedThroughputPerMin?: number;
  notes?: string;
};

export type ResourceMobilityType = "static" | "mobile";

export type ResourceStatus = "idle" | "responding" | "on_scene" | "patrolling" | "maintenance" | "active";

export type CanonicalPlacedAsset = {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  lat: number;
  lng: number;
  zoneId: string;
  h3Cell: string;
  status: ResourceStatus;
  coverageRadiusMeters: number;
  capacity?: number;
  staffCount?: number;
  operatingHours?: string;
  // Mobile Resource Extension
  mobilityType: ResourceMobilityType;
  homeBase?: string;
  currentPosition?: LatLng;
  destination?: LatLng;
  assignedTask?: string;
  etaMinutes?: number;
  teamSize?: number;
};

export type PaintAuthoringMode = "brush" | "lasso" | "trace";

export type PaintCategory =
  | "crowd"
  | "queue"
  | "restricted"
  | "medical"
  | "emergency"
  | "vip"
  | "parking"
  | "staff"
  | "custom";

export type PaintedArea = {
  id: string;
  name: string;
  category: PaintCategory;
  boundary: LatLng[];
  color: string;
  areaSqMeters: number;
  createdAt: number;
  mode?: PaintAuthoringMode;
  isDraft?: boolean;
};

export type SpatialWarning = {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  affectedSectorId?: string;
  affectedRouteId?: string;
  suggestedAction?: string;
};

export type SpatialRecommendation = {
  id: string;
  title: string;
  type: PaintCategory | AnchorType | RouteType;
  confidencePercent: number;
  reasoning: string;
  estimatedCapacity?: number;
  boundary?: LatLng[];
  location?: LatLng;
  waypoints?: LatLng[];
  status: "pending" | "applied" | "dismissed";
};

export type SpatialHealthReport = {
  score: number; // 0 - 100
  status: "optimal" | "acceptable font-bold" | "needs_attention" | "critical";
  regionCoveragePercent: number;
  emergencyPathConnectivityPercent: number;
  resourceCoveragePercent: number;
  warnings: SpatialWarning[];
  recommendations: SpatialRecommendation[];
};

export type RouteAuthoringMode = "network" | "guided" | "manual";
export type RouteDirectionMode = "one_way" | "two_way" | "reverse";

export type CanonicalPlacedRoute = {
  id: string;
  name: string;
  type: RouteType;
  waypoints: LatLng[];
  color: string;
  status: "clear" | "congested" | "blocked";
  distanceMeters?: number;
  estMinutes?: number;
  isRoutedRoad?: boolean; // distinguishes OSM routed from schematic fallback
  routeMode?: RouteAuthoringMode;
  direction?: RouteDirectionMode;
  originAnchorId?: string;
  destinationAnchorId?: string;
  originName?: string;
  destinationName?: string;
  routingProvider?: "OSRM (OpenStreetMap)" | "Snapped Road Corridor" | "Custom Waypoints";
  capacityPerHr?: number;
};

export type CanonicalOperationalZone = {
  id: string;
  name: string;
  code: string;
  type: "transit" | "venue" | "accommodation" | "mixed" | "emergency";
  capacity: number;
  currentPopulation: number;
  ingressRatePerMin: number;
  egressRatePerMin: number;
  cctvCount: number;
  fieldTeamCount: number;
  medicalUnitsCount: number;
  volunteerCount?: number;
  cctvReq?: number;
  medicalReq?: number;
  volunteerReq?: number;
  fieldReq?: number;
  priority?: "low" | "medium" | "high" | "critical";
  riskThresholdPercent?: number;
  emergencyAccess: "clear" | "constrained" | "blocked";
  riskLevel: "low" | "medium" | "high" | "critical";
  operationalState?: "normal" | "moderate" | "high_density" | "critical" | "closed";
  boundary: LatLng[];
  elevationMeters: number;
  sourcePaintCategory?: PaintCategory;
  cctvIds?: string[];
  sensorIds?: string[];
  anchorIds?: string[];
  routeIds?: string[];
  resourceIds?: string[];
  healthScore?: number; // 0 - 100
  shapeType?: "rectangle" | "circle" | "polygon";
  widthMeters?: number;
  heightMeters?: number;
  radiusMeters?: number;
  center?: LatLng;
  areaSqMeters?: number;
  description?: string;
  customColor?: string;
  colorMode?: "operational" | "custom";
  isLocked?: boolean;
  category?: "crowd" | "entry" | "exit" | "queue" | "transit" | "parking" | "medical" | "security" | "vip" | "staff" | "restricted" | "emergency";
};

export type RegionGeometryType = "polygon" | "rectangle" | "circle" | "ellipse";

export type CanonicalEventPlan = {
  profile: {
    id: string;
    name: string;
    type: EventArchetype;
    date: string;
    durationHours: number;
    expectedAttendance: number;
    peakAttendance: number;
  };

  location: {
    name: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    source: "catalog" | "geocoder" | "manual";
  };

  region: {
    geometry: LatLng[];
    geometryType: RegionGeometryType;
    areaSqKm: number;
    perimeterKm: number;
    center: LatLng;
    boundingBox: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    circleRadiusMeters?: number;
    ellipseAxesMeters?: [number, number];
    ellipseRotationDegrees?: number;
  };

  anchors: PlacedAnchor[];

  paintedAreas?: PaintedArea[];

  zones: CanonicalOperationalZone[];

  resources: CanonicalPlacedAsset[];

  routes: CanonicalPlacedRoute[];

  crowdModel: {
    densityMap: Record<string, number>; // H3 cell -> density
    highRiskAreas: string[];
  };

  riskModel: {
    overallRiskLevel: "low" | "medium" | "high" | "critical";
    riskScore: number; // 0 - 100
  };

  recommendations: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;

  visitorSignals: Array<{
    id: string;
    type: string;
    count: number;
    zoneId: string;
    timestamp: number;
  }>;

  readiness: {
    scorePercent: number;
    sectorCount: number;
    medicalCoveragePercent: number;
    cctvCoveragePercent: number;
  };

  liveState: {
    activePhase: string;
    totalVisitorsPresent: number;
    activeIncidentsCount: number;
    isPlanComplete: boolean;
  };
};

export type EventQuestionnaireAnswers = {
  expectedAttendance: number;
  peakArrivalRatePerHour: number;
  peakDepartureRatePerHour: number;
  durationHours: number;
  arrivalModes: Array<"walking" | "transit" | "vehicle" | "shuttle" | "taxi">;
  pedestrianPercentage: number;
  entranceCount: number;
  emergencyExitCount: number;
  medicalPostsRequired: number;
  securityCheckpointsRequired: number;
  vipAccessRequired: boolean;
  parkingRequired: boolean;
  transitInterfaceRequired: boolean;
  securityLevel: "standard" | "elevated" | "high" | "critical";
  crowdBehavior: "low_movement" | "moderate" | "high_movement" | "very_high_movement";
};

export type DraftOperationalPlan = {
  id: string;
  presetId: string;
  presetName: string;
  presetCategory: string;
  confidenceScorePercent: number;
  candidateZones: CanonicalOperationalZone[];
  candidateAnchors: PlacedAnchor[];
  candidateRoutes: CanonicalPlacedRoute[];
  candidateAssets: CanonicalPlacedAsset[];
  warnings: string[];
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    actionType: "add_medical" | "move_gate" | "create_egress" | "add_checkpoint";
    spatialCandidateLocation?: LatLng;
  }>;
};

export type WorkspaceState =
  | "CREATING_EVENT"
  | "LOCATION_SELECTED"
  | "DRAWING_REGION"
  | "REGION_DRAFT"
  | "REGION_CONFIRMED"
  | "PLANNING"
  | "SIMULATION"
  | "LIVE";

export type PrimitiveType =
  | "rectangle"
  | "circle"
  | "polygon"
  | "lasso"
  | "line"
  | "corridor"
  | "point";

export type CandidateStatus = "draft" | "approved" | "dismissed";

// DIGITAL TWIN EXTENSIONS

export type SensorType =
  | "cctv"
  | "crowd_counter"
  | "entry_counter"
  | "exit_counter"
  | "environmental"
  | "emergency_sensor"
  | "custom_sensor";

export type SensorEntity = {
  id: string;
  name: string;
  type: SensorType;
  lat: number;
  lng: number;
  orientationDegrees: number; // 0-360 degrees
  fieldOfViewDegrees: number; // e.g. 60
  coverageRadiusMeters: number; // e.g. 150
  status: "active" | "warning" | "offline";
  zoneId: string;
  streamStatus: "live" | "simulated" | "offline";
  peopleCount: number;
  lastUpdated: number;
};

export type SensorTelemetry = {
  sensorId: string;
  timestamp: number;
  peopleCount: number;
  confidence: number;
  zoneId: string;
};

export type LandmarkType =
  | "main_stage"
  | "food_court"
  | "fan_zone"
  | "monument"
  | "attraction"
  | "photo_point"
  | "vip_lounge"
  | "prayer_area"
  | "cultural"
  | "custom_landmark";

export type LandmarkEntity = {
  id: string;
  name: string;
  type: LandmarkType;
  lat: number;
  lng: number;
  description: string;
  imageUrl?: string;
  expectedFootfall: number;
  operatingHours?: string;
  status: "open" | "busy" | "closed";
  attractionFactor: number; // 0.1 to 2.0 multiplier for crowd flow
};

export type MobileAssetType =
  | "volunteer"
  | "medical_personnel"
  | "security_personnel"
  | "emergency_response"
  | "traffic_marshal"
  | "operations_staff"
  | "shuttle"
  | "emergency_vehicle"
  | "police_vehicle"
  | "custom_mobile";

export type MobileAsset = {
  id: string;
  name: string;
  type: MobileAssetType;
  homeBase?: LatLng;
  currentPosition: LatLng;
  destination?: LatLng;
  assignedRouteWaypoints?: LatLng[];
  currentWaypointIndex?: number;
  status: "available" | "moving" | "deployed" | "responding" | "at_incident" | "returning" | "offline";
  speedMps: number;
  headingDegrees: number;
  assignedZoneId?: string;
  assignedIncidentId?: string;
  etaSeconds?: number;
  lastUpdated: number;
};

export type InterventionRecommendation = {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  source: "PRAVAAH_AI";
  location: LatLng;
  zoneId?: string;
  proposedAction: "redirect_crowd" | "deploy_medical" | "add_cctv" | "open_gate";
  status: "pending" | "approved" | "dismissed";
};

export type InterventionLog = {
  id: string;
  timestamp: number;
  operatorName: string;
  title: string;
  actionTaken: string;
};
