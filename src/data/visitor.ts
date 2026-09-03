import type { VisitorProfile } from "@/types";

export const visitorProfile: VisitorProfile = {
  name: "Arjun",
  partySize: 2,
  budgetPerNight: 2_000,
  stayNights: 2,
  preferredArrival: "10:00 AM",
};

/**
 * There is deliberately no seeded VisitorPlan here any more. The plan and
 * its journey are always derived from the visitor's live choices via
 * lib/journey/buildJourney.ts, so there is exactly one source of truth for
 * the itinerary rather than a static copy that can drift out of sync.
 */
