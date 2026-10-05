import type { Zone, VenueGate, TransportRoute } from "@/types";

export type EventCategory = "religious_gathering" | "stadium_sports" | "music_festival";

export type EventConfig = {
  id: string;
  name: string;
  category: EventCategory;
  description: string;
  location: string;
  expectedAttendance: number;
  peakHour: string;
  zones: Zone[];
  gates: VenueGate[];
  routes: TransportRoute[];
  thresholds: {
    elevatedPressure: number;
    criticalPressure: number;
    gateWaitElevatedMinutes: number;
    transportUtilizationElevated: number;
  };
};
