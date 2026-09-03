import type { Venue, VenueGate } from "@/types";

/**
 * Gate state is phase-dependent, because the whole re-optimization story
 * turns on it (docs/03 §9, docs/13 Scene 6):
 *
 *   normal   — Gate A is the shorter queue, so the planner picks Gate A.
 *   elevated — the Central demand spike pushes Gate A to 18 min while
 *              Gate B stays light at 7 min, making Gate B ~11 min faster.
 *
 * The 11-minute delta is the number quoted throughout the docs and
 * wireframes 6 and 9. Queue figures stay consistent with the waits:
 * currentQueue ÷ capacityPerMinute = estimatedWaitMinutes.
 */
const gatesNormal: VenueGate[] = [
  {
    id: "gate-a",
    name: "Gate A",
    zoneId: "central",
    capacityPerMinute: 40,
    currentQueue: 200,
    estimatedWaitMinutes: 5,
    status: "open",
  },
  {
    id: "gate-b",
    name: "Gate B",
    zoneId: "north",
    capacityPerMinute: 55,
    currentQueue: 495,
    estimatedWaitMinutes: 9,
    status: "open",
  },
];

export const venueGatesElevated: VenueGate[] = [
  {
    id: "gate-a",
    name: "Gate A",
    zoneId: "central",
    capacityPerMinute: 40,
    currentQueue: 720,
    estimatedWaitMinutes: 18,
    status: "busy",
  },
  {
    id: "gate-b",
    name: "Gate B",
    zoneId: "north",
    capacityPerMinute: 55,
    currentQueue: 385,
    estimatedWaitMinutes: 7,
    status: "open",
  },
];

export const venue: Venue = {
  id: "main-venue",
  name: "Main Ghat Venue",
  zoneId: "central",
  capacity: 60_000,
  currentOccupancy: 37_000,
  gates: gatesNormal,
};

export const venueGatesNormal = gatesNormal;
