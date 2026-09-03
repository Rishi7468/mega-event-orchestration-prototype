import type { ZoneSnapshot } from "@/types";

/**
 * Deterministic linear projection — "what happens if nothing changes"
 * (docs/02_SYSTEM_MENTAL_MODEL.md #5). No randomness: same inputs always
 * produce the same forecast, which is what makes the demo repeatable.
 */
export function predictZonePressure(
  snapshot: ZoneSnapshot,
  minutesAhead: number,
  growthPercentPerMinute = 0.6,
): ZoneSnapshot {
  const grow = (value: number) => Math.min(100, Math.round(value + growthPercentPerMinute * minutesAhead));
  return {
    zoneId: snapshot.zoneId,
    accommodationPressure: grow(snapshot.accommodationPressure),
    crowdPressure: grow(snapshot.crowdPressure),
    transportUtilization: grow(snapshot.transportUtilization),
  };
}

export function pressureToRisk(pressurePercent: number): "low" | "medium" | "high" | "critical" {
  if (pressurePercent >= 90) return "critical";
  if (pressurePercent >= 70) return "high";
  if (pressurePercent >= 45) return "medium";
  return "low";
}
