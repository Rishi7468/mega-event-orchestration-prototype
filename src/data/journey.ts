/**
 * The fixed legs that turn "I'm staying in zone X" into a full door-to-venue
 * journey. Kept here (not in the builder) so all mock numbers stay
 * centralized — docs/14_CLAUDE_BUILD_GUIDE.md "keep mock data centralized".
 *
 * Each zone's legs reconcile with its `venueTravelMinutes` in zones.ts:
 *   walkToHubMinutes + route.travelMinutes = venueTravelMinutes
 *
 * North therefore plans to 42 min end-to-end in normal conditions:
 *   5 walk + 4 hub wait + 25 shuttle + 3 walk + 5 Gate A queue = 42
 * which is the figure quoted in docs/13_DEMO_SCENARIO.md Scene 3.
 */
export type ZoneJourneyProfile = {
  zoneId: string;
  hubName: string;
  walkToHubMinutes: number;
  hubWaitMinutes: number;
  routeId: string;
  walkToGateMinutes: number;
  farePerPerson: number;
};

export const zoneJourneyProfiles: ZoneJourneyProfile[] = [
  {
    zoneId: "central",
    hubName: "Central Transit Hub",
    walkToHubMinutes: 3,
    hubWaitMinutes: 3,
    routeId: "route-s1",
    walkToGateMinutes: 2,
    farePerPerson: 60,
  },
  {
    zoneId: "north",
    hubName: "Triveni Marg Transit Hub",
    walkToHubMinutes: 5,
    hubWaitMinutes: 4,
    routeId: "route-s3",
    walkToGateMinutes: 3,
    farePerPerson: 80,
  },
  {
    zoneId: "east",
    hubName: "East Bus Terminal",
    walkToHubMinutes: 10,
    hubWaitMinutes: 8,
    routeId: "route-east-bus",
    walkToGateMinutes: 4,
    farePerPerson: 120,
  },
  {
    zoneId: "south",
    hubName: "South Connector Hub",
    walkToHubMinutes: 7,
    hubWaitMinutes: 6,
    routeId: "route-south-shuttle",
    walkToGateMinutes: 4,
    farePerPerson: 95,
  },
];

/**
 * Walking time between the two gates once the visitor is already standing
 * at one of them — the Live Event Card case (wireframe 9).
 */
export const gateToGateWalkMinutes = 6;
