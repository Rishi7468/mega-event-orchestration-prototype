import type { ZoneSnapshot } from "@/types";

/**
 * Recommend an arrival window based on current crowd pressure.
 * See docs/07_RECOMMENDATION_LOGIC.md #5.
 */
export function getTimingRecommendation(snapshot: ZoneSnapshot): {
  windowStart: string;
  windowEnd: string;
  reason: string;
} {
  if (snapshot.crowdPressure >= 70) {
    return {
      windowStart: "07:30 AM",
      windowEnd: "08:30 AM",
      reason: "Crowd pressure is already high and expected to rise further later today.",
    };
  }

  return {
    windowStart: "09:20 AM",
    windowEnd: "09:40 AM",
    reason: "Crowd pressure is expected to rise after 10 AM.",
  };
}
