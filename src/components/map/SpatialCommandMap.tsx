"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DestinationGeography, LatLng } from "@/data/geography";
import { utilizationPercent } from "@/data/transport";
import { pressureToRisk } from "@/lib/recommendation";
import type { Camera, TransportRoute, VenueGate, ZoneSnapshot, Incident } from "@/types";
import type { OperationalZoneDefinition } from "@/store/eventAuthoringStore";

export type SpatialLayerId =
  | "zones"
  | "heatmap"
  | "flow_vectors"
  | "incidents"
  | "gates"
  | "cameras"
  | "field_teams"
  | "medical"
  | "corridors"
  | "risk_overlay";

export type SelectedMapObject =
  | { type: "zone"; id: string }
  | { type: "gate"; id: string }
  | { type: "camera"; id: string }
  | { type: "team"; id: string }
  | { type: "incident"; id: string }
  | null;

export type SpatialCommandMapProps = {
  geography: DestinationGeography;
  zones: OperationalZoneDefinition[];
  snapshots: ZoneSnapshot[];
  gates: VenueGate[];
  cameras: Camera[];
  routes: TransportRoute[];
  incidents?: Incident[];
  onSelectObject?: (obj: SelectedMapObject) => void;
  selectedObjectId?: string | null;
  height?: number;
};

const RISK_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
} as const;

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function createCustomLabelIcon(html: string, className = "spatial-map-label") {
  return L.divIcon({ html, className, iconSize: [0, 0] });
}

/** Linear interpolation along a polyline path for crowd flow particles */
function interpolatePath(path: LatLng[], fraction: number): LatLng {
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

export function SpatialCommandMap({
  geography,
  zones,
  snapshots,
  gates,
  cameras,
  routes,
  incidents = [],
  onSelectObject,
  selectedObjectId,
  height = 580,
}: SpatialCommandMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const flowAnimationFrameRef = useRef<number | null>(null);

  const [baseMapFailed, setBaseMapFailed] = useState<boolean>(false);
  const [is3DView, setIs3DView] = useState<boolean>(true);
  const [flowProgress, setFlowProgress] = useState<number>(0);

  const [visibleLayers, setVisibleLayers] = useState<SpatialLayerId[]>([
    "zones",
    "heatmap",
    "flow_vectors",
    "incidents",
    "gates",
    "cameras",
    "field_teams",
    "medical",
    "corridors",
  ]);

  const toggleLayer = (layer: SpatialLayerId) => {
    setVisibleLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  const mapCenter = geography.center;
  const defaultZoom = geography.zoom;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: defaultZoom,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    const tiles = L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      minZoom: 10,
      maxZoom: 17,
      updateWhenIdle: true,
    });

    let errorCount = 0;
    tiles.on("tileerror", () => {
      errorCount += 1;
      if (errorCount >= 3) setBaseMapFailed(true);
    });
    tiles.on("tileload", () => setBaseMapFailed(false));

    tiles.addTo(map);

    overlayRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Settle dimensions
    const timer = setTimeout(() => map.invalidateSize(), 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        overlayRef.current = null;
      }
    };
    // Initialize once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation frame loop for flow vector particles
  useEffect(() => {
    let animId: number;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = (now - start) / 2500; // 2.5s loop
      setFlowProgress(elapsed % 1);
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    flowAnimationFrameRef.current = animId;

    return () => {
      if (flowAnimationFrameRef.current) {
        cancelAnimationFrame(flowAnimationFrameRef.current);
      }
    };
  }, []);

  // Fit bounds when geography changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geography) return;

    const footprint = geography.zones.flatMap((z) => z.boundary);
    if (footprint.length > 0) {
      map.fitBounds(L.latLngBounds(footprint), { padding: [30, 30] });
    } else {
      map.setView(geography.center, geography.zoom);
    }
  }, [geography]);

  // Main Operational Layer Redraw Effect
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !geography) return;
    overlay.clearLayers();

    const isVisible = (layer: SpatialLayerId) => visibleLayers.includes(layer);

    // 1. EVENT REGION OPERATING BOUNDARY (Polyline & Shading)
    if (isVisible("zones")) {
      const regionPoly: LatLng[] = [
        [25.465, 81.845],
        [25.465, 81.945],
        [25.37, 81.945],
        [25.37, 81.845],
      ];

      L.polygon(regionPoly, {
        color: "#3b82f6",
        weight: 2,
        dashArray: "8 6",
        fillColor: "#3b82f6",
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(overlay);
    }

    // 2. TRANSPORT CORRIDORS & ROADWAYS
    if (isVisible("corridors")) {
      geography.corridors.forEach((corridor) => {
        const route = routes.find((r) => r.id === corridor.routeId);
        const load = route
          ? utilizationPercent(route.currentDemandPerHour, route.capacityPerHour)
          : 50;

        const riskKey = pressureToRisk(load);
        const color = RISK_COLORS[riskKey];

        // Core corridor line
        L.polyline(corridor.path, {
          color,
          weight: 4,
          opacity: 0.85,
          dashArray: route?.mode === "bus" ? "6 6" : undefined,
        }).addTo(overlay);

        // Corridor outer glow line
        L.polyline(corridor.path, {
          color,
          weight: 10,
          opacity: 0.15,
        }).addTo(overlay);
      });
    }

    // 3. OPERATIONAL ZONES POLYGONS & LABELS
    if (isVisible("zones")) {
      geography.zones.forEach((geoZone) => {
        const authoringZone = zones.find((z) => z.id === geoZone.zoneId);
        const snapshot = snapshots.find((s) => s.zoneId === geoZone.zoneId);

        const pressure = snapshot?.crowdPressure ?? authoringZone?.currentPopulation ?? 50;
        const riskKey = pressureToRisk(pressure);
        const color = RISK_COLORS[riskKey];
        const isSelected = selectedObjectId === geoZone.zoneId;

        // Polygon
        const polygon = L.polygon(geoZone.boundary, {
          color: isSelected ? "#ffffff" : color,
          weight: isSelected ? 3.5 : 2,
          opacity: 0.95,
          fillColor: color,
          fillOpacity: isSelected ? 0.35 : 0.22,
        }).addTo(overlay);

        // Click handler on polygon
        polygon.on("click", () => {
          if (onSelectObject) {
            onSelectObject({ type: "zone", id: geoZone.zoneId });
          }
        });

        // Label Chip on Zone Center
        const zoneName = authoringZone?.name ?? geoZone.zoneId;
        const shortName = zoneName.replace(" Zone", "");
        const code = authoringZone?.code ?? geoZone.zoneId.toUpperCase();

        const chipHtml = `
          <div class="cursor-pointer transition-all hover:scale-105" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 9px;
            border-radius: 999px;
            border: 1.5px solid ${color};
            background: rgba(12, 14, 18, 0.92);
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
          ">
            <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #3b82f6;">${code}</span>
            <span style="font-size: 11px; font-weight: 700; color: #f4f4f5;">${shortName}</span>
            <span style="font-size: 11px; font-weight: 800; color: ${color};">${pressure}%</span>
          </div>
        `;

        const labelMarker = L.marker(geoZone.center, {
          icon: createCustomLabelIcon(chipHtml),
        }).addTo(overlay);

        labelMarker.on("click", () => {
          if (onSelectObject) {
            onSelectObject({ type: "zone", id: geoZone.zoneId });
          }
        });
      });
    }

    // 4. SPATIAL CROWD DENSITY HEATMAP PULSES
    if (isVisible("heatmap")) {
      geography.zones.forEach((geoZone) => {
        const snapshot = snapshots.find((s) => s.zoneId === geoZone.zoneId);
        const pressure = snapshot?.crowdPressure ?? 50;

        if (pressure > 65) {
          const color = pressure > 85 ? RISK_COLORS.critical : RISK_COLORS.high;
          // Inner pulsing density circle
          L.circle(geoZone.center, {
            radius: 350 + (pressure - 65) * 8,
            color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.25,
            interactive: false,
          }).addTo(overlay);

          // Outer heat halo
          L.circle(geoZone.center, {
            radius: 550 + (pressure - 65) * 12,
            color: "transparent",
            fillColor: color,
            fillOpacity: 0.1,
            interactive: false,
          }).addTo(overlay);
        }
      });
    }

    // 5. DIRECTIONAL CROWD MOVEMENT FLOW VECTORS
    if (isVisible("flow_vectors")) {
      geography.corridors.forEach((corridor) => {
        if (corridor.path.length < 2) return;

        // Position animated particle along corridor path
        const currentPos = interpolatePath(corridor.path, flowProgress);

        const flowParticleHtml = `
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #60a5fa;
            box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6;
            border: 2px solid #ffffff;
            transform: translate(-50%, -50%);
          "></div>
        `;

        L.marker(currentPos, {
          icon: createCustomLabelIcon(flowParticleHtml),
          interactive: false,
        }).addTo(overlay);
      });
    }

    // 6. GATES / ENTRANCES / EXITS
    if (isVisible("gates")) {
      geography.gates.forEach((gatePt) => {
        const gate = gates.find((g) => g.id === gatePt.id);
        const busy = gate?.status === "busy" || gate?.status === "restricted";
        const color = busy ? RISK_COLORS.high : RISK_COLORS.low;

        const gateIconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 6px;
            background: rgba(12, 14, 18, 0.95);
            border: 2px solid ${color};
            color: ${color};
            font-size: 10px;
            font-weight: 800;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            transform: translate(-50%, -50%);
          ">
            G
          </div>
        `;

        const marker = L.marker(gatePt.position, {
          icon: createCustomLabelIcon(gateIconHtml),
        }).addTo(overlay);

        if (gate) {
          marker.bindTooltip(
            `<b>${gate.name}</b><br/>Queue: ${gate.currentQueue.toLocaleString()} (${gate.estimatedWaitMinutes} min wait)`,
            { direction: "top", offset: [0, -12] },
          );
        }

        marker.on("click", () => {
          if (onSelectObject) {
            onSelectObject({ type: "gate", id: gatePt.id });
          }
        });
      });
    }

    // 7. CCTV SURVEILLANCE CAMERAS
    if (isVisible("cameras")) {
      geography.cameras.forEach((camPt) => {
        const camera = cameras.find((c) => c.id === camPt.id);
        const elevated = camera?.status === "elevated" || camera?.status === "critical";
        const color = elevated ? RISK_COLORS.high : "#3b82f6";

        const camIconHtml = `
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid #ffffff;
            box-shadow: 0 0 6px ${color};
            transform: translate(-50%, -50%);
          "></div>
        `;

        const marker = L.marker(camPt.position, {
          icon: createCustomLabelIcon(camIconHtml),
        }).addTo(overlay);

        if (camera) {
          marker.bindTooltip(
            `<b>${camera.name}</b><br/>Status: <span style="text-transform:uppercase">${camera.status}</span> (${camera.densityPercent}% density)`,
            { direction: "top", offset: [0, -10] },
          );
        }

        marker.on("click", () => {
          if (onSelectObject) {
            onSelectObject({ type: "camera", id: camPt.id });
          }
        });
      });
    }

    // 8. FIELD TEAMS & MEDICAL UNITS
    if (isVisible("field_teams")) {
      // Sector Field Officer 1 (Officer Ramesh)
      const officerPos: LatLng = [25.4285, 81.879];
      const officerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.95);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          transform: translate(-50%, -50%);
        ">
          👮 Officer Ramesh
        </div>
      `;
      L.marker(officerPos, {
        icon: createCustomLabelIcon(officerHtml),
      }).addTo(overlay);
    }

    if (isVisible("medical")) {
      // Sangam Medical First Responder
      const medicalPos: LatLng = [25.449, 81.864];
      const medicalHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(236, 72, 153, 0.95);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          transform: translate(-50%, -50%);
        ">
          🚑 Med Station 02
        </div>
      `;
      L.marker(medicalPos, {
        icon: createCustomLabelIcon(medicalHtml),
      }).addTo(overlay);
    }

    // 9. ACTIVE INCIDENTS (Clustered & Compact UI)
    if (isVisible("incidents") && incidents.length > 0) {
      const activeIncidents = incidents.filter((i) => i.status !== "resolved");

      if (activeIncidents.length > 0) {
        // Group incidents by zone
        const incidentsByZone: Record<string, Incident[]> = {};
        activeIncidents.forEach((inc) => {
          const zId = inc.zoneId || "central";
          if (!incidentsByZone[zId]) incidentsByZone[zId] = [];
          incidentsByZone[zId].push(inc);
        });

        Object.entries(incidentsByZone).forEach(([zId, incList]) => {
          const pos: LatLng =
            zId === "north" ? [25.4512, 81.8628] : [25.4292, 81.8770];

          // Single outer pulsing alert circle
          L.circle(pos, {
            radius: 160,
            color: RISK_COLORS.critical,
            weight: 2,
            fillColor: RISK_COLORS.critical,
            fillOpacity: 0.22,
            interactive: false,
          }).addTo(overlay);

          const count = incList.length;
          const labelText = count === 1 ? `⚠️ ${incList[0].type.toUpperCase()}` : `⚠️ ${count} INCIDENTS`;

          const incHtml = `
            <div style="
              display: flex;
              align-items: center;
              gap: 5px;
              padding: 2px 7px;
              border-radius: 999px;
              background: rgba(239, 68, 68, 0.95);
              border: 1.5px solid #ffffff;
              color: #ffffff;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
              cursor: pointer;
              transform: translate(-50%, -50%);
            ">
              <span>${labelText}</span>
            </div>
          `;

          const marker = L.marker(pos, {
            icon: createCustomLabelIcon(incHtml),
          }).addTo(overlay);

          marker.on("click", () => {
            if (onSelectObject) {
              onSelectObject({ type: "incident", id: incList[0].id });
            }
          });
        });
      }
    }
  }, [
    geography,
    zones,
    snapshots,
    gates,
    cameras,
    routes,
    incidents,
    visibleLayers,
    selectedObjectId,
    flowProgress,
    onSelectObject,
  ]);

  // Reset view handler
  const handleResetView = () => {
    const map = mapRef.current;
    if (!map) return;
    const footprint = geography.zones.flatMap((z) => z.boundary);
    if (footprint.length > 0) {
      map.fitBounds(L.latLngBounds(footprint), { padding: [30, 30] });
    } else {
      map.setView(mapCenter, defaultZoom);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0c0e12] shadow-2xl">
      {/* Top Layer & Mode Control Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-black/75 p-2 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-1">
            Spatial Layers
          </span>
          <button
            type="button"
            onClick={() => toggleLayer("zones")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              visibleLayers.includes("zones")
                ? "bg-accent text-accent-foreground shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Zones
          </button>
          <button
            type="button"
            onClick={() => toggleLayer("heatmap")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              visibleLayers.includes("heatmap")
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Crowd Density
          </button>
          <button
            type="button"
            onClick={() => toggleLayer("flow_vectors")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              visibleLayers.includes("flow_vectors")
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Flow Vectors
          </button>
          <button
            type="button"
            onClick={() => toggleLayer("gates")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              visibleLayers.includes("gates")
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Gates
          </button>
          <button
            type="button"
            onClick={() => toggleLayer("cameras")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              visibleLayers.includes("cameras")
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            CCTV
          </button>
          <button
            type="button"
            onClick={() => toggleLayer("incidents")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              visibleLayers.includes("incidents")
                ? "bg-red-500 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Incidents
          </button>
        </div>

        {/* 2D / 3D Perspective controls & Reset View */}
        <div className="flex items-center gap-2 border-l border-white/15 pl-2">
          <button
            type="button"
            onClick={() => setIs3DView(!is3DView)}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              is3DView
                ? "bg-accent/25 text-accent border border-accent/40"
                : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            {is3DView ? "3D Perspective" : "2D Vector"}
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-white/20 transition-all"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Primary Map Canvas Container with Optional 3D Tilt */}
      <div
        style={{
          height,
          transform: is3DView ? "perspective(1200px) rotateX(20deg) scale(1.02)" : "none",
          transition: "transform 0.4s ease-out",
        }}
        className="w-full relative"
      >
        <div
          ref={containerRef}
          role="img"
          aria-label="Real Geospatial Command Center Map of Maha Kumbh Triveni Sangam"
          style={{ height }}
          className="w-full"
        />
      </div>

      {/* Base Map Failure Fallback Warning */}
      {baseMapFailed && (
        <div className="pointer-events-none absolute inset-x-4 top-16 z-[1000] rounded-xl bg-surface/95 border border-amber-500/40 px-3.5 py-2 text-xs text-amber-300 backdrop-blur-md shadow-lg">
          ⚠️ Base map tile layer unreachable — operating boundaries, density polygons, and resource vectors are running in vector fallback mode.
        </div>
      )}

      {/* Floating Bottom Geospatial Info Strip */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex items-center justify-between rounded-xl border border-white/15 bg-black/75 px-4 py-2 text-xs text-zinc-300 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">Geography:</span> Maha Kumbh Triveni Sangam, Prayagraj
          </span>
          <span className="text-zinc-500">|</span>
          <span className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Med</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> High</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-400">
          [REAL GEOGRAPHY + LIVE SSE TELEMETRY]
        </div>
      </div>
    </div>
  );
}
