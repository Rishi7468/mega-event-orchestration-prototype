import type { Event } from "@/types";
import { primaryDestination as primary } from "./destinations";

/**
 * The operator surface is scoped to the fully modelled scenario, so it keeps
 * working from a single `event`. It is derived from the destination entry
 * rather than duplicated, so event name/dates can never drift apart from the
 * destination the visitor selected.
 */
export const event: Event = {
  id: primary.id,
  name: primary.name,
  location: `${primary.city}, ${primary.region}`,
  dateRange: primary.dateRange,
  status: primary.status,
  expectedVisitors: primary.expectedVisitors,
  schedule: [
    {
      id: "sched-morning-snan",
      time: "05:00 AM",
      title: "Morning Snan (Holy Bath)",
      venueId: "main-venue",
      expectedImpact: "low",
    },
    {
      id: "sched-main-aarti",
      time: "06:00 PM",
      title: "Main Ghat Aarti",
      venueId: "main-venue",
      expectedImpact: "high",
    },
  ],
};
