"use client";

import { getDestinationGeography } from "@/data/geography";
import type { Destination, TransportRoute, ZoneSnapshot } from "@/types";
import { DestinationMap } from "./DestinationMap";

type VisitorZoneMapProps = {
  destination: Destination;
  snapshots?: ZoneSnapshot[];
  zoneNames?: Record<string, string>;
  routes?: TransportRoute[];
  recommendedZoneId?: string | null;
  height?: number;
};

/**
 * "Which side of the destination should I stay on, and how far is that from
 * the venue" — answered on the real map of the place the visitor is going,
 * with the operational zones drawn over the actual street layout.
 *
 * For an event without an operational model there is still a real base map of
 * the host city; it simply carries no zone overlay, which is the honest
 * position rather than inventing boundaries.
 */
export function VisitorZoneMap({
  destination,
  snapshots = [],
  zoneNames = {},
  routes = [],
  recommendedZoneId,
  height = 200,
}: VisitorZoneMapProps) {
  const geography = getDestinationGeography(destination.id);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <DestinationMap
        ariaLabel={`Map of ${destination.city} showing the venue and accommodation zones`}
        center={destination.geo.center}
        zoom={destination.geo.zoom}
        height={height}
        geography={geography}
        snapshots={snapshots}
        zoneNames={zoneNames}
        routes={routes}
        layers={["zones", "venue", "corridors"]}
        highlightZoneId={recommendedZoneId}
      />

      {geography ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-[11px] text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-risk-low" /> Low crowd
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-risk-medium" /> Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-risk-high" /> High
          </span>
          <span className="ml-auto">Zone boundaries are simulated</span>
        </div>
      ) : (
        <p className="border-t border-border px-3 py-2 text-[11px] text-foreground-muted">
          {destination.city} — no operational zone model for this event yet.
        </p>
      )}
    </div>
  );
}
