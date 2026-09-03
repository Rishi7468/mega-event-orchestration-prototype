import type { CongestionLevel } from "./transport";

export type VisitorProfile = {
  name: string;
  partySize: number;
  budgetPerNight: number;
  stayNights: number;
  preferredArrival: string;
};

export type JourneyStepType =
  | "stay"
  | "walk"
  | "transit-hub"
  | "shuttle"
  | "gate"
  | "venue";

export type JourneyStep = {
  id: string;
  type: JourneyStepType;
  title: string;
  subtitle?: string;
  time: string;
  durationMinutes: number;
  crowdLevel: CongestionLevel;
};

export type VisitorPlan = {
  id: string;
  visitorCount: number;
  accommodationId: string;
  arrivalTime: string;
  routeIds: string[];
  venueGateId: string;
  estimatedTravelMinutes: number;
  estimatedCost: number;
  congestionLevel: CongestionLevel;
  journey: JourneyStep[];
};
