import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  cameraObservationsNormal,
  cameraObservationsSpike,
  incidents as initialIncidents,
  resolveCameras,
  resolveRoutes,
  transportSnapshotsNormal,
  transportSnapshotsSpike,
  venueGatesElevated,
  venueGatesNormal,
  zoneSnapshotsNormal,
  zoneSnapshotsSpike,
  zones,
} from "@/data";
import { orchestrationConfig } from "@/config/orchestrationConfig";
import { EVENT_CONFIGS } from "@/config/eventConfigs";
import type { FieldTask, TaskStatus } from "@/types/fieldTask";
import type {
  ActiveIntervention,
  Camera,
  Incident,
  Measurement,
  MetricDelta,
  SimulationPhase,
  TransportRoute,
  VenueGate,
  ZoneSnapshot,
} from "@/types";

const PHASE_ORDER: SimulationPhase[] = [
  "normal",
  "demand-spike",
  "prediction",
  "recommendation",
  "accepted",
  "response",
  "outcome",
];

const STORAGE_KEY = "meho.simulation.v1";

const initialGates = venueGatesNormal;
const initialRoutes = resolveRoutes(transportSnapshotsNormal);
const initialCameras = resolveCameras(cameraObservationsNormal);

const initialFieldTasks: FieldTask[] = [
  {
    id: "task-01",
    title: "Deploy Crowd Barriers at Gate A",
    assignedStaff: "Officer Ramesh (Sector 1)",
    zoneId: "central",
    gateId: "gate-a",
    type: "gate_control",
    priority: "high",
    status: "assigned",
    instruction: "Set up queue management stanchions to regulate influx into Central Ghat.",
    createdAt: "09:15 AM",
  },
  {
    id: "task-02",
    title: "Direct Visitors to North Transit Line",
    assignedStaff: "Officer Priya (Sector 2)",
    zoneId: "north",
    type: "crowd_direction",
    priority: "medium",
    status: "in_progress",
    instruction: "Guide incoming pedestrian flow toward North accommodation zone shuttle stops.",
    createdAt: "09:20 AM",
  },
];

export type SimulationState = {
  phase: SimulationPhase;
  activeEventConfigId: string;
  zoneSnapshots: ZoneSnapshot[];
  venueGates: VenueGate[];
  routes: TransportRoute[];
  cameras: Camera[];
  incidents: Incident[];
  fieldTasks: FieldTask[];
  activeInterventions: ActiveIntervention[];
  measurements: Measurement[];
  visitorTravelMinutes: number;

  setEventConfig: (configId: string) => void;
  advancePhase: () => void;
  triggerDemandSpike: () => void;
  runDemandSpikeScenario: () => void;
  acceptVisitorRecommendation: () => void;
  approveOperatorResponse: () => void;

  executeIntervention: (interventionId: string) => void;

  addIncident: (incident: Omit<Incident, "id">) => void;
  acknowledgeIncident: (incidentId: string) => void;
  resolveIncident: (incidentId: string) => void;

  updateFieldTaskStatus: (taskId: string, status: TaskStatus) => void;
  addFieldTask: (task: Omit<FieldTask, "id" | "createdAt">) => void;

  reset: () => void;
};

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      phase: "normal",
      activeEventConfigId: "kumbh-mela",
      zoneSnapshots: zoneSnapshotsNormal,
      venueGates: initialGates,
      routes: initialRoutes,
      cameras: initialCameras,
      incidents: initialIncidents,
      fieldTasks: initialFieldTasks,
      activeInterventions: [],
      measurements: [],
      visitorTravelMinutes: 42,

      setEventConfig: (configId: string) => {
        const cfg = EVENT_CONFIGS[configId];
        if (!cfg) return;
        set({
          activeEventConfigId: configId,
          zoneSnapshots: cfg.zones.map((z) => ({
            zoneId: z.id,
            accommodationPressure: z.pressurePercent,
            crowdPressure: z.pressurePercent,
            transportUtilization: 60,
          })),
          venueGates: cfg.gates,
          routes: cfg.routes,
        });
      },

      advancePhase: () => {
        const currentIndex = PHASE_ORDER.indexOf(get().phase);
        const next = PHASE_ORDER[Math.min(currentIndex + 1, PHASE_ORDER.length - 1)];
        set({ phase: next });
      },

      triggerDemandSpike: () => {
        if (get().phase !== "normal") return;
        set({
          phase: "demand-spike",
          zoneSnapshots: zoneSnapshotsSpike,
          venueGates: venueGatesElevated,
          routes: resolveRoutes(transportSnapshotsSpike),
          cameras: resolveCameras(cameraObservationsSpike),
          visitorTravelMinutes: 42,
        });
      },

      runDemandSpikeScenario: () => {
        if (get().phase !== "normal") return;
        set({
          phase: "recommendation",
          zoneSnapshots: zoneSnapshotsSpike,
          venueGates: venueGatesElevated,
          routes: resolveRoutes(transportSnapshotsSpike),
          cameras: resolveCameras(cameraObservationsSpike),
          visitorTravelMinutes: 42,
        });
      },

      acceptVisitorRecommendation: () => {
        if (get().phase !== "recommendation") return;
        set({ phase: "accepted" });
      },

      approveOperatorResponse: () => {
        if (get().phase !== "recommendation" && get().phase !== "demand-spike") return;
        set({ phase: "response" });
        get().executeIntervention("redirect-arrivals");
      },

      executeIntervention: (interventionId: string) => {
        const state = get();
        const beforeZoneSnapshots = state.zoneSnapshots;
        const beforeGates = state.venueGates;

        let newSnapshots = [...state.zoneSnapshots];
        let newGates = [...state.venueGates];
        let newRoutes = [...state.routes];
        let title = "Custom Intervention";
        let target = "Destination System";

        if (interventionId === "redirect-arrivals") {
          title = "Redirect Central Arrivals";
          target = "Central & North Zones";
          newSnapshots = newSnapshots.map((s) => {
            if (s.zoneId === "central") {
              return {
                ...s,
                accommodationPressure: Math.max(0, s.accommodationPressure + orchestrationConfig.redistribution.centralPressureDelta),
                crowdPressure: Math.max(0, s.crowdPressure + orchestrationConfig.redistribution.centralPressureDelta),
                transportUtilization: Math.max(0, s.transportUtilization + orchestrationConfig.redistribution.transportUtilDelta),
              };
            }
            if (s.zoneId === "north") {
              return {
                ...s,
                accommodationPressure: Math.min(100, s.accommodationPressure + orchestrationConfig.redistribution.northPressureDelta),
                crowdPressure: Math.min(100, s.crowdPressure + orchestrationConfig.redistribution.northPressureDelta),
              };
            }
            return s;
          });
          newGates = newGates.map((g) => {
            if (g.id === "gate-a") {
              return {
                ...g,
                currentQueue: Math.max(0, g.currentQueue - 440),
                estimatedWaitMinutes: Math.max(2, g.estimatedWaitMinutes - 12),
                status: "open",
              };
            }
            if (g.id === "gate-b") {
              return {
                ...g,
                currentQueue: g.currentQueue + 200,
                estimatedWaitMinutes: g.estimatedWaitMinutes + 2,
                status: "open",
              };
            }
            return g;
          });
          newRoutes = newRoutes.map((r) => {
            if (r.id === "route-s1") {
              return { ...r, currentDemandPerHour: 2040, congestion: "medium" };
            }
            if (r.id === "route-s3") {
              return { ...r, currentDemandPerHour: 1464, congestion: "low" };
            }
            return r;
          });
        } else if (interventionId === "promote-gate-b") {
          title = "Promote Gate B";
          target = "Gate A & Gate B";
          newGates = newGates.map((g) => {
            if (g.id === "gate-a") {
              return { ...g, currentQueue: 280, estimatedWaitMinutes: 7, status: "open" };
            }
            if (g.id === "gate-b") {
              return { ...g, currentQueue: 440, estimatedWaitMinutes: 8, status: "open" };
            }
            return g;
          });
        } else if (interventionId === "adjust-shuttle") {
          title = "Adjust Shuttle Allocation";
          target = "Route S1 & Route S3";
          newRoutes = newRoutes.map((r) => {
            if (r.id === "route-s1") {
              return { ...r, currentDemandPerHour: 2040, congestion: "medium" };
            }
            if (r.id === "route-s3") {
              return { ...r, currentDemandPerHour: 1464, congestion: "low" };
            }
            return r;
          });
        } else if (interventionId === "recommend-off-peak") {
          title = "Recommend Off-Peak Arrival";
          target = "Arrival Windows";
          newSnapshots = newSnapshots.map((s) => {
            if (s.zoneId === "central") {
              return { ...s, crowdPressure: Math.max(0, s.crowdPressure - 12) };
            }
            return s;
          });
        }

        const pressuredBefore = beforeZoneSnapshots.find((s) => s.zoneId === "central")?.accommodationPressure ?? 91;
        const pressuredAfter = newSnapshots.find((s) => s.zoneId === "central")?.accommodationPressure ?? 72;
        const spareBefore = beforeZoneSnapshots.find((s) => s.zoneId === "north")?.accommodationPressure ?? 48;
        const spareAfter = newSnapshots.find((s) => s.zoneId === "north")?.accommodationPressure ?? 59;
        const transportBefore = beforeZoneSnapshots.find((s) => s.zoneId === "central")?.transportUtilization ?? 88;
        const transportAfter = newSnapshots.find((s) => s.zoneId === "central")?.transportUtilization ?? 68;

        const impact: MetricDelta = {
          pressuredZoneId: "central",
          pressuredZoneName: zones.find((z) => z.id === "central")?.name ?? "Central Zone",
          spareZoneId: "north",
          spareZoneName: zones.find((z) => z.id === "north")?.name ?? "North Zone",
          pressuredBefore,
          pressuredAfter,
          pressuredDelta: pressuredAfter - pressuredBefore,
          spareBefore,
          spareAfter,
          spareDelta: spareAfter - spareBefore,
          transportBefore,
          transportAfter,
          transportDelta: transportAfter - transportBefore,
          gateAWaitBefore: beforeGates.find((g) => g.id === "gate-a")?.estimatedWaitMinutes ?? 18,
          gateAWaitAfter: newGates.find((g) => g.id === "gate-a")?.estimatedWaitMinutes ?? 6,
        };

        const newMeasurement: Measurement = {
          id: `meas-${Date.now()}`,
          interventionId,
          interventionTitle: title,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          before: { zoneSnapshots: beforeZoneSnapshots },
          after: { zoneSnapshots: newSnapshots },
          impact,
        };

        const newActiveIntervention: ActiveIntervention = {
          id: `act-${Date.now()}`,
          type: interventionId,
          title,
          target,
          initiatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "active",
        };

        set((state) => ({
          phase: "outcome",
          zoneSnapshots: newSnapshots,
          venueGates: newGates,
          routes: newRoutes,
          visitorTravelMinutes: 31,
          measurements: [newMeasurement, ...state.measurements],
          activeInterventions: [newActiveIntervention, ...state.activeInterventions],
        }));
      },

      addIncident: (inc) => {
        const newIncident: Incident = {
          ...inc,
          id: `inc-${Date.now()}`,
        };
        set((state) => ({ incidents: [newIncident, ...state.incidents] }));
      },

      acknowledgeIncident: (id) => {
        set((state) => ({
          incidents: state.incidents.map((inc) =>
            inc.id === id ? { ...inc, status: "responding" } : inc,
          ),
        }));
      },

      resolveIncident: (id) => {
        set((state) => ({
          incidents: state.incidents.map((inc) =>
            inc.id === id ? { ...inc, status: "resolved" } : inc,
          ),
        }));
      },

      updateFieldTaskStatus: (taskId, status) => {
        set((state) => ({
          fieldTasks: state.fieldTasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        }));
      },

      addFieldTask: (task) => {
        const newTask: FieldTask = {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        set((state) => ({ fieldTasks: [newTask, ...state.fieldTasks] }));
      },

      reset: () =>
        set({
          phase: "normal",
          activeEventConfigId: "kumbh-mela",
          zoneSnapshots: zoneSnapshotsNormal,
          venueGates: initialGates,
          routes: initialRoutes,
          cameras: initialCameras,
          incidents: initialIncidents,
          fieldTasks: initialFieldTasks,
          activeInterventions: [],
          measurements: [],
          visitorTravelMinutes: 42,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        phase: state.phase,
        activeEventConfigId: state.activeEventConfigId,
        zoneSnapshots: state.zoneSnapshots,
        venueGates: state.venueGates,
        routes: state.routes,
        cameras: state.cameras,
        incidents: state.incidents,
        fieldTasks: state.fieldTasks,
        activeInterventions: state.activeInterventions,
        measurements: state.measurements,
        visitorTravelMinutes: state.visitorTravelMinutes,
      }),
      merge: (persisted, current) => {
        const p = (persisted as Partial<SimulationState> | undefined) ?? {};
        return {
          ...current,
          ...p,
          phase: p.phase ?? current.phase,
          activeEventConfigId: p.activeEventConfigId ?? current.activeEventConfigId,
          zoneSnapshots: p.zoneSnapshots ?? current.zoneSnapshots,
          venueGates: p.venueGates ?? current.venueGates,
          routes: p.routes ?? current.routes,
          cameras: p.cameras ?? current.cameras,
          incidents: p.incidents ?? current.incidents,
          fieldTasks: p.fieldTasks ?? current.fieldTasks,
          activeInterventions: p.activeInterventions ?? current.activeInterventions,
          measurements: p.measurements ?? current.measurements,
          visitorTravelMinutes: p.visitorTravelMinutes ?? current.visitorTravelMinutes,
        };
      },
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as { state?: Partial<SimulationState> };
      if (!parsed.state) return;
      useSimulationStore.setState(parsed.state);
    } catch {
      // Non-fatal cross-tab listener error handling
    }
  });
}
