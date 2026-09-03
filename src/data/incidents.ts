import type { Incident } from "@/types";

export const incidents: Incident[] = [
  {
    id: "inc-1",
    type: "crowd",
    zoneId: "central",
    severity: "high",
    status: "responding",
    description: "Dense crowd buildup near Gate A entrance corridor.",
  },
  {
    id: "inc-2",
    type: "traffic",
    zoneId: "central",
    severity: "medium",
    status: "open",
    description: "Heavy traffic reported on Triveni Marg feeding Route S1.",
  },
];
