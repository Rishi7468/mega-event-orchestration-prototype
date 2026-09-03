export type GateStatus = "open" | "elevated" | "busy" | "restricted";

export type VenueGate = {
  id: string;
  name: string;
  zoneId: string;
  capacityPerMinute: number;
  currentQueue: number;
  estimatedWaitMinutes: number;
  status: GateStatus;
};

export type Venue = {
  id: string;
  name: string;
  zoneId: string;
  capacity: number;
  currentOccupancy: number;
  gates: VenueGate[];
};
