"use client";

import { useState } from "react";
import { Camera as CameraIcon, Bus, DoorOpen, LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDestinationGeography } from "@/data/geography";
import type { Camera, Destination, TransportRoute, VenueGate, Zone, ZoneSnapshot } from "@/types";
import { DestinationMap } from "./DestinationMap";
import type { MapLayerId } from "./GeoMap";

const LAYER_CONTROLS: { id: MapLayerId; label: string; icon: LucideIcon }[] = [
  { id: "zones", label: "Zones", icon: LayoutGrid },
  { id: "venue", label: "Venue & gates", icon: DoorOpen },
  { id: "corridors", label: "Transport", icon: Bus },
  { id: "cameras", label: "Cameras", icon: CameraIcon },
];

type OperatorDestinationMapProps = {
  destination: Destination;
  zones: Zone[];
  snapshots: ZoneSnapshot[];
  gates: VenueGate[];
  cameras: Camera[];
  routes: TransportRoute[];
};

/**
 * The organiser's working map: a real base map of the destination with the
 * operational layers drawn over it, each one independently toggleable so a
 * crowded incident view can be stripped back to just the thing being
 * investigated.
 *
 * Layer visibility is local UI state on purpose — it is a viewing preference,
 * not part of the destination's shared state, and must not travel to the
 * visitor surface or survive a demo reset as a surprise.
 */
export function OperatorDestinationMap({
  destination,
  zones,
  snapshots,
  gates,
  cameras,
  routes,
}: OperatorDestinationMapProps) {
  const [visible, setVisible] = useState<MapLayerId[]>([
    "zones",
    "venue",
    "corridors",
    "cameras",
  ]);

  const geography = getDestinationGeography(destination.id);
  const zoneNames = Object.fromEntries(zones.map((zone) => [zone.id, zone.name]));

  const toggle = (layer: MapLayerId) =>
    setVisible((current) =>
      current.includes(layer)
        ? current.filter((item) => item !== layer)
        : [...current, layer],
    );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
          Layers
        </span>
        {LAYER_CONTROLS.map(({ id, label, icon: Icon }) => {
          const on = visible.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                on
                  ? "border-accent/60 bg-surface-muted font-medium text-foreground"
                  : "border-border text-foreground-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      <DestinationMap
        ariaLabel={`Operational map of ${destination.city} — zones, venue, gates, transport corridors and camera positions`}
        center={destination.geo.center}
        zoom={destination.geo.zoom}
        height={340}
        theme="dark"
        interactive
        geography={geography}
        snapshots={snapshots}
        zoneNames={zoneNames}
        gates={gates}
        cameras={cameras}
        routes={routes}
        layers={visible}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border px-3 py-2 text-[11px] text-foreground-muted">
        <span className="text-foreground-muted">Crowd pressure:</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-risk-low" /> Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-risk-medium" /> Moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-risk-high" /> High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-current" /> Gate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full border border-accent" /> Camera
        </span>
        <span className="ml-auto">Zone boundaries are simulated demo data</span>
      </div>
    </div>
  );
}
