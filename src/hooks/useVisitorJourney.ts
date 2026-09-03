"use client";

import { useMemo } from "react";
import { getGatesForPhase, getRoutesForPhase, isDisrupted, isRecovering } from "@/lib/conditions";
import { buildJourney, remainingMinutes } from "@/lib/journey";
import { getGateRecommendation } from "@/lib/recommendation";
import { useSimulationStore } from "@/store/simulationStore";
import { useVisitorStore } from "@/store/visitorStore";

/**
 * The single place the visitor screens get their itinerary from.
 *
 * Recomputes the journey from the visitor's choices + current destination
 * conditions on every render, and — when a better gate exists — also builds
 * the alternative journey so the re-optimization screen can compare like
 * with like instead of inventing its own numbers.
 */
export function useVisitorJourney() {
  const phase = useSimulationStore((state) => state.phase);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);

  const profile = useVisitorStore((state) => state.profile);
  const selectedZoneId = useVisitorStore((state) => state.selectedZoneId);
  const selectedPropertyId = useVisitorStore((state) => state.selectedPropertyId);
  const gateId = useVisitorStore((state) => state.gateId);
  const journeyStarted = useVisitorStore((state) => state.journeyStarted);
  const departureTime = useVisitorStore((state) => state.departureTime);
  const currentStepIndex = useVisitorStore((state) => state.currentStepIndex);
  const keptOriginalPlan = useVisitorStore((state) => state.keptOriginalPlan);

  const gates = useMemo(() => getGatesForPhase(phase), [phase]);
  const routes = useMemo(() => getRoutesForPhase(phase), [phase]);

  const journey = useMemo(() => {
    if (!selectedZoneId) return null;
    return buildJourney({
      zoneId: selectedZoneId,
      profile,
      gates,
      routes,
      snapshots: zoneSnapshots,
      gateId,
      propertyId: selectedPropertyId,
      departureTime,
    });
  }, [selectedZoneId, profile, gates, routes, zoneSnapshots, gateId, selectedPropertyId, departureTime]);

  const recommendedGate = useMemo(() => getGateRecommendation(gates).best, [gates]);

  // Only meaningful once a journey exists and the recommended gate differs
  // from the one the visitor is currently heading to.
  const alternative = useMemo(() => {
    if (!journey || !selectedZoneId) return null;
    if (recommendedGate.id === journey.gate.id) return null;
    return buildJourney({
      zoneId: selectedZoneId,
      profile,
      gates,
      routes,
      snapshots: zoneSnapshots,
      gateId: recommendedGate.id,
      propertyId: selectedPropertyId,
      departureTime,
    });
  }, [
    journey,
    selectedZoneId,
    profile,
    gates,
    routes,
    zoneSnapshots,
    recommendedGate,
    selectedPropertyId,
    departureTime,
  ]);

  const minutesSaved =
    journey && alternative ? journey.totalMinutes - alternative.totalMinutes : 0;

  const stepCount = journey?.plan.journey.length ?? 0;
  const safeStepIndex = Math.min(currentStepIndex, Math.max(0, stepCount - 1));

  return {
    phase,
    zoneSnapshots,
    gates,
    routes,
    /** Conditions have eased after an approved intervention. */
    recovering: isRecovering(phase),
    profile,
    journey,
    alternative,
    minutesSaved,
    recommendedGate,
    journeyStarted,
    currentStepIndex: safeStepIndex,
    currentStep: journey?.plan.journey[safeStepIndex] ?? null,
    remaining: journey ? remainingMinutes(journey, safeStepIndex) : 0,
    remainingIfSwitched: alternative ? remainingMinutes(alternative, safeStepIndex) : 0,
    /** A genuinely better option exists and the visitor hasn't declined it. */
    reoptimizationAvailable:
      Boolean(alternative) && minutesSaved > 0 && !keptOriginalPlan && isDisrupted(phase),
    keptOriginalPlan,
  };
}
