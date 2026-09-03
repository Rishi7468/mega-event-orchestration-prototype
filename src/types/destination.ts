import type { EventStatus } from "./event";

export type DestinationEventType =
  | "religious-gathering"
  | "convention"
  | "sports"
  | "festival"
  | "celebration";

/**
 * Human-readable category. Search matches against these, so a visitor can
 * look for "sports" or "expo" rather than having to know an event's name.
 */
export const eventTypeLabel: Record<DestinationEventType, string> = {
  "religious-gathering": "Religious Gathering",
  convention: "Convention / Expo",
  sports: "Sports Event",
  festival: "Cultural Festival",
  celebration: "Large Public Celebration",
};

export type DemandLevel = "moderate" | "high" | "very-high";

/** One day of the event, with how much visitor demand it is expected to carry. */
export type DayOutlook = {
  id: string;
  /** Short label — deliberately weekday-based, not a real calendar date, so
   *  the demo scenario never looks stale (see docs/11 "Source labels"). */
  label: string;
  demandPercent: number;
  note: string;
};

export type ArrivalWindow = {
  id: string;
  label: string;
  /** 24h start hour, used to filter out impractically early windows. */
  startHour: number;
  pressurePercent: number;
  note: string;
};

/**
 * A mega-event the visitor can choose to attend. This is what stops the
 * application from being hardwired to a single hardcoded event: the UI reads
 * whichever destination the visitor selected.
 */
export type Destination = {
  id: string;
  name: string;
  city: string;
  region: string;
  eventType: DestinationEventType;
  /** No year on purpose — this is a simulated scenario, not a live listing. */
  dateRange: string;
  summary: string;
  status: EventStatus;
  expectedVisitors: number;
  demandLevel: DemandLevel;
  /**
   * Whether the full orchestration dataset (zones, transport, gates, cameras)
   * is modelled for this destination. Only the primary demo scenario is —
   * the others exist to prove the model isn't single-event, and the UI says
   * so honestly rather than faking data.
   */
  simulationReady: boolean;
  outlook: DayOutlook[];
  arrivalWindows: ArrivalWindow[];
  /** Shown under "Suggested for you" on Home. */
  suggested?: boolean;
  /** Present when the event belongs in the "Trending now" section. */
  trending?: TrendingSignal;
  geo: GeoView;
};

/**
 * Why an event is currently drawing attention. Deliberately a stated,
 * deterministic reason rather than a popularity number: this prototype has no
 * social-media or analytics feed behind it, and a "Trending" badge with
 * nothing behind it would be decoration.
 */
export type TrendingSignal = {
  /** Lower sorts first. */
  rank: number;
  reason: string;
};

/** Where an event sits on the map, so the map is per-event rather than fixed. */
export type GeoView = {
  center: [number, number];
  zoom: number;
};

export type Origin = {
  id: string;
  city: string;
  region: string;
};

export type InboundLeg = {
  originId: string;
  destinationId: string;
  mode: string;
  durationLabel: string;
  note: string;
};
