import { create } from "zustand";

export type VisitorSignalType = "crowd" | "queue" | "medical" | "facility" | "safety";

export type VisitorSignalReport = {
  id: string;
  type: VisitorSignalType;
  h3Index: string;
  zoneId: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  experienceRating: number; // 1 to 5
};

export type VisitorSignalStoreState = {
  signals: VisitorSignalReport[];
  
  // Actions
  submitSignal: (signal: Omit<VisitorSignalReport, "id" | "timestamp">) => void;
  getAggregatedReportsByCell: () => { h3Index: string; count: number; avgRating: number }[];
  clearSignals: () => void;
};

const DEFAULT_SIGNALS: VisitorSignalReport[] = [
  {
    id: "sig-001",
    type: "crowd",
    h3Index: "8828308280fffff",
    zoneId: "central",
    timestamp: "17:42:00",
    severity: "high",
    message: "Heavy pedestrian congestion near turnstiles; movement slowed down.",
    experienceRating: 2,
  },
  {
    id: "sig-002",
    type: "queue",
    h3Index: "8828308280fffff",
    zoneId: "central",
    timestamp: "17:43:15",
    severity: "medium",
    message: "Gate A entry queue line extending beyond stanchion barrier.",
    experienceRating: 2,
  },
  {
    id: "sig-003",
    type: "medical",
    h3Index: "8828308285fffff",
    zoneId: "north",
    timestamp: "17:45:00",
    severity: "high",
    message: "Heat exhaustion report near Sector 2 shuttle stop.",
    experienceRating: 1,
  },
];

export const useVisitorSignalStore = create<VisitorSignalStoreState>()((set, get) => ({
  signals: DEFAULT_SIGNALS,

  submitSignal: (data) => {
    const newSignal: VisitorSignalReport = {
      ...data,
      id: `sig-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    set((state) => ({ signals: [newSignal, ...state.signals] }));
  },

  getAggregatedReportsByCell: () => {
    const { signals } = get();
    const cellMap: Record<string, { count: number; totalRating: number }> = {};

    signals.forEach((s) => {
      if (!cellMap[s.h3Index]) {
        cellMap[s.h3Index] = { count: 0, totalRating: 0 };
      }
      cellMap[s.h3Index].count += 1;
      cellMap[s.h3Index].totalRating += s.experienceRating;
    });

    return Object.entries(cellMap).map(([h3Index, data]) => ({
      h3Index,
      count: data.count,
      avgRating: Number((data.totalRating / data.count).toFixed(1)),
    }));
  },

  clearSignals: () => {
    set({ signals: [] });
  },
}));
