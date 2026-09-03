import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  zoneSnapshotsNormal,
  zoneSnapshotsOutcome,
  zoneSnapshotsSpike,
} from "@/data";
import type { SimulationPhase, ZoneSnapshot } from "@/types";

/**
 * Ordered phase sequence for the demo story:
 * NORMAL → DEMAND_SPIKE → PREDICTION → RECOMMENDATION → ACCEPTED → RESPONSE → OUTCOME
 * (docs/12_SIMULATION_ENGINE.md). This store only tracks *which* phase the
 * destination is in and exposes the matching deterministic snapshot table.
 * The full transition animation/timing lives in a later implementation
 * phase — this is the state-shape foundation the wireframed screens will
 * read from.
 */
const PHASE_ORDER: SimulationPhase[] = [
  "normal",
  "demand-spike",
  "prediction",
  "recommendation",
  "accepted",
  "response",
  "outcome",
];

function snapshotsForPhase(phase: SimulationPhase): ZoneSnapshot[] {
  switch (phase) {
    case "normal":
      return zoneSnapshotsNormal;
    case "response":
    case "outcome":
      return zoneSnapshotsOutcome;
    default:
      return zoneSnapshotsSpike;
  }
}

function travelMinutesForPhase(phase: SimulationPhase): number {
  return phase === "response" || phase === "outcome" ? 31 : 42;
}

type SimulationState = {
  phase: SimulationPhase;
  zoneSnapshots: ZoneSnapshot[];
  visitorTravelMinutes: number;
  advancePhase: () => void;
  triggerDemandSpike: () => void;
  /** normal → demand-spike → prediction → recommendation, in one call. */
  runDemandSpikeScenario: () => void;
  acceptVisitorRecommendation: () => void;
  approveOperatorResponse: () => void;
  reset: () => void;
};

const STORAGE_KEY = "meho.simulation.v1";

/**
 * The visitor and operator experiences must read one shared destination
 * state (docs/02 §9, and Phase 3 §16 "do not create two unrelated
 * simulations"). Within a single browser tab that's automatic — both sides
 * import this same module. But the natural way to demo this product is two
 * browser tabs/windows side by side (visitor on a phone-sized view,
 * operator on desktop — docs/13 Scene 7 "Switch to desktop"), and each tab
 * runs its own independent JS instance with no shared memory. `persist`
 * writes every change to localStorage; the `storage` listener below makes
 * *other* tabs notice that write and rehydrate, so a visitor's accepted
 * recommendation in one tab shows up in the operator's tab moments later.
 *
 * Only `phase` is persisted — it's the one fact that must agree across
 * tabs. `zoneSnapshots`/`visitorTravelMinutes` are recomputed from it on
 * every hydration rather than also persisted, so there is exactly one
 * source of truth for what a given phase looks like.
 */
export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      phase: "normal",
      zoneSnapshots: snapshotsForPhase("normal"),
      visitorTravelMinutes: travelMinutesForPhase("normal"),

      advancePhase: () => {
        const currentIndex = PHASE_ORDER.indexOf(get().phase);
        const next = PHASE_ORDER[Math.min(currentIndex + 1, PHASE_ORDER.length - 1)];
        set({
          phase: next,
          zoneSnapshots: snapshotsForPhase(next),
          visitorTravelMinutes: travelMinutesForPhase(next),
        });
      },

      triggerDemandSpike: () => {
        if (get().phase !== "normal") return;
        set({
          phase: "demand-spike",
          zoneSnapshots: snapshotsForPhase("demand-spike"),
          visitorTravelMinutes: travelMinutesForPhase("demand-spike"),
        });
      },

      /**
       * The single "run the crowd-surge scenario" trigger, shared by the
       * visitor demo control and the operator's simulation control — one
       * place owns the normal → demand-spike → prediction → recommendation
       * sequence instead of each surface re-implementing the chain.
       */
      runDemandSpikeScenario: () => {
        if (get().phase !== "normal") return;
        get().triggerDemandSpike();
        get().advancePhase();
        get().advancePhase();
      },

      acceptVisitorRecommendation: () => {
        if (get().phase !== "recommendation") return;
        set({ phase: "accepted", zoneSnapshots: snapshotsForPhase("accepted") });
      },

      approveOperatorResponse: () => {
        set({
          phase: "outcome",
          zoneSnapshots: snapshotsForPhase("outcome"),
          visitorTravelMinutes: travelMinutesForPhase("outcome"),
        });
      },

      reset: () =>
        set({
          phase: "normal",
          zoneSnapshots: snapshotsForPhase("normal"),
          visitorTravelMinutes: travelMinutesForPhase("normal"),
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ phase: state.phase }),
      /**
       * Only `phase` is persisted, so everything derived from it has to be
       * recomputed as the stored value is merged back in. Done here — a pure
       * function of (persisted, current) — rather than in
       * `onRehydrateStorage`, because that callback can fire while the store
       * binding is still initialising, leaving a freshly-loaded tab showing
       * a non-normal phase alongside normal-phase pressure figures.
       */
      merge: (persisted, current) => {
        const phase = (persisted as Partial<SimulationState> | undefined)?.phase ?? current.phase;
        return {
          ...current,
          phase,
          zoneSnapshots: snapshotsForPhase(phase),
          visitorTravelMinutes: travelMinutesForPhase(phase),
        };
      },
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      // Read the phase straight off `event.newValue` rather than calling
      // `persist.rehydrate()` (which re-reads localStorage asynchronously).
      // `runDemandSpikeScenario` fires three `set()` calls — and so three
      // storage events — in one synchronous burst; concurrent async
      // rehydrates can resolve out of order and leave a tab stuck on an
      // intermediate phase. `event.newValue` is the exact string that
      // specific write produced, so processing events in dispatch order
      // (which the browser guarantees) can never go backwards.
      const parsed = JSON.parse(event.newValue) as { state?: { phase?: SimulationPhase } };
      const phase = parsed.state?.phase;
      if (!phase) return;
      useSimulationStore.setState({
        phase,
        zoneSnapshots: snapshotsForPhase(phase),
        visitorTravelMinutes: travelMinutesForPhase(phase),
      });
    } catch {
      // Non-fatal: this tab simply keeps its current state.
    }
  });
}
