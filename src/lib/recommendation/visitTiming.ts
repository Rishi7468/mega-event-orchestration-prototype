import type { ArrivalWindow, DayOutlook, Destination } from "@/types";

/**
 * Destination-level "when should I attend?" logic.
 *
 * This is a different question from lib/recommendation/timing.ts, which
 * answers "given crowd pressure right now, what arrival window should this
 * journey target". This module works one level up: which *day* of the event
 * to attend, and which arrival window that day.
 */

/** Windows before 8am are quietest but rarely practical to plan around. */
const PRACTICAL_START_HOUR = 8;

export type DayVerdict = "good" | "busy" | "peak";

export function getQuietestDay(destination: Destination): DayOutlook | undefined {
  return [...destination.outlook].sort((a, b) => a.demandPercent - b.demandPercent)[0];
}

export function getBusiestDay(destination: Destination): DayOutlook | undefined {
  return [...destination.outlook].sort((a, b) => b.demandPercent - a.demandPercent)[0];
}

/**
 * Lowest-pressure window that a visitor could realistically plan around.
 * Falls back to the outright quietest if every window is very early.
 */
export function getRecommendedWindow(destination: Destination): ArrivalWindow | undefined {
  const practical = destination.arrivalWindows.filter(
    (window) => window.startHour >= PRACTICAL_START_HOUR,
  );
  const pool = practical.length > 0 ? practical : destination.arrivalWindows;
  return [...pool].sort((a, b) => a.pressurePercent - b.pressurePercent)[0];
}

export function verdictForDay(day: DayOutlook): DayVerdict {
  if (day.demandPercent >= 85) return "peak";
  if (day.demandPercent >= 65) return "busy";
  return "good";
}

export type VisitTimingRecommendation = {
  selectedDay?: DayOutlook;
  quietestDay?: DayOutlook;
  recommendedWindow?: ArrivalWindow;
  verdict: DayVerdict;
  /** One contextual sentence — no metric dump (docs/09 §6). */
  headline: string;
  detail: string;
  /** True when moving day would materially help. */
  suggestsDifferentDay: boolean;
};

export function getVisitTimingRecommendation(
  destination: Destination,
  selectedDayId: string | null,
): VisitTimingRecommendation {
  const quietestDay = getQuietestDay(destination);
  const recommendedWindow = getRecommendedWindow(destination);
  const selectedDay = destination.outlook.find((day) => day.id === selectedDayId);

  // No date chosen yet — lead with the best day to attend.
  if (!selectedDay) {
    return {
      quietestDay,
      recommendedWindow,
      verdict: quietestDay ? verdictForDay(quietestDay) : "good",
      headline: quietestDay
        ? `${quietestDay.label} is the easiest day to attend`
        : "Flexible dates give you the best options",
      detail: recommendedWindow
        ? `Arriving ${recommendedWindow.label} keeps you ahead of the heaviest crowds.`
        : "Pick a date and we'll plan around expected demand.",
      suggestsDifferentDay: false,
    };
  }

  const verdict = verdictForDay(selectedDay);
  const worthMoving =
    Boolean(quietestDay) && selectedDay.demandPercent - (quietestDay?.demandPercent ?? 0) >= 20;

  if (verdict === "good") {
    return {
      selectedDay,
      quietestDay,
      recommendedWindow,
      verdict,
      headline: `${selectedDay.label} is a good day to attend`,
      detail: recommendedWindow
        ? `Demand is lighter than the weekend. Arrive ${recommendedWindow.label} for the smoothest entry.`
        : "Demand is lighter than the weekend peak.",
      suggestsDifferentDay: false,
    };
  }

  return {
    selectedDay,
    quietestDay,
    recommendedWindow,
    verdict,
    headline:
      verdict === "peak"
        ? `${selectedDay.label} is a peak day`
        : `${selectedDay.label} is expected to be busy`,
    detail: worthMoving && quietestDay
      ? `${quietestDay.label} is noticeably quieter. If your dates are fixed, arriving ${recommendedWindow?.label ?? "early"} avoids the worst of it.`
      : `Arriving ${recommendedWindow?.label ?? "early"} could cut both travel and waiting time.`,
    suggestsDifferentDay: worthMoving,
  };
}

export type TimingFactor = { label: string; detail: string };

export type LiveTimingInputs = {
  /** Crowd pressure around the venue right now. */
  crowdPressure?: number;
  /** Rooms still free in the zone we'd recommend staying in. */
  roomsFreePercent?: number;
  /** Load on the main approach route. */
  transportLoadPercent?: number;
  /** The scheduled item that drives the day's heaviest window. */
  peakScheduleItem?: { time: string; title: string };
};

/**
 * The short "why" behind the timing advice.
 *
 * Deliberately assembled from whatever inputs the caller actually has:
 * expected demand always, plus the event schedule, live crowd pressure,
 * accommodation availability and transport load when the event is modelled.
 * A non-modelled event shows the demand line alone rather than inventing the
 * rest — the honest answer, not a padded one.
 */
export function getVisitTimingFactors(
  destination: Destination,
  timing: VisitTimingRecommendation,
  live: LiveTimingInputs = {},
): TimingFactor[] {
  const day = timing.selectedDay ?? timing.quietestDay;
  const busiest = getBusiestDay(destination);
  const factors: TimingFactor[] = [];

  if (day) {
    factors.push({
      label: "Expected demand",
      detail:
        busiest && busiest.id !== day.id
          ? `${day.label} at ${day.demandPercent}% against ${busiest.demandPercent}% on ${busiest.label}`
          : `${day.label} at ${day.demandPercent}% of peak attendance`,
    });
  }

  if (live.peakScheduleItem) {
    factors.push({
      label: "Event schedule",
      detail: `${live.peakScheduleItem.title} at ${live.peakScheduleItem.time} drives the heaviest window`,
    });
  }

  if (live.crowdPressure !== undefined) {
    factors.push({
      label: "Crowd pressure",
      detail: `Venue area running at ${live.crowdPressure}% right now`,
    });
  }

  if (live.roomsFreePercent !== undefined) {
    factors.push({
      label: "Accommodation",
      detail: `${live.roomsFreePercent}% of rooms free in the zone we'd recommend`,
    });
  }

  if (live.transportLoadPercent !== undefined) {
    factors.push({
      label: "Transport",
      detail: `Main approach route ${live.transportLoadPercent}% full`,
    });
  }

  return factors;
}
