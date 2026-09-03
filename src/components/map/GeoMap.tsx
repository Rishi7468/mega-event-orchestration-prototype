"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DestinationGeography, LatLng } from "@/data/geography";
import { utilizationPercent } from "@/data/transport";
import { pressureToRisk } from "@/lib/recommendation";
import type { Camera, TransportRoute, VenueGate, ZoneSnapshot } from "@/types";

/**
 * The one place Leaflet is touched.
 *
 * The map is built as three stacked layers, which is also how the product
 * talks about it:
 *
 *   BASE MAP          real streets, rivers and bridges (OpenStreetMap tiles)
 *   OPERATIONAL       zone boundaries, venue, gates, transport corridors,
 *                     camera positions — all geographically anchored
 *   INTELLIGENCE      crowd pressure colouring, route load, camera status
 *
 * Everything above the base map is simulated prototype data drawn over a real
 * place; the zone boundaries in particular are demo boundaries, not official
 * ones. Keeping the whole integration behind this component means the tile
 * provider can be swapped, or fail entirely, without any page knowing.
 */

/**
 * Tile source. Defaults to the OpenStreetMap standard style, which needs no
 * key. Both values can be overridden per-deployment — see `.env.example`. If
 * a provider that needs a key is ever adopted, this is the only place that
 * changes.
 */
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Deliberately conservative: a narrow zoom range, panning fenced to the
 * destination, and tiles fetched only once movement settles. A hackathon
 * prototype has no business hammering a volunteer-run tile service.
 */
const MIN_ZOOM = 10;
const MAX_ZOOM = 16;

/**
 * Mirrors the risk tokens in globals.css. Leaflet writes colours straight
 * onto SVG presentation attributes, where `var(--token)` is not reliably
 * honoured, so the two themes are resolved here instead.
 */
const RISK_COLORS = {
  light: { low: "#16a34a", medium: "#ca8a04", high: "#ea580c", critical: "#dc2626" },
  dark: { low: "#22c55e", medium: "#eab308", high: "#f97316", critical: "#ef4444" },
} as const;

const INK = { light: "#18181b", dark: "#e8eaed" } as const;
const ACCENT = { light: "#18181b", dark: "#3b82f6" } as const;
const SURFACE = { light: "#ffffff", dark: "#14171b" } as const;

export type MapLayerId = "zones" | "venue" | "corridors" | "cameras";

export type GeoMapProps = {
  /** Used when there is no operational geography for this event. */
  center: LatLng;
  zoom: number;
  boundsPadding?: number;
  theme?: "light" | "dark";
  /** Pixel height of the map canvas. */
  height: number;
  /** Off for the visitor's inline maps, on for the operator's working map. */
  interactive?: boolean;
  geography?: DestinationGeography;
  snapshots?: ZoneSnapshot[];
  zoneNames?: Record<string, string>;
  gates?: VenueGate[];
  cameras?: Camera[];
  routes?: TransportRoute[];
  layers?: MapLayerId[];
  highlightZoneId?: string | null;
  /** Draws one corridor prominently and dims the rest — the visitor's route. */
  focusRouteId?: string | null;
  /** 0–1 along the focused corridor; renders a position marker. */
  progressFraction?: number | null;
  ariaLabel: string;
};

/** Linear interpolation along a polyline, used for the journey position dot. */
function pointAlongPath(path: LatLng[], fraction: number): LatLng {
  if (path.length === 0) return [0, 0];
  if (path.length === 1 || fraction <= 0) return path[0];
  if (fraction >= 1) return path[path.length - 1];

  const segments = path.length - 1;
  const scaled = fraction * segments;
  const index = Math.min(segments - 1, Math.floor(scaled));
  const t = scaled - index;
  const [aLat, aLng] = path[index];
  const [bLat, bLng] = path[index + 1];
  return [aLat + (bLat - aLat) * t, aLng + (bLng - aLng) * t];
}

function labelIcon(html: string, className = "meho-map-label") {
  return L.divIcon({ html, className, iconSize: [0, 0] });
}

export default function GeoMap({
  center,
  zoom,
  boundsPadding = 0.12,
  theme = "light",
  height,
  interactive = false,
  geography,
  snapshots = [],
  zoneNames = {},
  gates = [],
  cameras = [],
  routes = [],
  layers = ["zones", "venue", "corridors"],
  highlightZoneId,
  focusRouteId,
  progressFraction,
  ariaLabel,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const [baseMapFailed, setBaseMapFailed] = useState(false);

  const risk = RISK_COLORS[theme];
  const ink = INK[theme];
  const accent = ACCENT[theme];
  const surface = SURFACE[theme];

  const mapCenter = geography?.center ?? center;
  const mapZoom = geography?.zoom ?? zoom;
  const padding = geography?.boundsPadding ?? boundsPadding;

  // --- create the map once -------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: false,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: false,
      keyboard: interactive,
      attributionControl: true,
      // Fence panning to the destination so the map can't wander off and
      // request tiles for the other side of the world.
      maxBounds: L.latLngBounds(
        [mapCenter[0] - padding, mapCenter[1] - padding],
        [mapCenter[0] + padding, mapCenter[1] + padding],
      ),
      maxBoundsViscosity: 1,
    });

    const tiles = L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      // Fetch only when movement settles, and keep a minimal off-screen
      // buffer — far fewer requests than the defaults.
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 1,
    });

    /**
     * If the tile service is unreachable the operational layers still draw —
     * they are vectors, not tiles — so the map degrades to a diagram with a
     * plain background rather than disappearing.
     */
    let errorCount = 0;
    tiles.on("tileerror", () => {
      errorCount += 1;
      if (errorCount >= 3) setBaseMapFailed(true);
    });
    tiles.on("tileload", () => setBaseMapFailed(false));
    tiles.addTo(map);

    overlayRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Leaflet measures its container on creation; inside a card that is still
    // laying out, that measurement can be short by a few pixels.
    const settle = window.setTimeout(() => map.invalidateSize(), 120);

    return () => {
      window.clearTimeout(settle);
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
    // Created once — subsequent prop changes are handled by the redraw effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- keep the view pointed at the selected event -------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setMaxBounds(
      L.latLngBounds(
        [mapCenter[0] - padding, mapCenter[1] - padding],
        [mapCenter[0] + padding, mapCenter[1] + padding],
      ),
    );

    /**
     * When there is operational geography, frame the whole footprint rather
     * than trusting a fixed zoom: the same map is rendered at 170px on a
     * phone and 340px on a dashboard, and a hardcoded zoom that fits one
     * silently crops a zone out of the other.
     */
    const footprint = geography?.zones.flatMap((zone) => zone.boundary) ?? [];
    if (footprint.length > 0) {
      map.fitBounds(L.latLngBounds(footprint), { padding: [14, 14], maxZoom: MAX_ZOOM });
    } else {
      map.setView(mapCenter, mapZoom);
    }
  }, [geography, mapCenter, mapZoom, padding, height]);

  // --- redraw the operational + intelligence layers ------------------------
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !geography) return;
    overlay.clearLayers();

    const show = (layer: MapLayerId) => layers.includes(layer);

    // Transport corridors sit underneath the zones so they never hide a
    // pressure reading.
    if (show("corridors")) {
      geography.corridors.forEach((corridor) => {
        const route = routes.find((item) => item.id === corridor.routeId);
        const load = route
          ? utilizationPercent(route.currentDemandPerHour, route.capacityPerHour)
          : null;
        const focused = !focusRouteId || focusRouteId === corridor.routeId;
        const color = load === null ? ink : risk[pressureToRisk(load)];

        L.polyline(corridor.path, {
          color,
          weight: focused ? 4 : 2.5,
          opacity: focused ? 0.85 : 0.25,
          dashArray: route?.mode === "bus" ? "8 6" : undefined,
        }).addTo(overlay);
      });
    }

    if (show("zones")) {
      geography.zones.forEach((zoneGeometry) => {
        const snapshot = snapshots.find((item) => item.zoneId === zoneGeometry.zoneId);
        const pressure = snapshot?.crowdPressure ?? 0;
        const color = risk[pressureToRisk(pressure)];
        const highlighted = zoneGeometry.zoneId === highlightZoneId;

        L.polygon(zoneGeometry.boundary, {
          color,
          weight: highlighted ? 3 : 1.5,
          opacity: highlighted ? 1 : 0.75,
          fillColor: color,
          fillOpacity: highlighted ? 0.28 : 0.16,
          dashArray: highlighted ? undefined : "6 5",
        }).addTo(overlay);

        const name = zoneNames[zoneGeometry.zoneId] ?? zoneGeometry.zoneId;
        L.marker(zoneGeometry.center, {
          interactive: false,
          keyboard: false,
          icon: labelIcon(
            `<span class="meho-zone-chip" style="--chip:${color};--chip-ink:${ink};--chip-surface:${surface}">
               <b>${name.replace(" Zone", "")}</b><em>${pressure}%</em>
             </span>`,
          ),
        }).addTo(overlay);
      });
    }

    if (show("cameras")) {
      geography.cameras.forEach((cameraPoint) => {
        const camera = cameras.find((item) => item.id === cameraPoint.id);
        const elevated = camera?.status === "elevated" || camera?.status === "critical";
        const marker = L.circleMarker(cameraPoint.position, {
          radius: 5,
          color: elevated ? risk.high : accent,
          weight: 2,
          fillColor: surface,
          fillOpacity: 1,
        }).addTo(overlay);

        if (camera) {
          marker.bindTooltip(
            `${camera.name.split(" · ")[0]} — ${camera.densityPercent}% density`,
            { direction: "top" },
          );
        }
      });
    }

    if (show("venue")) {
      geography.gates.forEach((gatePoint) => {
        const gate = gates.find((item) => item.id === gatePoint.id);
        const busy = gate?.status === "busy" || gate?.status === "restricted";
        const marker = L.circleMarker(gatePoint.position, {
          radius: 6,
          color: busy ? risk.high : risk.low,
          weight: 2.5,
          fillColor: surface,
          fillOpacity: 1,
        }).addTo(overlay);

        /**
         * Gates and the venue sit within a few hundred metres of each other,
         * so permanent labels for all three collide at any zoom that also
         * shows the outer zones. The venue keeps its label because it anchors
         * the whole map; gate detail moves to hover, the way a real
         * operational map declutters.
         */
        if (gate) {
          marker.bindTooltip(`${gate.name} — ${gate.estimatedWaitMinutes} min queue`, {
            direction: "top",
          });
        }
      });

      L.circleMarker(geography.venue.position, {
        radius: 8,
        color: ink,
        weight: 3,
        fillColor: surface,
        fillOpacity: 1,
      }).addTo(overlay);

      L.marker(geography.venue.position, {
        interactive: false,
        keyboard: false,
        icon: labelIcon(
          `<span class="meho-point-label meho-point-label--strong" style="--chip-ink:${ink};--chip-surface:${surface}">Venue</span>`,
          "meho-map-label meho-map-label--below",
        ),
      }).addTo(overlay);
    }

    // Where the visitor currently is along their own corridor.
    if (focusRouteId && progressFraction !== null && progressFraction !== undefined) {
      const corridor = geography.corridors.find((item) => item.routeId === focusRouteId);
      if (corridor) {
        const position = pointAlongPath(corridor.path, progressFraction);
        L.circleMarker(position, {
          radius: 7,
          color: surface,
          weight: 3,
          fillColor: accent,
          fillOpacity: 1,
        }).addTo(overlay);
      }
    }
  }, [
    geography,
    snapshots,
    zoneNames,
    gates,
    cameras,
    routes,
    layers,
    highlightZoneId,
    focusRouteId,
    progressFraction,
    risk,
    ink,
    accent,
    surface,
  ]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        role="img"
        aria-label={ariaLabel}
        style={{ height }}
        className={`w-full ${interactive ? "" : "pointer-events-none"}`}
      />
      {baseMapFailed && (
        <p className="pointer-events-none absolute inset-x-2 top-2 rounded-lg bg-surface/90 px-2.5 py-1.5 text-[11px] text-foreground-muted">
          Base map unavailable — zones, gates and routes are still shown.
        </p>
      )}
    </div>
  );
}
