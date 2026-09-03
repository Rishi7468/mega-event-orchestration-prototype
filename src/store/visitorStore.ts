import { create } from "zustand";
import { DEFAULT_ORIGIN_ID, visitorProfile } from "@/data";
import { subscribeDemoReset } from "@/lib/demoReset";
import type { VisitorProfile } from "@/types";

export type VisitMode = "planned" | "now";

/**
 * Holds only the visitor's *decisions* — what they're attending, where
 * they're travelling from, preferences, the stay they picked, the gate
 * they're heading to, how far along the journey they are.
 *
 * It deliberately stores no derived itinerary: the journey is always
 * recomputed by lib/journey/buildJourney.ts from these choices plus the
 * live destination conditions, so a change in conditions is reflected
 * everywhere at once instead of leaving a stale copy behind.
 *
 * This complements the simulation store (which owns destination state) —
 * it does not duplicate or compete with it.
 */
type VisitorState = {
  /** The event the visitor intends to attend. null = not chosen yet. */
  destinationId: string | null;
  /** Journey origin — always separate from the destination. */
  originId: string;
  /** Chosen day of the event; null means "flexible / best time". */
  selectedDayId: string | null;
  /**
   * Whether the visitor is planning ahead or leaving now. "now" plans against
   * current conditions and skips date selection entirely — the real-world case
   * where someone is already travelling and needs an answer immediately.
   */
  visitMode: VisitMode;

  profile: VisitorProfile;
  selectedZoneId: string | null;
  selectedPropertyId: string | null;
  /** null = follow the current gate recommendation. */
  gateId: string | null;
  journeyStarted: boolean;
  /** Frozen at journey start so re-planning moves arrival, not departure. */
  departureTime: string | null;
  currentStepIndex: number;
  /** Visitor explicitly declined the re-optimization offer. */
  keptOriginalPlan: boolean;

  chooseDestination: (destinationId: string) => void;
  clearDestination: () => void;
  setOrigin: (originId: string) => void;
  setSelectedDay: (dayId: string | null) => void;
  /** "I'm going now" — clears any chosen future date. */
  startVisitNow: () => void;
  planAhead: () => void;
  updateProfile: (patch: Partial<VisitorProfile>) => void;
  selectStay: (zoneId: string, propertyId?: string | null) => void;
  setGate: (gateId: string) => void;
  startJourney: (departureTime: string, gateId: string) => void;
  advanceStep: (stepCount: number) => void;
  keepOriginalPlan: () => void;
  resetTrip: () => void;
};

/** Everything downstream of picking an event, so switching events resets it. */
const emptyPlan = {
  selectedZoneId: null,
  selectedPropertyId: null,
  gateId: null,
  journeyStarted: false,
  departureTime: null,
  currentStepIndex: 0,
  keptOriginalPlan: false,
};

const initialState = {
  destinationId: null,
  originId: DEFAULT_ORIGIN_ID,
  selectedDayId: null,
  visitMode: "planned" as VisitMode,
  profile: visitorProfile,
  ...emptyPlan,
};

export const useVisitorStore = create<VisitorState>((set) => ({
  ...initialState,

  // Switching events invalidates any plan built for the previous one.
  chooseDestination: (destinationId) =>
    set((state) =>
      state.destinationId === destinationId
        ? { destinationId }
        : { destinationId, selectedDayId: null, visitMode: "planned" as VisitMode, ...emptyPlan },
    ),

  clearDestination: () =>
    set({ destinationId: null, selectedDayId: null, visitMode: "planned", ...emptyPlan }),

  setOrigin: (originId) => set({ originId }),

  // Picking a date is itself the signal that this is a planned trip.
  setSelectedDay: (selectedDayId) => set({ selectedDayId, visitMode: "planned" }),

  startVisitNow: () => set({ visitMode: "now", selectedDayId: null }),

  planAhead: () => set({ visitMode: "planned" }),

  updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),

  selectStay: (zoneId, propertyId = null) =>
    set({ selectedZoneId: zoneId, selectedPropertyId: propertyId }),

  setGate: (gateId) => set({ gateId, keptOriginalPlan: false }),

  /**
   * Pins both the departure time and the gate at the moment of departure.
   * Without pinning the gate, the itinerary would silently re-route itself
   * the instant conditions changed — and there would be nothing left to
   * recommend, because the plan would already have moved.
   */
  startJourney: (departureTime, gateId) =>
    set({ journeyStarted: true, departureTime, gateId, currentStepIndex: 0 }),

  advanceStep: (stepCount) =>
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, Math.max(0, stepCount - 1)),
    })),

  keepOriginalPlan: () => set({ keptOriginalPlan: true }),

  resetTrip: () => set({ ...initialState }),
}));

/**
 * A demo reset from any surface (including another tab) clears this tab's
 * visitor plan too, so every run starts from the same blank slate.
 */
if (typeof window !== "undefined") {
  subscribeDemoReset(() => useVisitorStore.getState().resetTrip());
}
