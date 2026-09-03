"use client";

import { getDestinationGeography } from "@/data/geography";
import type { Destination, JourneyStep, TransportRoute, VenueGate, ZoneSnapshot } from "@/types";
import { DestinationMap } from "./DestinationMap";

type JourneyRouteMapProps = {
  destination: Destination;
  steps: JourneyStep[];
  currentStepIndex: number;
  routeId: string;
  gate: VenueGate;
  routes?: TransportRoute[];
  snapshots?: ZoneSnapshot[];
  zoneNames?: Record<string, string>;
};

/**
 * Where the visitor actually is, on the actual roads.
 *
 * The journey's own corridor is drawn along its real alignment and every
 * other corridor is dimmed, so the map answers "where am I and what is left"
 * rather than showing the whole destination at once. Progress is derived from
 * the step index, so it can never disagree with the itinerary listed below it.
 */
export function JourneyRouteMap({
  destination,
  steps,
  currentStepIndex,
  routeId,
  gate,
  routes = [],
  snapshots = [],
  zoneNames = {},
}: JourneyRouteMapProps) {
  const geography = getDestinationGeography(destination.id);
  const progress =
    steps.length <= 1 ? 0 : Math.min(1, Math.max(0, currentStepIndex / (steps.length - 1)));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <DestinationMap
        ariaLabel={`Your route to ${gate.name}, ${Math.round(progress * 100)}% complete`}
        center={destination.geo.center}
        zoom={destination.geo.zoom}
        height={190}
        geography={geography}
        snapshots={snapshots}
        zoneNames={zoneNames}
        routes={routes}
        gates={[gate]}
        layers={["corridors", "venue", "zones"]}
        focusRouteId={routeId}
        progressFraction={progress}
      />
      <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 text-[11px] text-foreground-muted">
        <span className="truncate">
          {steps[currentStepIndex]?.title ?? "On your way"} → {gate.name}
        </span>
        <span className="shrink-0 tabular-nums">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </span>
      </div>
    </div>
  );
}
