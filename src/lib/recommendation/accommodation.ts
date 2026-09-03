import {
  accommodationZones,
  availabilityPercent,
  getPropertiesInZone,
  utilizationPercent,
  zones,
} from "@/data";
import type {
  AccommodationZone,
  Property,
  Recommendation,
  TransportRoute,
  VisitorProfile,
  ZoneSnapshot,
} from "@/types";

export type FactorKey = "availability" | "price" | "transport" | "crowd" | "travel";

export type ZoneFactor = {
  key: FactorKey;
  label: string;
  /** 0–100, higher is better for the visitor. */
  score: number;
  summary: string;
};

export type ZoneScore = {
  zoneId: string;
  /** 0–100 weighted blend of the factors below. */
  score: number;
  factors: ZoneFactor[];
  reasons: string[];
  weakness?: string;
};

/**
 * Weights express the product's priorities from docs/07_RECOMMENDATION_LOGIC.md:
 * availability + affordability + transport + low-crowd + travel-time.
 *
 * Travel time carries the largest single weight because at a multi-day
 * mega-event the journey is paid twice a day — which is exactly why the
 * cheap-but-distant East Zone must not beat the balanced North Zone
 * (docs/04 Scenario 1 and docs/13 Scene 2 both require North).
 */
const WEIGHTS: Record<FactorKey, number> = {
  availability: 0.2,
  price: 0.2,
  transport: 0.18,
  crowd: 0.16,
  travel: 0.26,
};

const TRANSPORT_QUALITY_SCORE: Record<AccommodationZone["transportQuality"], number> = {
  poor: 25,
  moderate: 55,
  good: 85,
  excellent: 100,
};

const CROWD_LEVEL_SCORE: Record<AccommodationZone["crowdLevel"], number> = {
  low: 90,
  medium: 65,
  high: 30,
  critical: 10,
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

/** Rooms free, with diminishing returns — 60%+ free is already "plenty". */
function availabilityScore(zone: AccommodationZone): number {
  return clamp((zone.availableRooms / zone.totalRooms / 0.6) * 100);
}

/**
 * Budget *fit*, not raw cheapness: within budget scores 70–100 (a little
 * extra for headroom), over budget falls away and hits 0 at 60% over.
 */
function priceScore(price: number, budget: number): number {
  if (budget <= 0) return 50;
  if (price <= budget) return 70 + 30 * Math.min(1, (budget - price) / (budget * 0.4));
  return Math.max(0, 70 * (1 - (price - budget) / (budget * 0.6)));
}

/** Prefers the live crowd reading when the simulation supplies one. */
function crowdScore(zone: AccommodationZone, snapshot?: ZoneSnapshot): number {
  if (snapshot) return clamp(100 - snapshot.crowdPressure);
  return CROWD_LEVEL_SCORE[zone.crowdLevel];
}

function travelScore(minutes: number): number {
  return clamp(100 - minutes * 1.6);
}

/**
 * How good this zone's link to the venue is right now.
 *
 * The static `transportQuality` says how good the connection is by design;
 * live route load then penalises it only once the route is genuinely
 * strained (past 70% of capacity). Below that threshold a busier-but-coping
 * route scores the same as an empty one — otherwise a zone would be punished
 * for successfully absorbing demand, and the system would stop recommending
 * North the moment an intervention sent visitors there.
 */
function transportScore(zone: AccommodationZone, route?: TransportRoute): number {
  const quality = TRANSPORT_QUALITY_SCORE[zone.transportQuality];
  if (!route) return quality;
  const load = utilizationPercent(route.currentDemandPerHour, route.capacityPerHour);
  return clamp(quality - Math.max(0, load - 70) * 1.5);
}

export function scoreAccommodationZone(
  zone: AccommodationZone,
  profile: VisitorProfile,
  snapshot?: ZoneSnapshot,
  route?: TransportRoute,
): ZoneScore {
  const availablePercent = Math.round((zone.availableRooms / zone.totalRooms) * 100);
  const routeLoad = route
    ? utilizationPercent(route.currentDemandPerHour, route.capacityPerHour)
    : null;

  const factors: ZoneFactor[] = [
    {
      key: "availability",
      label: "Availability",
      score: availabilityScore(zone),
      summary: `${availablePercent}% of rooms still free`,
    },
    {
      key: "price",
      label: "Price",
      score: priceScore(zone.averagePrice, profile.budgetPerNight),
      summary: `₹${zone.averagePrice.toLocaleString("en-IN")} avg / night`,
    },
    {
      key: "transport",
      label: "Transport",
      score: transportScore(zone, route),
      summary:
        routeLoad === null
          ? `${zone.transportQuality} connection`
          : `${zone.transportQuality} connection · ${routeLoad}% full`,
    },
    {
      key: "crowd",
      label: "Crowd",
      score: crowdScore(zone, snapshot),
      summary: snapshot ? `${snapshot.crowdPressure}% crowd pressure` : `${zone.crowdLevel} crowd`,
    },
    {
      key: "travel",
      label: "Travel time",
      score: travelScore(zone.venueTravelMinutes),
      summary: `${zone.venueTravelMinutes} min to venue`,
    },
  ];

  const score = Math.round(
    factors.reduce((total, factor) => total + factor.score * WEIGHTS[factor.key], 0),
  );

  const reasons: string[] = [];
  if (factors[0].score >= 70) reasons.push(`Good room availability — ${availablePercent}% still free.`);
  if (factors[1].score >= 70) reasons.push("Sits inside your nightly budget.");
  if (factors[2].score >= 80) reasons.push("Direct shuttle with spare capacity.");
  if (factors[3].score >= 55) reasons.push("Lower crowd pressure than the venue zone.");
  if (factors[4].score >= 50) reasons.push("Reasonable travel time to the venue.");

  const weakestFactor = [...factors].sort((a, b) => a.score - b.score)[0];
  const weakness = weakestFactor.score < 40 ? weakestFactor : undefined;

  return {
    zoneId: zone.zoneId,
    score,
    factors,
    reasons,
    weakness: weakness
      ? {
          availability: "Very little accommodation left here.",
          price: "Priced above your budget.",
          transport: "Transport connection is limited.",
          crowd: "Expect heavy crowds around this zone.",
          travel: "It is a long journey to the venue.",
        }[weakness.key]
      : undefined,
  };
}

const FALLBACK_PROFILE: VisitorProfile = {
  name: "",
  partySize: 1,
  budgetPerNight: 3000,
  stayNights: 1,
  preferredArrival: "10:00 AM",
};

export function getAccommodationRecommendation(
  profile: VisitorProfile = FALLBACK_PROFILE,
  snapshots: ZoneSnapshot[] = [],
  routes: TransportRoute[] = [],
): { best: ZoneScore; ranked: ZoneScore[] } {
  const ranked = accommodationZones
    .map((zone) =>
      scoreAccommodationZone(
        zone,
        profile,
        snapshots.find((snapshot) => snapshot.zoneId === zone.zoneId),
        routes.find((route) => route.fromZoneId === zone.zoneId),
      ),
    )
    .sort((a, b) => b.score - a.score);

  return { best: ranked[0], ranked };
}

export function buildAccommodationRecommendation(
  profile?: VisitorProfile,
  snapshots?: ZoneSnapshot[],
  routes?: TransportRoute[],
): Recommendation {
  const { best, ranked } = getAccommodationRecommendation(profile, snapshots, routes);
  const zoneName = zones.find((zone) => zone.id === best.zoneId)?.name ?? best.zoneId;
  const runnerUp = ranked[1];

  return {
    id: `rec-accommodation-${best.zoneId}`,
    audience: "visitor",
    type: "accommodation",
    title: `${zoneName} recommended`,
    reason:
      best.reasons.length > 0
        ? best.reasons
        : ["Best overall balance of price, availability, transport, and crowd."],
    expectedImpact: runnerUp
      ? `Scores ${best.score} vs ${runnerUp.score} for the next best zone on your priorities.`
      : "Best balance of availability, cost, travel time, and congestion.",
    confidence: best.score - (runnerUp?.score ?? 0) >= 8 ? "high" : "medium",
  };
}

export type PropertyScore = {
  property: Property;
  /** 0–100 blend of the factors below. */
  score: number;
  /** Short reason shown on the recommended card. */
  reason: string;
};

/**
 * How properties are ranked *within* a zone.
 *
 * Reviews are in the blend because a visitor genuinely cares about them, but
 * at a deliberately modest weight, and — more importantly — this scoring runs
 * only after the orchestration engine has already chosen the zone. Which side
 * of the destination to stay on is decided on availability, price, transport,
 * crowd pressure and travel time; a well-reviewed hotel inside a saturated
 * zone can never pull the recommendation back toward that zone. Reviews pick
 * between neighbours, not between strategies.
 */
const PROPERTY_WEIGHTS = {
  price: 0.34,
  availability: 0.22,
  access: 0.24,
  reviews: 0.2,
} as const;

export function scoreProperty(property: Property, budgetPerNight: number): PropertyScore {
  const free = availabilityPercent(property);
  const factors = {
    price: priceScore(property.pricePerNight, budgetPerNight),
    availability: clamp((free / 60) * 100),
    access: clamp(100 - property.shuttleWalkMinutes * 6),
    reviews: clamp((property.reviews.score / 5) * 100),
  };

  const score = Math.round(
    (Object.keys(factors) as (keyof typeof factors)[]).reduce(
      (total, key) => total + factors[key] * PROPERTY_WEIGHTS[key],
      0,
    ),
  );

  const reason =
    property.pricePerNight <= budgetPerNight && factors.reviews >= 80
      ? `Well rated and inside your budget, ${property.shuttleWalkMinutes} min from the shuttle.`
      : property.pricePerNight <= budgetPerNight
        ? `Inside your budget with ${free}% of rooms still free.`
        : `Closest fit to your budget in this zone, ${property.shuttleWalkMinutes} min from the shuttle.`;

  return { property, score, reason };
}

export function rankProperties(zoneId: string, budgetPerNight: number): PropertyScore[] {
  return getPropertiesInZone(zoneId)
    .map((property) => scoreProperty(property, budgetPerNight))
    .sort((a, b) => b.score - a.score);
}

/** The property we put the visitor in — best overall fit inside the zone. */
export function getRecommendedProperty(
  zoneId: string,
  budgetPerNight: number,
): Property | undefined {
  return rankProperties(zoneId, budgetPerNight)[0]?.property;
}
