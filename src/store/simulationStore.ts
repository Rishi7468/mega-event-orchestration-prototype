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
  ZoneCrowdState,
  EdgeCrowdState,
  CrowdFlowGraph,
  ZonePredictionState,
  EventAwareRoutingResult,
  ActiveJourneyState,
  ActiveItineraryState,
  ItineraryPreferences,
} from "@/types";
import { mapCameraTelemetryToEdges } from "@/lib/cv/cameraEdgeRegistry";
import { createInitialCrowdFlowGraph, updateCrowdFlowGraphWithTelemetry } from "@/lib/intelligence/flowGraphEngine";
import {
  calculateInterventionScenario,
  type InterventionItem,
  type ScenarioCalculationResult,
} from "@/lib/intelligence/scenarioEngine";
import { computeAllZonePredictions } from "@/lib/intelligence/predictionEngine";
import { calculateEventAwareRoutes } from "@/lib/intelligence/eventRoutingEngine";
import { optimizeMultiStopItinerary } from "@/lib/intelligence/itineraryOptimizer";

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

const initialLiveCrowdStates: Record<string, ZoneCrowdState> = {
  central: {
    zoneId: "central",
    peopleCount: 31000,
    occupancyPercent: 62,
    densityPerSqMeter: 1.55,
    crowdLevel: "MODERATE",
    trend: "STABLE",
    confidencePercent: 94,
    lastUpdated: "Just now",
    source: "SIMULATED",
    anonymousTrackIds: ["trk_central_101", "trk_central_102", "trk_central_103"],
  },
  north: {
    zoneId: "north",
    peopleCount: 16800,
    occupancyPercent: 42,
    densityPerSqMeter: 1.05,
    crowdLevel: "LOW",
    trend: "STABLE",
    confidencePercent: 94,
    lastUpdated: "Just now",
    source: "SIMULATED",
    anonymousTrackIds: ["trk_north_101", "trk_north_102"],
  },
  east: {
    zoneId: "east",
    peopleCount: 10850,
    occupancyPercent: 31,
    densityPerSqMeter: 0.78,
    crowdLevel: "LOW",
    trend: "STABLE",
    confidencePercent: 92,
    lastUpdated: "Just now",
    source: "SIMULATED",
    anonymousTrackIds: ["trk_east_101"],
  },
  south: {
    zoneId: "south",
    peopleCount: 11400,
    occupancyPercent: 38,
    densityPerSqMeter: 0.95,
    crowdLevel: "LOW",
    trend: "STABLE",
    confidencePercent: 92,
    lastUpdated: "Just now",
    source: "SIMULATED",
    anonymousTrackIds: ["trk_south_101"],
  },
};

export type SimulationState = {
  phase: SimulationPhase;
  activeEventConfigId: string;
  zoneSnapshots: ZoneSnapshot[];
  liveCrowdStates: Record<string, ZoneCrowdState>;
  edgeCrowdStates: Record<string, EdgeCrowdState>;
  flowGraph: CrowdFlowGraph;
  predictions: Record<string, ZonePredictionState>;
  eventRouting: EventAwareRoutingResult;
  activeJourney: ActiveJourneyState;
  activeItinerary: ActiveItineraryState;
  acknowledgedRecommendationIds: string[];
  activeRecommendationHighlight: {
    affectedZoneId?: string;
    affectedEdgeId?: string;
    alternativeEdgeId?: string;
  } | null;
  activeScenarioResult: ScenarioCalculationResult | null;
  appliedSimulatedInterventions: InterventionItem[];

  simulateScenario: (interventions: InterventionItem[]) => void;
  applySimulatedInterventions: (interventions: InterventionItem[]) => void;
  resetSimulatedInterventions: () => void;
  clearScenario: () => void;
  venueGates: VenueGate[];
  routes: TransportRoute[];
  cameras: Camera[];
  incidents: Incident[];
  fieldTasks: FieldTask[];
  activeInterventions: ActiveIntervention[];
  measurements: Measurement[];
  visitorTravelMinutes: number;

  updateZoneCrowdState: (zoneId: string, state: Partial<ZoneCrowdState>) => void;
  updateAllZoneCrowdStates: (states: Record<string, ZoneCrowdState>) => void;
  updateEdgeCrowdStates: (updates: Record<string, EdgeCrowdState>) => void;
  updateCameraTelemetry: (
    cameraId: string,
    personCount: number,
    confidencePercent: number,
    trackIds: string[],
    source?: "REAL_VIDEO" | "SIMULATED"
  ) => void;
  updateFlowGraph: (newGraph: CrowdFlowGraph) => void;
  updateFlowEdges: (patches: Array<{ sourceZoneId: string; targetZoneId: string; peoplePerMinute: number }>) => void;
  recalculatePredictions: (whatIfReductionPercent?: number) => void;
  recalculateEventRoutes: (originZoneId?: string, destinationZoneId?: string) => void;

  startActiveJourney: (originZoneId?: string, destinationZoneId?: string) => void;
  evaluateActiveJourneyReroute: () => void;
  acceptReroute: () => void;
  dismissReroute: () => void;

  buildMultiStopItinerary: (
    startZoneId?: string,
    availableTimeMinutes?: number,
    selectedLandmarkIds?: string[],
    preferences?: Partial<ItineraryPreferences>
  ) => void;
  evaluateActiveItineraryReorder: () => void;
  acceptItineraryReorder: () => void;
  dismissItineraryReorder: () => void;

  acknowledgeRecommendation: (id: string) => void;
  setRecommendationHighlight: (
    highlight: {
      affectedZoneId?: string;
      affectedEdgeId?: string;
      alternativeEdgeId?: string;
    } | null
  ) => void;

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

const initialFlowGraph = createInitialCrowdFlowGraph();
const initialPredictions = computeAllZonePredictions(initialLiveCrowdStates, initialFlowGraph.zoneFlows).zonePredictions;
const initialEventRouting = calculateEventAwareRoutes("south", "central", initialLiveCrowdStates, initialPredictions);

const initialActiveJourney: ActiveJourneyState = {
  journeyActive: false,
  originZoneId: "south",
  destinationZoneId: "central",
  currentRoute: initialEventRouting.recommendedRoute,
  startedAt: null,
  currentRouteCost: initialEventRouting.recommendedRoute.totalRouteCost,
  lastEvaluatedAt: null,
  rerouteAvailable: false,
  rerouteReason: null,
  pendingAlternativeRoute: null,
  lastRerouteTimestamp: 0,
  userAcceptedRerouteCount: 0,
};

const initialActiveItinerary: ActiveItineraryState = {
  active: false,
  startZoneId: "south",
  availableTimeMinutes: 240,
  selectedLandmarkIds: ["sangam", "temple", "cultural", "food-market"],
  preferences: {
    avoidCrowds: false,
    minimizeWalking: false,
    maximizeAttractions: true,
  },
  result: optimizeMultiStopItinerary(
    "south",
    240,
    ["sangam", "temple", "cultural", "food-market"],
    { avoidCrowds: false, minimizeWalking: false, maximizeAttractions: true },
    initialLiveCrowdStates,
    initialPredictions
  ),
  reorderAvailable: false,
  reorderReason: null,
  pendingResult: null,
  lastEvaluatedTimestamp: 0,
  userAcceptedReorderCount: 0,
};

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      phase: "normal",
      activeEventConfigId: "kumbh-mela",
      zoneSnapshots: zoneSnapshotsNormal,
      liveCrowdStates: initialLiveCrowdStates,
      edgeCrowdStates: {},
      flowGraph: initialFlowGraph,
      predictions: initialPredictions,
      eventRouting: initialEventRouting,
      activeJourney: initialActiveJourney,
      activeItinerary: initialActiveItinerary,
      acknowledgedRecommendationIds: [],
      activeRecommendationHighlight: null,
      activeScenarioResult: null,
      appliedSimulatedInterventions: [],
      venueGates: initialGates,
      routes: initialRoutes,
      cameras: initialCameras,
      incidents: initialIncidents,
      fieldTasks: initialFieldTasks,
      activeInterventions: [],
      measurements: [],
      visitorTravelMinutes: 42,

      simulateScenario: (interventions) => {
        const state = get();
        const result = calculateInterventionScenario(
          interventions,
          state.liveCrowdStates,
          state.edgeCrowdStates,
          state.predictions,
          state.activeJourney,
          state.activeItinerary
        );
        set({ activeScenarioResult: result });
      },

      applySimulatedInterventions: (interventions) => {
        const state = get();
        const result = calculateInterventionScenario(
          interventions,
          state.liveCrowdStates,
          state.edgeCrowdStates,
          state.predictions,
          state.activeJourney,
          state.activeItinerary
        );

        const updatedZoneStates = { ...state.liveCrowdStates };
        Object.values(result.horizons["15m"].zones).forEach((proj) => {
          if (updatedZoneStates[proj.zoneId]) {
            updatedZoneStates[proj.zoneId] = {
              ...updatedZoneStates[proj.zoneId],
              occupancyPercent: proj.projectedOccupancyPercent,
              peopleCount: proj.projectedPeopleCount,
              crowdLevel: proj.projectedCrowdLevel,
              source: "SIMULATED",
            };
          }
        });

        set({
          activeScenarioResult: result,
          appliedSimulatedInterventions: interventions,
          liveCrowdStates: updatedZoneStates,
        });

        get().recalculatePredictions();
        get().recalculateEventRoutes();
      },

      resetSimulatedInterventions: () => {
        set({
          activeScenarioResult: null,
          appliedSimulatedInterventions: [],
        });
        get().recalculatePredictions();
        get().recalculateEventRoutes();
      },

      clearScenario: () => {
        set({ activeScenarioResult: null });
      },

      acknowledgeRecommendation: (id) => {
        set((state) => ({
          acknowledgedRecommendationIds: Array.from(
            new Set([...state.acknowledgedRecommendationIds, id])
          ),
        }));
      },

      setRecommendationHighlight: (highlight) => {
        set({ activeRecommendationHighlight: highlight });
      },

      updateEdgeCrowdStates: (updates) => {
        set((state) => ({
          edgeCrowdStates: {
            ...state.edgeCrowdStates,
            ...updates,
          },
        }));
      },

      updateCameraTelemetry: (cameraId, personCount, confidencePercent, trackIds, source = "REAL_VIDEO") => {
        const edgeUpdates = mapCameraTelemetryToEdges(
          cameraId,
          personCount,
          confidencePercent,
          trackIds,
          source
        );
        set((state) => ({
          edgeCrowdStates: {
            ...state.edgeCrowdStates,
            ...edgeUpdates,
          },
        }));
      },

      recalculateEventRoutes: (originZoneId = "south", destinationZoneId = "central") => {
        const state = get();
        const activeIncidentsZones = state.incidents
          .filter((i) => i.status !== "resolved")
          .map((i) => i.zoneId);
        const result = calculateEventAwareRoutes(
          originZoneId,
          destinationZoneId,
          state.liveCrowdStates,
          state.predictions,
          activeIncidentsZones
        );
        set({ eventRouting: result });
      },

      evaluateActiveJourneyReroute: () => {
        const state = get();
        const aj = state.activeJourney;
        if (!aj || !aj.journeyActive || !aj.currentRoute) return;

        const now = Date.now();
        // Anti-oscillation Rule: 10s cooldown unless reroute already offered
        if (now - aj.lastRerouteTimestamp < 10000 && !aj.rerouteAvailable) return;

        const routingResult = calculateEventAwareRoutes(
          aj.originZoneId,
          aj.destinationZoneId,
          state.liveCrowdStates,
          state.predictions
        );

        const bestAlternative = routingResult.recommendedRoute;
        const currentRouteId = aj.currentRoute.id;
        const currentUpdated =
          routingResult.candidates.find((c) => c.id === currentRouteId) ?? aj.currentRoute;
        const currentCost = currentUpdated.totalRouteCost;

        let triggerReason: string | null = null;

        if (
          currentUpdated.dominantCrowdLevel === "CRITICAL" ||
          currentUpdated.dominantCrowdLevel === "HIGH"
        ) {
          triggerReason = `Crowd pressure on your current route has escalated to ${currentUpdated.dominantCrowdLevel}.`;
        } else if (currentUpdated.predictedRiskLevel === "CRITICAL") {
          triggerReason = `A zone along your current route is predicted to reach CRITICAL density within 15 minutes.`;
        } else if (currentUpdated.incidentPenalty > 0) {
          triggerReason = `An active operational restriction is affecting your current corridor.`;
        } else if (
          bestAlternative.id !== currentRouteId &&
          bestAlternative.totalRouteCost + 12 < currentCost
        ) {
          triggerReason = `A significantly faster, less congested bypass route is available.`;
        }

        if (triggerReason && bestAlternative.id !== currentRouteId) {
          set((s) => ({
            activeJourney: {
              ...s.activeJourney,
              currentRouteCost: currentCost,
              lastEvaluatedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              rerouteAvailable: true,
              rerouteReason: triggerReason,
              pendingAlternativeRoute: bestAlternative,
            },
          }));
        } else {
          set((s) => ({
            activeJourney: {
              ...s.activeJourney,
              currentRoute: currentUpdated,
              currentRouteCost: currentCost,
              lastEvaluatedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            },
          }));
        }
      },

      startActiveJourney: (originZoneId = "south", destinationZoneId = "central") => {
        const state = get();
        const routing = calculateEventAwareRoutes(
          originZoneId,
          destinationZoneId,
          state.liveCrowdStates,
          state.predictions
        );
        set({
          activeJourney: {
            journeyActive: true,
            originZoneId,
            destinationZoneId,
            currentRoute: routing.recommendedRoute,
            startedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            currentRouteCost: routing.recommendedRoute.totalRouteCost,
            lastEvaluatedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            rerouteAvailable: false,
            rerouteReason: null,
            pendingAlternativeRoute: null,
            lastRerouteTimestamp: Date.now(),
            userAcceptedRerouteCount: 0,
          },
        });
      },

      acceptReroute: () => {
        set((s) => {
          const aj = s.activeJourney;
          if (!aj.pendingAlternativeRoute) return s;
          return {
            activeJourney: {
              ...aj,
              currentRoute: aj.pendingAlternativeRoute,
              currentRouteCost: aj.pendingAlternativeRoute.totalRouteCost,
              rerouteAvailable: false,
              rerouteReason: null,
              pendingAlternativeRoute: null,
              lastRerouteTimestamp: Date.now(),
              userAcceptedRerouteCount: aj.userAcceptedRerouteCount + 1,
            },
          };
        });
      },

      dismissReroute: () => {
        set((s) => ({
          activeJourney: {
            ...s.activeJourney,
            rerouteAvailable: false,
            rerouteReason: null,
            pendingAlternativeRoute: null,
            lastRerouteTimestamp: Date.now(),
          },
        }));
      },

      buildMultiStopItinerary: (
        startZoneId,
        availableTimeMinutes,
        selectedLandmarkIds,
        preferences
      ) => {
        const state = get();
        const sZone = startZoneId ?? state.activeItinerary.startZoneId;
        const timeMins = availableTimeMinutes ?? state.activeItinerary.availableTimeMinutes;
        const landmarks = selectedLandmarkIds ?? state.activeItinerary.selectedLandmarkIds;
        const prefs = { ...state.activeItinerary.preferences, ...preferences };

        const activeIncidentsZones = state.incidents
          .filter((i) => i.status !== "resolved")
          .map((i) => i.zoneId);

        const result = optimizeMultiStopItinerary(
          sZone,
          timeMins,
          landmarks,
          prefs,
          state.liveCrowdStates,
          state.predictions,
          activeIncidentsZones
        );

        set({
          activeItinerary: {
            active: true,
            startZoneId: sZone,
            availableTimeMinutes: timeMins,
            selectedLandmarkIds: landmarks,
            preferences: prefs,
            result,
            reorderAvailable: false,
            reorderReason: null,
            pendingResult: null,
            lastEvaluatedTimestamp: Date.now(),
            userAcceptedReorderCount: state.activeItinerary.userAcceptedReorderCount,
          },
        });
      },

      evaluateActiveItineraryReorder: () => {
        const state = get();
        const ai = state.activeItinerary;
        if (!ai || !ai.active || !ai.result || ai.result.stops.length === 0) return;

        const now = Date.now();
        if (now - ai.lastEvaluatedTimestamp < 10000 && !ai.reorderAvailable) return;

        const activeIncidentsZones = state.incidents
          .filter((i) => i.status !== "resolved")
          .map((i) => i.zoneId);

        const freshResult = optimizeMultiStopItinerary(
          ai.startZoneId,
          ai.availableTimeMinutes,
          ai.selectedLandmarkIds,
          ai.preferences,
          state.liveCrowdStates,
          state.predictions,
          activeIncidentsZones
        );

        const currentOrder = ai.result.stops.map((s) => s.landmarkId).join(",");
        const newOrder = freshResult.stops.map((s) => s.landmarkId).join(",");

        if (newOrder !== currentOrder && freshResult.overallScore > ai.result.overallScore + 10) {
          const affectedStop = freshResult.stops.find((stop) => {
            const live = state.liveCrowdStates[stop.zoneId];
            return live?.crowdLevel === "HIGH" || live?.crowdLevel === "CRITICAL";
          });

          const reorderReason = affectedStop
            ? `Your journey was reordered because crowd pressure at ${affectedStop.name} is rising.`
            : `An optimized sequence is available to avoid predicted crowd congestion.`;

          set((s) => ({
            activeItinerary: {
              ...s.activeItinerary,
              reorderAvailable: true,
              reorderReason,
              pendingResult: freshResult,
              lastEvaluatedTimestamp: Date.now(),
            },
          }));
        } else {
          set((s) => ({
            activeItinerary: {
              ...s.activeItinerary,
              result: freshResult,
              lastEvaluatedTimestamp: Date.now(),
            },
          }));
        }
      },

      acceptItineraryReorder: () => {
        set((s) => {
          const ai = s.activeItinerary;
          if (!ai.pendingResult) return s;
          return {
            activeItinerary: {
              ...ai,
              result: ai.pendingResult,
              reorderAvailable: false,
              reorderReason: null,
              pendingResult: null,
              lastEvaluatedTimestamp: Date.now(),
              userAcceptedReorderCount: ai.userAcceptedReorderCount + 1,
            },
          };
        });
      },

      dismissItineraryReorder: () => {
        set((s) => ({
          activeItinerary: {
            ...s.activeItinerary,
            reorderAvailable: false,
            reorderReason: null,
            pendingResult: null,
            lastEvaluatedTimestamp: Date.now(),
          },
        }));
      },

      recalculatePredictions: (whatIfReductionPercent = 30) => {
        const state = get();
        const forecast = computeAllZonePredictions(
          state.liveCrowdStates,
          state.flowGraph.zoneFlows,
          undefined,
          whatIfReductionPercent
        );
        set({ predictions: forecast.zonePredictions });
        get().recalculateEventRoutes();
        get().evaluateActiveJourneyReroute();
        get().evaluateActiveItineraryReorder();
      },

      updateFlowGraph: (newGraph) => {
        set({ flowGraph: newGraph });
        get().recalculatePredictions();
      },

      updateFlowEdges: (patches) => {
        set((state) => ({
          flowGraph: updateCrowdFlowGraphWithTelemetry(state.flowGraph, patches),
        }));
        get().recalculatePredictions();
      },

      updateZoneCrowdState: (zoneId, statePatch) => {
        set((state) => {
          const prev = state.liveCrowdStates[zoneId] ?? {
            zoneId,
            peopleCount: 0,
            occupancyPercent: 0,
            densityPerSqMeter: 0,
            crowdLevel: "LOW",
            trend: "STABLE",
            confidencePercent: 90,
            lastUpdated: "Just now",
            source: "SIMULATED",
          };
          const nextLive = {
            ...state.liveCrowdStates,
            [zoneId]: { ...prev, ...statePatch },
          };
          return { liveCrowdStates: nextLive };
        });
        get().recalculatePredictions();
      },

      updateAllZoneCrowdStates: (newStates) => {
        set((state) => ({
          liveCrowdStates: {
            ...state.liveCrowdStates,
            ...newStates,
          },
        }));
        get().recalculatePredictions();
      },

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

      reset: () => {
        const fg = createInitialCrowdFlowGraph();
        const preds = computeAllZonePredictions(initialLiveCrowdStates, fg.zoneFlows).zonePredictions;
        const evRouting = calculateEventAwareRoutes("south", "central", initialLiveCrowdStates, preds);
        set({
          phase: "normal",
          activeEventConfigId: "kumbh-mela",
          zoneSnapshots: zoneSnapshotsNormal,
          liveCrowdStates: initialLiveCrowdStates,
          flowGraph: fg,
          predictions: preds,
          eventRouting: evRouting,
          activeJourney: initialActiveJourney,
          activeItinerary: initialActiveItinerary,
          venueGates: initialGates,
          routes: initialRoutes,
          cameras: initialCameras,
          incidents: initialIncidents,
          fieldTasks: initialFieldTasks,
          activeInterventions: [],
          measurements: [],
          visitorTravelMinutes: 42,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        phase: state.phase,
        activeEventConfigId: state.activeEventConfigId,
        zoneSnapshots: state.zoneSnapshots,
        liveCrowdStates: state.liveCrowdStates,
        flowGraph: state.flowGraph,
        predictions: state.predictions,
        eventRouting: state.eventRouting,
        activeJourney: state.activeJourney,
        activeItinerary: state.activeItinerary,
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
        const liveCrowdStates = p.liveCrowdStates ?? current.liveCrowdStates;
        const flowGraph = p.flowGraph ?? current.flowGraph;
        const predictions = p.predictions ?? computeAllZonePredictions(liveCrowdStates, flowGraph.zoneFlows).zonePredictions;
        const eventRouting = p.eventRouting ?? calculateEventAwareRoutes("south", "central", liveCrowdStates, predictions);
        const activeJourney = p.activeJourney ?? initialActiveJourney;
        const activeItinerary = p.activeItinerary ?? initialActiveItinerary;
        return {
          ...current,
          ...p,
          phase: p.phase ?? current.phase,
          activeEventConfigId: p.activeEventConfigId ?? current.activeEventConfigId,
          zoneSnapshots: p.zoneSnapshots ?? current.zoneSnapshots,
          liveCrowdStates,
          flowGraph,
          predictions,
          eventRouting,
          activeJourney,
          activeItinerary,
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
