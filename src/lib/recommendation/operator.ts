import { zones } from "@/data";
import { orchestrationConfig } from "@/config/orchestrationConfig";
import type { Measurement, Recommendation, ZoneSnapshot } from "@/types";

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
 * Derives actual or estimated redistribution impact from current state snapshots or
 * recorded real measurements (MEASURE stage).
 */
export function getRedistributionImpact(
  currentSnapshots: ZoneSnapshot[],
  latestMeasurement?: Measurement | null,
): RedistributionImpact | null {
  if (latestMeasurement?.impact) {
    const imp = latestMeasurement.impact;
    return {
      pressuredZoneId: imp.pressuredZoneId,
      spareZoneId: imp.spareZoneId,
      pressuredZoneName: imp.pressuredZoneName,
      spareZoneName: imp.spareZoneName,
      pressuredBefore: imp.pressuredBefore,
      pressuredAfter: imp.pressuredAfter,
      spareBefore: imp.spareBefore,
      spareAfter: imp.spareAfter,
      transportBefore: imp.transportBefore,
      transportAfter: imp.transportAfter,
    };
  }

  const pressured = [...currentSnapshots].sort(
    (a, b) => b.accommodationPressure - a.accommodationPressure,
  )[0];
  if (!pressured || pressured.accommodationPressure < orchestrationConfig.thresholds.transportHigh) return null;

  const spare = currentSnapshots.find((s) => s.zoneId === orchestrationConfig.redistribution.spareZoneId) ??
    currentSnapshots.find((s) => s.zoneId !== pressured.zoneId);

  if (!spare) return null;

  const pressuredAfter = Math.max(0, pressured.accommodationPressure + orchestrationConfig.redistribution.centralPressureDelta);
  const spareAfter = Math.min(100, spare.accommodationPressure + orchestrationConfig.redistribution.northPressureDelta);
  const transportAfter = Math.max(0, pressured.transportUtilization + orchestrationConfig.redistribution.transportUtilDelta);

  return {
    pressuredZoneId: pressured.zoneId,
    spareZoneId: spare.zoneId,
    pressuredZoneName: zones.find((z) => z.id === pressured.zoneId)?.name ?? pressured.zoneId,
    spareZoneName: zones.find((z) => z.id === spare.zoneId)?.name ?? spare.zoneId,
    pressuredBefore: pressured.accommodationPressure,
    pressuredAfter,
    spareBefore: spare.accommodationPressure,
    spareAfter,
    transportBefore: pressured.transportUtilization,
    transportAfter,
  };
}

export function getOperatorRecommendation(
  currentSnapshots: ZoneSnapshot[],
  latestMeasurement?: Measurement | null,
): Recommendation | null {
  const impact = getRedistributionImpact(currentSnapshots, latestMeasurement);
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
