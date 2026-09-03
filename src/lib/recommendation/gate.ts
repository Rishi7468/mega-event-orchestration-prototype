import { venue } from "@/data";
import type { VenueGate } from "@/types";

/**
 * Lower estimated wait wins. Ties broken by shorter queue.
 * See docs/07_RECOMMENDATION_LOGIC.md #6.
 *
 * Accepts the gate set explicitly so callers can pass the live,
 * phase-dependent gates from lib/conditions.ts; defaults to the normal
 * baseline for callers that only need the calm state.
 */
export function getGateRecommendation(gates: VenueGate[] = venue.gates): {
  best: VenueGate;
  ranked: VenueGate[];
} {
  const ranked = [...gates].sort(
    (a, b) => a.estimatedWaitMinutes - b.estimatedWaitMinutes || a.currentQueue - b.currentQueue,
  );
  return { best: ranked[0], ranked };
}

export function findGate(gates: VenueGate[], gateId: string): VenueGate | undefined {
  return gates.find((gate) => gate.id === gateId);
}
