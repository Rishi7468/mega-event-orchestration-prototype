"use client";

import { useMemo } from "react";
import { findDestination, findOrigin, getInboundLeg } from "@/data";
import { getVisitTimingRecommendation } from "@/lib/recommendation";
import { useVisitorStore } from "@/store/visitorStore";

/**
 * "I want to attend X, travelling from Y, on day Z."
 *
 * Keeps the intent (what/where-from/when) in one place so every screen reads
 * the same answer, and derives the timing advice from the recommendation
 * engine rather than restating it per screen.
 */
export function useTripIntent() {
  const destinationId = useVisitorStore((state) => state.destinationId);
  const originId = useVisitorStore((state) => state.originId);
  const selectedDayId = useVisitorStore((state) => state.selectedDayId);
  const visitMode = useVisitorStore((state) => state.visitMode);
  const profile = useVisitorStore((state) => state.profile);

  const destination = useMemo(() => findDestination(destinationId), [destinationId]);
  const origin = useMemo(() => findOrigin(originId), [originId]);

  const inboundLeg = useMemo(
    () => (destination ? getInboundLeg(originId, destination.id) : undefined),
    [originId, destination],
  );

  const timing = useMemo(
    () => (destination ? getVisitTimingRecommendation(destination, selectedDayId) : null),
    [destination, selectedDayId],
  );

  return {
    destination,
    origin,
    inboundLeg,
    timing,
    profile,
    selectedDayId,
    visitMode,
    /** The visitor is travelling now, so plan against current conditions. */
    goingNow: visitMode === "now",
    hasDestination: Boolean(destination),
    /** Full orchestration data exists for this event. */
    isModelled: Boolean(destination?.simulationReady),
  };
}
