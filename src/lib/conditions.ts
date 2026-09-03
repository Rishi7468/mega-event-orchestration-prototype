import {
  cameraObservationsNormal,
  cameraObservationsOutcome,
  cameraObservationsSpike,
  resolveCameras,
  resolveRoutes,
  transportSnapshotsNormal,
  transportSnapshotsOutcome,
  transportSnapshotsSpike,
  venueGatesElevated,
  venueGatesNormal,
  zoneSnapshotsSpike,
} from "@/data";
import type {
  Camera,
  SimulationPhase,
  TransportRoute,
  VenueGate,
  ZoneSnapshot,
} from "@/types";

/**
 * Single translation point from "which simulation phase are we in" to
 * "what does the destination look like to a visitor right now".
 *
 * Deliberately does NOT re-derive zone snapshots — the simulation store
 * already owns that mapping and components read it from there, so there is
 * only one source of truth for pressure figures.
 */

/** Conditions have moved away from the calm baseline. */
export function isElevated(phase: SimulationPhase): boolean {
  return phase === "demand-spike" || phase === "prediction" || phase === "recommendation" || phase === "accepted";
}

/** True while the destination is disrupted but no response has landed yet. */
export function isDisrupted(phase: SimulationPhase): boolean {
  return phase === "demand-spike" || phase === "prediction" || phase === "recommendation";
}

/** True once an intervention has been approved and pressure is easing. */
export function isRecovering(phase: SimulationPhase): boolean {
  return phase === "response" || phase === "outcome";
}

/**
 * Gate queues follow the same three-stage arc as zone pressure: calm,
 * elevated during the spike, then easing once a response is approved.
 * Without the recovery stage, Gate A's queue would stay stuck at its worst
 * reading even after the operator fixes the underlying pressure — which
 * would make the outcome view (docs/05 "Outcome") show pressure improving
 * while the gate experience visibly didn't.
 */
export function getGatesForPhase(phase: SimulationPhase): VenueGate[] {
  if (isRecovering(phase)) return venueGatesNormal;
  return isElevated(phase) ? venueGatesElevated : venueGatesNormal;
}

/**
 * Transport follows the same three-stage arc as crowd pressure and gate
 * queues: calm, strained during the spike, easing once a response lands.
 * Every consumer — route recommendation, journey builder, operator tables,
 * intervention constraints — reads routes through here, so no surface can
 * show a utilization figure that disagrees with the current phase.
 */
export function getRoutesForPhase(phase: SimulationPhase): TransportRoute[] {
  if (isRecovering(phase)) return resolveRoutes(transportSnapshotsOutcome);
  return isElevated(phase)
    ? resolveRoutes(transportSnapshotsSpike)
    : resolveRoutes(transportSnapshotsNormal);
}

/** Camera observations move with the phase — they are the source of the pressure figures. */
export function getCamerasForPhase(phase: SimulationPhase): Camera[] {
  if (isRecovering(phase)) return resolveCameras(cameraObservationsOutcome);
  return isElevated(phase)
    ? resolveCameras(cameraObservationsSpike)
    : resolveCameras(cameraObservationsNormal);
}

/**
 * The peak reading for this cycle's spike scenario — the snapshot the
 * recommendation and outcome panels should keep describing for as long as
 * a scenario is active, even once live pressure has already recovered
 * during 'response'/'outcome'. Without this, the outcome view would try to
 * compute a before/after delta from a "before" that's already the improved
 * number, and the panel would go blank right when it matters most.
 * Returns null in 'normal' — there is no scenario to describe.
 */
export function getScenarioSnapshots(phase: SimulationPhase): ZoneSnapshot[] | null {
  return phase === "normal" ? null : zoneSnapshotsSpike;
}

export function getZoneSnapshot(
  snapshots: ZoneSnapshot[],
  zoneId: string,
): ZoneSnapshot | undefined {
  return snapshots.find((snapshot) => snapshot.zoneId === zoneId);
}

/** Plain-language crowd label — visitors get words, not percentages (docs/09 §6). */
export function crowdLabel(pressurePercent: number): string {
  if (pressurePercent >= 85) return "Very high";
  if (pressurePercent >= 65) return "High";
  if (pressurePercent >= 45) return "Moderate";
  return "Low";
}

export type CrowdTrend = "increasing" | "stable" | "decreasing";

/**
 * A camera's zone tells us which way its density is heading: rising while
 * the destination is disrupted, easing once a response has landed, flat
 * otherwise. Cameras have no independent time-series in this prototype —
 * the phase itself is the trend signal.
 */
export function getCameraTrend(camera: Camera, phase: SimulationPhase): CrowdTrend {
  // Keyed on isElevated, not isDisrupted: a visitor accepting a re-route
  // ('accepted') doesn't by itself relieve the destination — pressure is
  // still climbing until an intervention is approved, and the feed should
  // say so rather than flipping to "Stable" prematurely.
  if (isElevated(phase) && (camera.status === "elevated" || camera.status === "critical")) {
    return "increasing";
  }
  if (isRecovering(phase) && camera.status !== "normal") return "decreasing";
  return "stable";
}
