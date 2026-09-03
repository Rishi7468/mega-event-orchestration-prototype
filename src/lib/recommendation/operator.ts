import { zoneSnapshotsOutcome, zones } from "@/data";
import type { Recommendation, ZoneSnapshot } from "@/types";

export type RedistributionImpact = {
  pressuredZoneId: string;
  spareZoneId: string;
  pressuredZoneName: string;
  spareZoneName: string;
  pressuredBefore: number;
  pressuredAfter: number;
  spareBefore: number;
  spareAfter: number;
  transportBefore: number;
  transportAfter: number;
};

function signed(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

/**
 * Finds the most pressured zone, then identifies which *other* zone
 * actually absorbs the redistributed demand — the one whose outcome
 * accommodation pressure rises relative to today's reading — rather than
 * just picking whichever zone currently has the lowest pressure. That
 * naive approach would pick the cheapest, farthest zone (East) purely
 * because it's quietest, contradicting the whole product story where North
 * is the zone with real spare capacity *and* transport to absorb demand
 * (docs/04 Scenario 1, docs/13 Scene 2 — both single out North specifically).
 */
export function getRedistributionImpact(
  currentSnapshots: ZoneSnapshot[],
  outcomeSnapshots: ZoneSnapshot[] = zoneSnapshotsOutcome,
): RedistributionImpact | null {
  const pressured = [...currentSnapshots].sort(
    (a, b) => b.accommodationPressure - a.accommodationPressure,
  )[0];
  if (!pressured || pressured.accommodationPressure < 80) return null;

  const pressuredOutcome = outcomeSnapshots.find((s) => s.zoneId === pressured.zoneId);
  if (!pressuredOutcome) return null;

  const spare = currentSnapshots
    .filter((snapshot) => snapshot.zoneId !== pressured.zoneId)
    .map((current) => {
      const outcome = outcomeSnapshots.find((s) => s.zoneId === current.zoneId);
      return outcome ? { current, outcome, delta: outcome.accommodationPressure - current.accommodationPressure } : null;
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .sort((a, b) => b.delta - a.delta)[0];

  if (!spare || spare.delta <= 0) return null;

  return {
    pressuredZoneId: pressured.zoneId,
    spareZoneId: spare.current.zoneId,
    pressuredZoneName: zones.find((z) => z.id === pressured.zoneId)?.name ?? pressured.zoneId,
    spareZoneName: zones.find((z) => z.id === spare.current.zoneId)?.name ?? spare.current.zoneId,
    pressuredBefore: pressured.accommodationPressure,
    pressuredAfter: pressuredOutcome.accommodationPressure,
    spareBefore: spare.current.accommodationPressure,
    spareAfter: spare.outcome.accommodationPressure,
    transportBefore: pressured.transportUtilization,
    transportAfter: pressuredOutcome.transportUtilization,
  };
}

export function getOperatorRecommendation(
  currentSnapshots: ZoneSnapshot[],
  outcomeSnapshots: ZoneSnapshot[] = zoneSnapshotsOutcome,
): Recommendation | null {
  const impact = getRedistributionImpact(currentSnapshots, outcomeSnapshots);
  if (!impact) return null;

  return {
    id: `rec-operator-${impact.pressuredZoneId}-to-${impact.spareZoneId}`,
    audience: "operator",
    type: "operations",
    title: "Redistribution opportunity detected",
    reason: [
      `${impact.pressuredZoneName} is approaching capacity at ${impact.pressuredBefore}% accommodation pressure.`,
      `${impact.spareZoneName} has spare accommodation and shuttle capacity.`,
    ],
    expectedImpact: `${impact.pressuredZoneName} pressure ${impact.pressuredBefore}% → ${impact.pressuredAfter}% (${signed(impact.pressuredAfter - impact.pressuredBefore)}), ${impact.spareZoneName} pressure ${impact.spareBefore}% → ${impact.spareAfter}% (${signed(impact.spareAfter - impact.spareBefore)}).`,
    confidence: impact.pressuredBefore >= 90 ? "high" : "medium",
  };
}
