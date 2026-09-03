import type { InboundLeg, Origin } from "@/types";

/**
 * Where the visitor is travelling *from*. The origin is the start of the
 * journey and the event is the destination — origin ≠ destination — so the
 * plan can account for the inbound leg as well as the local door-to-venue
 * journey. No geolocation is used: the origin is chosen explicitly.
 */
export const origins: Origin[] = [
  { id: "mumbai", city: "Mumbai", region: "Maharashtra" },
  { id: "delhi", city: "Delhi", region: "Delhi NCR" },
  { id: "kolkata", city: "Kolkata", region: "West Bengal" },
  { id: "bengaluru", city: "Bengaluru", region: "Karnataka" },
  { id: "lucknow", city: "Lucknow", region: "Uttar Pradesh" },
];

export const DEFAULT_ORIGIN_ID = "mumbai";

/** Inbound legs for the fully modelled demo scenario. */
export const inboundLegs: InboundLeg[] = [
  {
    originId: "mumbai",
    destinationId: "maha-kumbh",
    mode: "Flight",
    durationLabel: "2 h 05 m",
    note: "Direct to Prayagraj, then 45 min to your stay",
  },
  {
    originId: "delhi",
    destinationId: "maha-kumbh",
    mode: "Train",
    durationLabel: "8 h 30 m",
    note: "Overnight services arrive before the morning peak",
  },
  {
    originId: "kolkata",
    destinationId: "maha-kumbh",
    mode: "Flight",
    durationLabel: "1 h 50 m",
    note: "Then 45 min road transfer to the accommodation zones",
  },
  {
    originId: "bengaluru",
    destinationId: "maha-kumbh",
    mode: "Flight",
    durationLabel: "2 h 45 m",
    note: "One-stop routings add roughly an hour",
  },
  {
    originId: "lucknow",
    destinationId: "maha-kumbh",
    mode: "Road",
    durationLabel: "3 h 40 m",
    note: "Expect slower approach roads close to the event",
  },
];

export function findOrigin(originId: string): Origin | undefined {
  return origins.find((origin) => origin.id === originId);
}

export function getInboundLeg(
  originId: string,
  destinationId: string,
): InboundLeg | undefined {
  return inboundLegs.find(
    (leg) => leg.originId === originId && leg.destinationId === destinationId,
  );
}
