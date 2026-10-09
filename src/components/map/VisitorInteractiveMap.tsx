"use client";

import dynamic from "next/dynamic";
import { Clock, Navigation } from "lucide-react";
import { getLandmarkGraphNode, getVisitorEventGeography } from "@/lib/adapters/visitorDataAdapters";
import type { Destination, ZoneSnapshot, TransportRoute } from "@/types";
import type { LatLng } from "@/data/geography";
import { Chip } from "@/components/shared";

const GeoMap = dynamic(() => import("./GeoMap"), { ssr: false });

export type VisitorInteractiveMapProps = {
  destination: Destination;
  routeWaypoints?: LatLng[];
  alternativeWaypoints?: LatLng[];
  originZoneId?: string;
  selectedLandmarkId?: string;
  snapshots?: ZoneSnapshot[];
  routes?: TransportRoute[];
  highlightZoneId?: string | null;
  height?: number;
  interactive?: boolean;
  etaMinutes?: number;
  distanceMeters?: number;
  crowdLevel?: string;
  routeName?: string;
};

export function VisitorInteractiveMap({
  destination,
  routeWaypoints,
  alternativeWaypoints,
  originZoneId = "south",
  selectedLandmarkId,
  snapshots = [],
  routes = [],
  highlightZoneId,
  height = 240,
  interactive = true,
  etaMinutes,
  distanceMeters,
  crowdLevel,
  routeName,
}: VisitorInteractiveMapProps) {
  const geography = getVisitorEventGeography(destination.id);

  const customMarkers: { id: string; position: LatLng; label: string; iconType?: "origin" | "destination" | "waypoint" | "landmark" }[] = [];

  // Add origin marker
  if (geography && originZoneId) {
    const originZoneGeom = geography.zones.find((z) => z.zoneId === originZoneId);
    if (originZoneGeom) {
      customMarkers.push({
        id: `origin-${originZoneId}`,
        position: originZoneGeom.center,
        label: `${originZoneId.charAt(0).toUpperCase() + originZoneId.slice(1)} Zone Origin`,
        iconType: "origin",
      });
    }
  }

  // Add landmark or venue destination marker
  if (selectedLandmarkId) {
    const { landmark, coordinates } = getLandmarkGraphNode(selectedLandmarkId);
    customMarkers.push({
      id: `landmark-${selectedLandmarkId}`,
      position: coordinates,
      label: landmark ? landmark.name : "Destination Landmark",
      iconType: "landmark",
    });
  } else if (geography) {
    customMarkers.push({
      id: "venue-dest",
      position: geography.venue.position,
      label: geography.venue.name,
      iconType: "destination",
    });
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
      <div style={{ minHeight: height }} className="w-full bg-surface-muted">
        <GeoMap
          ariaLabel={`Interactive map for ${destination.name}`}
          center={geography.center}
          zoom={geography.zoom}
          height={height}
          interactive={interactive}
          geography={geography}
          snapshots={snapshots}
          routes={routes}
          layers={["zones", "venue", "corridors"]}
          highlightZoneId={highlightZoneId}
          routeWaypoints={routeWaypoints}
          alternativeWaypoints={alternativeWaypoints}
          customMarkers={customMarkers}
        />
      </div>

      {/* Floating Info Overlay Badge */}
      {(etaMinutes !== undefined || routeName || crowdLevel) && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-surface/95 px-3 py-2 text-xs backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Navigation className="h-4 w-4 shrink-0 text-foreground" />
            <div className="min-w-0 truncate">
              <p className="truncate font-semibold text-foreground">
                {routeName ?? `${destination.name} Navigation`}
              </p>
              {distanceMeters && (
                <p className="text-[10px] text-foreground-muted tabular-nums">
                  Walking distance: {distanceMeters}m
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {crowdLevel && (
              <Chip tone={crowdLevel === "CRITICAL" || crowdLevel === "HIGH" ? "warning" : "positive"}>
                {crowdLevel}
              </Chip>
            )}
            {etaMinutes !== undefined && (
              <span className="flex items-center gap-1 font-bold tabular-nums text-foreground">
                <Clock className="h-3.5 w-3.5 text-foreground-muted" />
                {etaMinutes} min
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
