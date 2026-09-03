export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Trend = "rising" | "stable" | "falling";
export type QualityLevel = "poor" | "moderate" | "good" | "excellent";

export type ZoneType = "accommodation" | "venue" | "mixed" | "transit";

export type Zone = {
  id: string;
  name: string;
  type: ZoneType;
  capacity: number;
  currentPopulation: number;
  inflowPerMinute: number;
  outflowPerMinute: number;
  pressurePercent: number;
  risk: RiskLevel;
};

export type AccommodationZone = {
  zoneId: string;
  totalRooms: number;
  availableRooms: number;
  averagePrice: number;
  demandTrend: Trend;
  venueTravelMinutes: number;
  transportQuality: QualityLevel;
  crowdLevel: RiskLevel;
};

/**
 * Simulated demo review data. These are not real guest reviews and no review
 * platform is integrated — the UI labels them as demo data wherever they are
 * shown. They exist so accommodation reads like a real planning product, and
 * they carry only a modest weight when picking a property *within* a zone;
 * which zone to stay in stays an orchestration decision.
 */
export type PropertyReviews = {
  /** 0–5. */
  score: number;
  count: number;
  /** One representative simulated comment. */
  quote: string;
};

export type Property = {
  id: string;
  name: string;
  /** Fictional demo brand — no real hotel company is represented here. */
  brand: string;
  zoneId: string;
  pricePerNight: number;
  availableRooms: number;
  totalRooms: number;
  distanceFromVenueKm: number;
  /** Walk from the property door to its zone transit hub. */
  shuttleWalkMinutes: number;
  reviews: PropertyReviews;
};
