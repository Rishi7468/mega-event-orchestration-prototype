import { utilizationPercent } from "@/data";
import type { TransportRoute } from "@/types";

const congestionPenalty: Record<TransportRoute["congestion"], number> = {
  low: 0,
  medium: 10,
  high: 25,
};

/**
 * route utility = shorter time + lower congestion + better reliability
 * - load penalty (docs/07_RECOMMENDATION_LOGIC.md #4).
 *
 * The load term is what makes live transport actually matter: a route that
 * is fast on paper but running at 88% of capacity loses to a slightly slower
 * one with room on it.
 */
export function scoreRoute(route: TransportRoute): number {
  const timeBenefit = Math.max(0, 60 - route.travelMinutes);
  const reliabilityBenefit = route.reliability * 30;
  const load = utilizationPercent(route.currentDemandPerHour, route.capacityPerHour);
  const loadPenalty = Math.max(0, load - 60) * 0.6;
  return Math.round(
    timeBenefit + reliabilityBenefit - congestionPenalty[route.congestion] - loadPenalty,
  );
}

export type RouteRecommendation = {
  best: TransportRoute;
  ranked: TransportRoute[];
  /** Visitor-facing explanation, present only when load actually drove the choice. */
  reason?: string;
};

export function getRouteRecommendation(
  fromZoneId: string,
  routes: TransportRoute[],
): RouteRecommendation {
  const candidates = routes.filter((route) => route.fromZoneId === fromZoneId);
  const pool = candidates.length > 0 ? candidates : routes;
  const ranked = [...pool].sort((a, b) => scoreRoute(b) - scoreRoute(a));
  const best = ranked[0];

  const busier = ranked
    .slice(1)
    .find(
      (route) =>
        utilizationPercent(route.currentDemandPerHour, route.capacityPerHour) >=
        utilizationPercent(best.currentDemandPerHour, best.capacityPerHour) + 15,
    );

  return {
    best,
    ranked,
    reason: busier
      ? `${best.name} is recommended because ${busier.name} is currently running at ${utilizationPercent(busier.currentDemandPerHour, busier.capacityPerHour)}% of capacity.`
      : undefined,
  };
}

/**
 * How loaded the visitor's own route is right now — drives the transport
 * advisory on the journey and live screens.
 */
export function getRouteLoad(route: TransportRoute): {
  percent: number;
  strained: boolean;
  label: string;
} {
  const percent = utilizationPercent(route.currentDemandPerHour, route.capacityPerHour);
  return {
    percent,
    strained: percent >= 78,
    label: percent >= 78 ? "Very busy" : percent >= 55 ? "Filling up" : "Space available",
  };
}
