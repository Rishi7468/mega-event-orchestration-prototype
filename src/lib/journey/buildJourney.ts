import {
  accommodationZones,
  properties,
  utilizationPercent,
  venue,
  zoneJourneyProfiles,
  zones,
} from "@/data";
import { getGateRecommendation } from "@/lib/recommendation/gate";
import { getTimingRecommendation } from "@/lib/recommendation/timing";
import { addMinutes, formatTime, parseTime } from "@/lib/time";
import type {
  CongestionLevel,
  JourneyStep,
  TransportRoute,
  VenueGate,
  VisitorPlan,
  VisitorProfile,
  ZoneSnapshot,
} from "@/types";

export type BuiltJourney = {
  plan: VisitorPlan;
  zoneId: string;
  zoneName: string;
  propertyName: string;
  gate: VenueGate;
  /** The transport route this journey rides — also the corridor drawn on the map. */
  routeId: string;
  routeName: string;
  routeFrequencyMinutes: number;
  reliabilityPercent: number;
  /** Live load on the visitor's own route, so screens can advise on it. */
  routeLoadPercent: number;
  departureTime: string;
  arrivalTime: string;
  totalMinutes: number;
  farePerPerson: number;
  congestion: CongestionLevel;
  arrivalWindow: { start: string; end: string; reason: string };
};

type BuildJourneyInput = {
  zoneId: string;
  profile: VisitorProfile;
  gates: VenueGate[];
  /** Phase-resolved routes, so the journey reflects live transport conditions. */
  routes: TransportRoute[];
  snapshots: ZoneSnapshot[];
  /** Explicit gate choice; falls back to the current recommendation. */
  gateId?: string | null;
  propertyId?: string | null;
  /**
   * Freeze the departure once the visitor is actually travelling, so that
   * re-planning mid-journey moves the *arrival* rather than rewriting
   * history.
   */
  departureTime?: string | null;
};

const gateCrowd = (gate: VenueGate): CongestionLevel => {
  if (gate.status === "busy" || gate.status === "restricted") return "high";
  if (gate.status === "elevated") return "medium";
  return gate.estimatedWaitMinutes >= 10 ? "medium" : "low";
};

/**
 * Composes the full door-to-venue journey for a chosen zone.
 *
 * Everything downstream (Journey Planner, Live Journey, re-optimization)
 * reads this one function, so the itinerary can never disagree with itself
 * across screens.
 */
export function buildJourney({
  zoneId,
  profile,
  gates,
  routes,
  snapshots,
  gateId,
  propertyId,
  departureTime,
}: BuildJourneyInput): BuiltJourney | null {
  const legs = zoneJourneyProfiles.find((profileItem) => profileItem.zoneId === zoneId);
  const accommodation = accommodationZones.find((zone) => zone.zoneId === zoneId);
  if (!legs || !accommodation) return null;

  const route = routes.find((item) => item.id === legs.routeId);
  if (!route) return null;

  const gate =
    (gateId ? gates.find((item) => item.id === gateId) : undefined) ??
    getGateRecommendation(gates).best;

  const property =
    properties.find((item) => item.id === propertyId) ??
    properties.find((item) => item.zoneId === zoneId);

  const zoneName = zones.find((zone) => zone.id === zoneId)?.name ?? zoneId;
  const propertyName = property?.name ?? `${zoneName} stay`;

  const totalMinutes =
    legs.walkToHubMinutes +
    legs.hubWaitMinutes +
    route.travelMinutes +
    legs.walkToGateMinutes +
    gate.estimatedWaitMinutes;

  // The venue sits in the Central zone, so venue-side timing advice keys off
  // that zone's crowd forecast.
  const venueSnapshot = snapshots.find((snapshot) => snapshot.zoneId === venue.zoneId);
  const timing = getTimingRecommendation(
    venueSnapshot ?? { zoneId: venue.zoneId, accommodationPressure: 0, crowdPressure: 0, transportUtilization: 0 },
  );

  const departure = departureTime ?? formatTime(parseTime(timing.windowStart) - totalMinutes);
  const arrival = addMinutes(departure, totalMinutes);

  let cursor = parseTime(departure);
  const step = (
    id: string,
    type: JourneyStep["type"],
    title: string,
    durationMinutes: number,
    crowdLevel: CongestionLevel,
    subtitle?: string,
  ): JourneyStep => {
    const journeyStep: JourneyStep = {
      id,
      type,
      title,
      subtitle,
      time: formatTime(cursor),
      durationMinutes,
      crowdLevel,
    };
    cursor += durationMinutes;
    return journeyStep;
  };

  const journey: JourneyStep[] = [
    step("depart", "stay", propertyName, 0, "low", "Your stay"),
    step(
      "walk-hub",
      "walk",
      `Walk to ${legs.hubName}`,
      legs.walkToHubMinutes,
      "low",
      `${legs.walkToHubMinutes} min on foot`,
    ),
    step(
      "hub",
      "transit-hub",
      legs.hubName,
      legs.hubWaitMinutes,
      route.congestion,
      `Board ${route.name} · every ${route.frequencyMinutes} min`,
    ),
    step(
      "ride",
      "shuttle",
      `${route.name} to venue`,
      route.travelMinutes,
      route.congestion,
      `${route.travelMinutes} min ride`,
    ),
    step(
      "walk-gate",
      "walk",
      `Walk to ${gate.name}`,
      legs.walkToGateMinutes,
      "low",
      "From the drop-off point",
    ),
    step(
      "gate",
      "gate",
      `${gate.name} entry`,
      gate.estimatedWaitMinutes,
      gateCrowd(gate),
      `About ${gate.estimatedWaitMinutes} min in the queue`,
    ),
    step("venue", "venue", venue.name, 0, gateCrowd(gate), "You're in"),
  ];

  const congestion: CongestionLevel =
    gateCrowd(gate) === "high" || route.congestion === "high"
      ? "high"
      : route.congestion === "medium" || gateCrowd(gate) === "medium"
        ? "medium"
        : "low";

  const plan: VisitorPlan = {
    id: `plan-${zoneId}-${gate.id}`,
    visitorCount: profile.partySize,
    accommodationId: property?.id ?? zoneId,
    arrivalTime: arrival,
    routeIds: [route.id],
    venueGateId: gate.id,
    estimatedTravelMinutes: totalMinutes,
    estimatedCost: legs.farePerPerson,
    congestionLevel: congestion,
    journey,
  };

  return {
    plan,
    zoneId,
    zoneName,
    propertyName,
    gate,
    routeId: route.id,
    routeName: route.name,
    routeFrequencyMinutes: route.frequencyMinutes,
    reliabilityPercent: Math.round(route.reliability * 100),
    routeLoadPercent: utilizationPercent(route.currentDemandPerHour, route.capacityPerHour),
    departureTime: departure,
    arrivalTime: arrival,
    totalMinutes,
    farePerPerson: legs.farePerPerson,
    congestion,
    arrivalWindow: { start: timing.windowStart, end: timing.windowEnd, reason: timing.reason },
  };
}

/** Minutes still to go from the visitor's current step onward. */
export function remainingMinutes(journey: BuiltJourney, currentStepIndex: number): number {
  return journey.plan.journey
    .slice(Math.max(0, currentStepIndex))
    .reduce((total, step) => total + step.durationMinutes, 0);
}
