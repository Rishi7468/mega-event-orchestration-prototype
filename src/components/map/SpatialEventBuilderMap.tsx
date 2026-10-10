"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { Map as LeafletMap, LayerGroup, LatLngTuple, Marker } from "leaflet";
import {
  useEventAuthoringStore,
  type AssetType,
  type RouteType,
} from "@/store/eventAuthoringStore";
import type { PaintCategory, RouteAuthoringMode } from "@/types/eventPlan";
import { useVisitorSignalStore } from "@/store/visitorSignalStore";
import { generateH3GridForRegion, type H3CellStats } from "@/lib/spatial/h3Grid";
import {
  calculatePolylineDistanceMeters,
  calculatePolygonAreaMeters,
} from "@/lib/spatial/measurement";
import { GeometryEngine } from "@/lib/spatial/geometryEngine";
import { SpatialDesignOverlayCanvas } from "@/components/map/SpatialDesignOverlayCanvas";
import { DesignModeHeader } from "@/components/operator/authoring/DesignModeHeader";
import { fetchOSRMNetworkRoute, generateRoadFollowingRoute } from "@/lib/spatial/routingEngine";

import "leaflet/dist/leaflet.css";

export type BuilderTool = string;

export type FocusMode = "planning" | "crowd" | "resources" | "safety" | "live";

export type SpatialEventBuilderMapProps = {
  activeTool: string;
  selectedAssetType?: AssetType;
  selectedRouteType?: RouteType;
  selectedRouteMode?: RouteAuthoringMode;
  measureMode?: "distance" | "area" | "radius";
  focusMode?: FocusMode;
  showH3GridOverlay?: boolean;
  selectedObjectType?: "asset" | "zone" | "route" | "paint" | "anchor" | "region" | null;
  selectedObjectId?: string | null;
  onToolComplete?: (tool: string) => void;
  onSelectAsset?: (assetId: string) => void;
  onSelectObject?: (type: "asset" | "zone" | "route" | "paint" | "anchor" | "region" | null, id: string | null) => void;
  onSelectH3Cell?: (h3CellStats: H3CellStats) => void;
  onRegionDrawn?: () => void;
};

function createSectorConePolygon(
  center: [number, number],
  headingDegrees: number,
  fovDegrees: number,
  rangeMeters: number
): [number, number][] {
  const [lat, lng] = center;
  const startAngle = headingDegrees - fovDegrees / 2;
  const endAngle = headingDegrees + fovDegrees / 2;
  const step = Math.max(1, fovDegrees / 16);

  const points: [number, number][] = [[lat, lng]];

  for (let a = startAngle; a <= endAngle; a += step) {
    const rad = (a * Math.PI) / 180;
    const dLat = (rangeMeters * Math.cos(rad)) / 111320;
    const dLng = (rangeMeters * Math.sin(rad)) / (111320 * Math.cos((lat * Math.PI) / 180));
    points.push([lat + dLat, lng + dLng]);
  }

  const endRad = (endAngle * Math.PI) / 180;
  const endDLat = (rangeMeters * Math.cos(endRad)) / 111320;
  const endDLng = (rangeMeters * Math.sin(endRad)) / (111320 * Math.cos((lat * Math.PI) / 180));
  points.push([lat + endDLat, lng + endDLng]);

  points.push([lat, lng]);
  return points;
}

const ASSET_ICONS: Record<AssetType, string> = {
  gate: "🚪",
  entry: "↗️",
  exit: "↙️",
  barricade: "🚧",
  checkpoint: "⚠️",
  crowd_marshal: "👮",
  cctv: "📹",
  security_post: "🛡️",
  emergency_station: "🚨",
  assembly_area: "🟢",
  restricted_area: "🔴",
  medical: "🚑",
  first_aid: "🩹",
  ambulance_stand: "🚐",
  hospital_access: "🏥",
  volunteer: "👥",
  field_team: "📡",
  police: "🚔",
  info_desk: "ℹ️",
  parking: "🅿️",
  shuttle_stop: "🚌",
  water: "💧",
  toilet: "🚻",
  food: "🍱",
  charging: "⚡",
  lost_found: "🧳",
};

const ASSET_COLORS: Record<AssetType, string> = {
  gate: "#3b82f6",
  entry: "#06b6d4",
  exit: "#ec4899",
  barricade: "#64748b",
  checkpoint: "#f97316",
  crowd_marshal: "#eab308",
  cctv: "#a855f7",
  security_post: "#8b5cf6",
  emergency_station: "#ef4444",
  assembly_area: "#22c55e",
  restricted_area: "#dc2626",
  medical: "#ef4444",
  first_aid: "#f43f5e",
  ambulance_stand: "#b91c1c",
  hospital_access: "#991b1b",
  volunteer: "#f59e0b",
  field_team: "#10b981",
  police: "#1d4ed8",
  info_desk: "#0284c7",
  parking: "#6366f1",
  shuttle_stop: "#3b82f6",
  water: "#0284c7",
  toilet: "#64748b",
  food: "#d97706",
  charging: "#eab308",
  lost_found: "#8b5cf6",
};

const PAINT_COLORS: Record<PaintCategory, string> = {
  crowd: "#06b6d4",
  queue: "#3b82f6",
  restricted: "#ef4444",
  medical: "#10b981",
  emergency: "#f43f5e",
  vip: "#a855f7",
  parking: "#6366f1",
  staff: "#f59e0b",
  custom: "#64748b",
};

export function SpatialEventBuilderMap({
  activeTool,
  selectedAssetType = "cctv",
  selectedRouteType = "emergency",
  selectedRouteMode = "network",
  measureMode = "distance",
  showH3GridOverlay = false,
  selectedObjectType,
  selectedObjectId,
  onToolComplete,
  onSelectObject,
  onSelectH3Cell,
}: SpatialEventBuilderMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const isPaintingRef = useRef<boolean>(false);
  const currentPaintStrokeRef = useRef<[number, number][]>([]);

  const [transformBadge, setTransformBadge] = useState<string | null>(null);

  const layersRef = useRef<{
    mask?: LayerGroup;
    region?: LayerGroup;
    h3Grid?: LayerGroup;
    paint?: LayerGroup;
    anchors?: LayerGroup;
    zones?: LayerGroup;
    assets?: LayerGroup;
    routes?: LayerGroup;
    sensors?: LayerGroup;
    landmarks?: LayerGroup;
    mobileAssets?: LayerGroup;
    drawing?: LayerGroup;
    vertices?: LayerGroup;
    measure?: LayerGroup;
  }>({});

  // Store selectors
  const regionMode = useEventAuthoringStore((state) => state.regionMode);
  const regionPolygon = useEventAuthoringStore((state) => state.regionPolygon);
  const centerCoordinates = useEventAuthoringStore((state) => state.centerCoordinates);
  const isCanvasLocked = useEventAuthoringStore((state) => state.isCanvasLocked);
  const paintCategory = useEventAuthoringStore((state) => state.paintCategory);
  const brushSizeMeters = useEventAuthoringStore((state) => state.brushSizeMeters);
  const paintMode = useEventAuthoringStore((state) => state.paintMode);
  const paintedAreas = useEventAuthoringStore((state) => state.paintedAreas);
  const layerVisibility = useEventAuthoringStore((state) => state.layerVisibility);
  const toggleLayerVisibility = useEventAuthoringStore((state) => state.toggleLayerVisibility);
  const anchors = useEventAuthoringStore((state) => state.anchors);
  const zones = useEventAuthoringStore((state) => state.zones);
  const assets = useEventAuthoringStore((state) => state.assets);
  const routes = useEventAuthoringStore((state) => state.routes);
  const snapping = useEventAuthoringStore((state) => state.snapping);

  // Digital Twin Store Selectors
  const sensors = useEventAuthoringStore((state) => state.sensors);
  const landmarks = useEventAuthoringStore((state) => state.landmarks);
  const mobileAssets = useEventAuthoringStore((state) => state.mobileAssets);
  const activeDrawingPrimitive = useEventAuthoringStore((state) => state.activeDrawingPrimitive);
  const setDrawingPrimitive = useEventAuthoringStore((state) => state.setDrawingPrimitive);
  const addRectangleZone = useEventAuthoringStore((state) => state.addRectangleZone);
  const addCircleZone = useEventAuthoringStore((state) => state.addCircleZone);
  const addSensor = useEventAuthoringStore((state) => state.addSensor);
  const addLandmark = useEventAuthoringStore((state) => state.addLandmark);
  const addMobileAsset = useEventAuthoringStore((state) => state.addMobileAsset);
  const clipZoneToRegion = useEventAuthoringStore((state) => state.clipZoneToRegion);

  const setRegionPolygon = useEventAuthoringStore((state) => state.setRegionPolygon);
  const confirmRegion = useEventAuthoringStore((state) => state.confirmRegion);
  const keepToolActive = useEventAuthoringStore((state) => state.keepToolActive);
  const updateAsset = useEventAuthoringStore((state) => state.updateAsset);
  const updateAssetPosition = useEventAuthoringStore((state) => state.updateAssetPosition);
  const updateAnchorPosition = useEventAuthoringStore((state) => state.updateAnchorPosition);
  const updateZoneGeometry = useEventAuthoringStore((state) => state.updateZoneGeometry);
  const deleteAsset = useEventAuthoringStore((state) => state.deleteAsset);
  const deleteAnchor = useEventAuthoringStore((state) => state.deleteAnchor);
  const deleteZone = useEventAuthoringStore((state) => state.deleteZone);
  const deleteRoute = useEventAuthoringStore((state) => state.deleteRoute);
  const deletePaintedArea = useEventAuthoringStore((state) => state.deletePaintedArea);
  const undo = useEventAuthoringStore((state) => state.undo);
  const redo = useEventAuthoringStore((state) => state.redo);

  const addAnchor = useEventAuthoringStore((state) => state.addAnchor);
  const addAsset = useEventAuthoringStore((state) => state.addAsset);
  const addRoute = useEventAuthoringStore((state) => state.addRoute);
  const addPaintedArea = useEventAuthoringStore((state) => state.addPaintedArea);
  const convertPaintToZone = useEventAuthoringStore((state) => state.convertPaintToZone);

  const aggregatedReports = useVisitorSignalStore((state) => state.getAggregatedReportsByCell)();
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [drawPoints, setDrawPoints] = useState<LatLngTuple[]>([]);
  const [measurePoints, setMeasurePoints] = useState<LatLngTuple[]>([]);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [lastClickToast, setLastClickToast] = useState<{ text: string; id: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);

  useEffect(() => {
    if (!lastClickToast) return;
    const timer = setTimeout(() => setLastClickToast(null), 3500);
    return () => clearTimeout(timer);
  }, [lastClickToast]);

  const handleCompleteRegion = useCallback(() => {
    if (drawPoints.length < 3) return;
    setRegionPolygon(drawPoints as [number, number][]);
    confirmRegion();
    setDrawPoints([]);
    if (layersRef.current.drawing) layersRef.current.drawing.clearLayers();
    setLastClickToast({
      text: `REGION PERIMETER CONFIRMED (${drawPoints.length} vertices)`,
      id: Date.now(),
    });
    if (onSelectObject) onSelectObject("region", "main-perimeter");
    if (!keepToolActive && onToolComplete) onToolComplete("select");
  }, [drawPoints, setRegionPolygon, confirmRegion, keepToolActive, onToolComplete, onSelectObject]);

  const handleCancelRegion = useCallback(() => {
    setDrawPoints([]);
    if (layersRef.current.drawing) layersRef.current.drawing.clearLayers();
    setLastClickToast({
      text: "REGION DRAWING CANCELLED",
      id: Date.now(),
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectType && selectedObjectId) {
          if (selectedObjectType === "asset") deleteAsset(selectedObjectId);
          else if (selectedObjectType === "anchor") deleteAnchor(selectedObjectId);
          else if (selectedObjectType === "zone") deleteZone(selectedObjectId);
          else if (selectedObjectType === "route") deleteRoute(selectedObjectId);
          else if (selectedObjectType === "paint") deletePaintedArea(selectedObjectId);
          if (onSelectObject) onSelectObject(null, null);
        }
      } else if (e.key === "Escape") {
        if (onSelectObject) onSelectObject(null, null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedObjectType,
    selectedObjectId,
    deleteAsset,
    deleteAnchor,
    deleteZone,
    deleteRoute,
    deletePaintedArea,
    undo,
    redo,
    onSelectObject,
  ]);

  const measureDistance = useMemo(() => {
    return calculatePolylineDistanceMeters(measurePoints as [number, number][]);
  }, [measurePoints]);

  const measureArea = useMemo(() => {
    return calculatePolygonAreaMeters(measurePoints as [number, number][]);
  }, [measurePoints]);

  const centerLat = centerCoordinates[0];
  const centerLng = centerCoordinates[1];

  // H3 Hexagon Grid Calculation
  const h3Stats = useMemo(() => {
    return generateH3GridForRegion(regionPolygon, zones, assets, aggregatedReports, 8);
  }, [regionPolygon, zones, assets, aggregatedReports]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      layersRef.current.mask = L.layerGroup().addTo(map);
      layersRef.current.region = L.layerGroup().addTo(map);
      layersRef.current.h3Grid = L.layerGroup().addTo(map);
      layersRef.current.paint = L.layerGroup().addTo(map);
      layersRef.current.anchors = L.layerGroup().addTo(map);
      layersRef.current.zones = L.layerGroup().addTo(map);
      layersRef.current.assets = L.layerGroup().addTo(map);
      layersRef.current.routes = L.layerGroup().addTo(map);
      layersRef.current.sensors = L.layerGroup().addTo(map);
      layersRef.current.landmarks = L.layerGroup().addTo(map);
      layersRef.current.mobileAssets = L.layerGroup().addTo(map);
      layersRef.current.drawing = L.layerGroup().addTo(map);
      layersRef.current.vertices = L.layerGroup().addTo(map);
      layersRef.current.measure = L.layerGroup().addTo(map);

      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      mapRef.current = map;
      setMapInstance(map);
      setCurrentZoom(map.getZoom());

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 100);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const isRegionConfirmed = useEventAuthoringStore((state) => state.isRegionConfirmed);
  const isViewportLocked = useEventAuthoringStore((state) => state.isViewportLocked);

  // Auto-Fit and Lock Viewport to Confirmed Region Bounds
  useEffect(() => {
    if (!mapRef.current || !isRegionConfirmed || !regionPolygon || regionPolygon.length < 3) return;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;

      const bounds = L.latLngBounds(regionPolygon as LatLngTuple[]);
      map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 0.8 });

      if (isViewportLocked) {
        map.setMaxBounds(bounds.pad(0.5));
      } else {
        map.setMaxBounds(undefined);
      }
    });
  }, [isRegionConfirmed, isViewportLocked, regionPolygon]);

  // Lock Canvas Mode
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (isCanvasLocked || activeTool === "paint") {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
    }
  }, [isCanvasLocked, activeTool]);

  // ResizeObserver for Map Container
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Pan Map on Center Update
  useEffect(() => {
    if (mapRef.current && centerLat && centerLng) {
      mapRef.current.setView([centerLat, centerLng], 14, { animate: true });
      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 150);
    }
  }, [centerLat, centerLng]);

  // Render Leaflet Layers
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;

      // 0. REGION FOCUS MASK (Dim everything outside authoritative event region)
      if (layersRef.current.mask) {
        layersRef.current.mask.clearLayers();
        if (regionPolygon && regionPolygon.length >= 3) {
          const worldOuter: LatLngTuple[] = [
            [90, -180],
            [90, 180],
            [-90, 180],
            [-90, -180],
          ];
          // Inverse polygon mask hole
          L.polygon([worldOuter, regionPolygon as LatLngTuple[]], {
            color: "#030712",
            weight: 1,
            fillColor: "#030712",
            fillOpacity: 0.55,
            interactive: false,
          }).addTo(layersRef.current.mask);
        }
      }

      // 1. REGION BOUNDARY POLYGON
      if (layersRef.current.region) {
        layersRef.current.region.clearLayers();
        if (layerVisibility.region && regionPolygon && regionPolygon.length >= 3) {
          const isSelected = selectedObjectType === "region";
          const regionPoly = L.polygon(regionPolygon as LatLngTuple[], {
            color: isSelected ? "#38bdf8" : "#6366f1",
            weight: isSelected ? 5 : 3.5,
            dashArray: isSelected ? undefined : "8, 6",
            fillColor: isSelected ? "#38bdf8" : "#6366f1",
            fillOpacity: isSelected ? 0.2 : 0.05,
            className: "event-region-boundary cursor-pointer",
          }).addTo(layersRef.current.region);

          regionPoly.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            if (onSelectObject) onSelectObject("region", "main-perimeter");
          });
        }
      }

      // 2. PAINTED AREAS LAYER
      if (layersRef.current.paint) {
        layersRef.current.paint.clearLayers();
        if (layerVisibility.paint && paintedAreas && paintedAreas.length > 0) {
          paintedAreas.forEach((p) => {
            if (p.boundary && p.boundary.length >= 3) {
              const color = PAINT_COLORS[p.category] || "#06b6d4";
              const poly = L.polygon(p.boundary as LatLngTuple[], {
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.35,
              }).addTo(layersRef.current.paint!);

              poly.on("click", () => {
                if (onSelectObject) onSelectObject("paint", p.id);
              });

              // Add floating convert button on painted area center
              const avgLat = p.boundary.reduce((acc, pt) => acc + pt[0], 0) / p.boundary.length;
              const avgLng = p.boundary.reduce((acc, pt) => acc + pt[1], 0) / p.boundary.length;

              const labelHtml = `
                <div style="
                  background: rgba(15, 23, 42, 0.95);
                  border: 1px solid ${color};
                  border-radius: 6px;
                  padding: 2px 8px;
                  color: #ffffff;
                  font-size: 10px;
                  font-weight: 800;
                  white-space: nowrap;
                  transform: translate(-50%, -50%);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                ">
                  <span style="color:${color}">🎨 ${p.category.toUpperCase()}</span>
                </div>
              `;

              const labelIcon = L.divIcon({
                html: labelHtml,
                className: "custom-paint-label",
                iconSize: [0, 0],
              });

              L.marker([avgLat, avgLng], { icon: labelIcon, interactive: false }).addTo(layersRef.current.paint!);
            }
          });
        }
      }

      // 3. EDITABLE REGION VERTICES
      if (layersRef.current.vertices) {
        layersRef.current.vertices.clearLayers();
        if (activeTool === "region" && regionMode === "polygon" && regionPolygon.length > 0) {
          regionPolygon.forEach((pt) => {
            L.circleMarker(pt as LatLngTuple, {
              radius: 6,
              color: "#6366f1",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 2,
            }).addTo(layersRef.current.vertices!);
          });
        }
      }

      // 4. H3 SPATIAL HEXAGON GRID
      if (layersRef.current.h3Grid) {
        layersRef.current.h3Grid.clearLayers();
        if ((showH3GridOverlay || activeTool === "h3") && layerVisibility.h3Grid) {
          h3Stats.forEach((stat) => {
            let color = "#22c55e";
            if (stat.riskLevel === "critical") color = "#ef4444";
            else if (stat.riskLevel === "high") color = "#f97316";
            else if (stat.riskLevel === "medium") color = "#eab308";

            const poly = L.polygon(stat.boundary as LatLngTuple[], {
              color,
              weight: 1.5,
              fillColor: color,
              fillOpacity: stat.pressurePercent > 70 ? 0.35 : 0.18,
            }).addTo(layersRef.current.h3Grid!);

            poly.on("click", () => {
              if (onSelectH3Cell) onSelectH3Cell(stat);
            });
          });
        }
      }

      // 4.5 OPERATIONAL ANCHORS
      if (layersRef.current.anchors) {
        layersRef.current.anchors.clearLayers();
        if (layerVisibility.anchors && anchors && anchors.length > 0) {
          anchors.forEach((anc) => {
            const isSelected = selectedObjectType === "anchor" && selectedObjectId === anc.id;
            const anchorHtml = `
              <div style="
                display: flex;
                align-items: center;
                gap: 5px;
                background: rgba(15, 23, 42, 0.95);
                border: ${isSelected ? "2px solid #818cf8" : "1.5px solid #10b981"};
                border-radius: 999px;
                padding: 3px 9px;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                white-space: nowrap;
                box-shadow: ${isSelected ? "0 0 0 3px #6366f1, 0 0 16px #6366f1" : "0 2px 8px rgba(0,0,0,0.5)"};
                transform: translate(-50%, -50%);
              ">
                <span style="color:#10b981; font-weight:900;">📍</span> ${anc.name}
              </div>
            `;

            const customIcon = L.divIcon({
              html: anchorHtml,
              className: "custom-anchor-marker",
              iconSize: [0, 0],
            });

            const marker = L.marker([anc.lat, anc.lng], {
              icon: customIcon,
              draggable: true,
            }).addTo(layersRef.current.anchors!);

            marker.on("dragend", (e) => {
              const newPos = (e.target as Marker).getLatLng();
              updateAnchorPosition(anc.id, newPos.lat, newPos.lng);
            });

            marker.on("click", () => {
              if (onSelectObject) onSelectObject("anchor", anc.id);
            });
          });
        }
      }

      // 5. OPERATIONAL ZONES & DYNAMIC INTERACTIVE EDITING HANDLES
      if (layersRef.current.zones) {
        layersRef.current.zones.clearLayers();
        if (layerVisibility.zones) {
          zones.forEach((zone) => {
            const isSelected = selectedObjectType === "zone" && selectedObjectId === zone.id;

            // Resolve color: Operational State vs Custom Color
            let strokeColor = "#3b82f6";
            if (zone.colorMode === "custom" && zone.customColor) {
              strokeColor = zone.customColor;
            } else {
              const occupancyPercent = zone.capacity > 0 ? ((zone.currentPopulation || 0) / zone.capacity) * 100 : 0;
              if (zone.operationalState === "closed") strokeColor = "#64748b";
              else if (zone.riskLevel === "critical" || zone.operationalState === "critical" || occupancyPercent >= 90) strokeColor = "#ef4444";
              else if (zone.riskLevel === "high" || zone.operationalState === "high_density" || occupancyPercent >= 75) strokeColor = "#f97316";
              else if (zone.riskLevel === "medium" || zone.operationalState === "moderate" || occupancyPercent >= 50) strokeColor = "#f59e0b";
              else strokeColor = "#10b981";
            }

            if (isSelected) {
              strokeColor = zone.colorMode === "custom" && zone.customColor ? zone.customColor : "#38bdf8";
            }

            const zonePoly = L.polygon(zone.boundary as LatLngTuple[], {
              color: strokeColor,
              weight: isSelected ? 3.5 : 2.5,
              dashArray: isSelected ? "6, 6" : undefined,
              fillColor: strokeColor,
              fillOpacity: isSelected ? 0.35 : 0.18,
              className: isSelected ? "zone-polygon-selected" : "zone-polygon-normal",
            }).addTo(layersRef.current.zones!);

            // Click selection
            zonePoly.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              if (onSelectObject) onSelectObject("zone", zone.id);
            });

            // Direct Body Dragging for Selected Zone (when not locked)
            if (isSelected && !zone.isLocked) {
              zonePoly.on("mousedown", (e) => {
                L.DomEvent.stopPropagation(e);
                if (mapRef.current) mapRef.current.dragging.disable();

                const startPt = e.latlng;
                const initialBoundary = [...zone.boundary];
                const initialCenter: [number, number] = zone.center || [
                  initialBoundary.reduce((acc, pt) => acc + pt[0], 0) / initialBoundary.length,
                  initialBoundary.reduce((acc, pt) => acc + pt[1], 0) / initialBoundary.length,
                ];

                const onMouseMove = (moveEvent: L.LeafletMouseEvent) => {
                  const dLat = moveEvent.latlng.lat - startPt.lat;
                  const dLng = moveEvent.latlng.lng - startPt.lng;
                  const tempBoundary = initialBoundary.map(([lat, lng]) => [lat + dLat, lng + dLng] as [number, number]);
                  zonePoly.setLatLngs(tempBoundary as LatLngTuple[]);
                  setTransformBadge(`MOVE ZONE: ${zone.name} (${zone.code}) | LAT ${(initialCenter[0] + dLat).toFixed(4)}, LNG ${(initialCenter[1] + dLng).toFixed(4)}`);
                };

                const onMouseUp = (upEvent: L.LeafletMouseEvent) => {
                  setTransformBadge(null);
                  if (mapRef.current) {
                    mapRef.current.off("mousemove", onMouseMove);
                    mapRef.current.off("mouseup", onMouseUp);
                    mapRef.current.dragging.enable();
                  }
                  const dLat = upEvent.latlng.lat - startPt.lat;
                  const dLng = upEvent.latlng.lng - startPt.lng;
                  if (Math.abs(dLat) > 0.00001 || Math.abs(dLng) > 0.00001) {
                    const finalBoundary = initialBoundary.map(([lat, lng]) => [lat + dLat, lng + dLng] as [number, number]);
                    updateZoneGeometry(zone.id, {
                      center: [initialCenter[0] + dLat, initialCenter[1] + dLng],
                      boundary: finalBoundary,
                    });
                  }
                };

                if (mapRef.current) {
                  mapRef.current.on("mousemove", onMouseMove);
                  mapRef.current.on("mouseup", onMouseUp);
                }
              });
            }

            // Calculate Center coordinates & Occupancy Label
            const centerLat = zone.center ? zone.center[0] : zone.boundary.reduce((acc, pt) => acc + pt[0], 0) / zone.boundary.length;
            const centerLng = zone.center ? zone.center[1] : zone.boundary.reduce((acc, pt) => acc + pt[1], 0) / zone.boundary.length;
            const occPercent = zone.capacity > 0 ? Math.round(((zone.currentPopulation || 0) / zone.capacity) * 100) : 0;

            const labelHtml = `
              <div style="
                background: rgba(15, 23, 42, 0.95);
                border: 1.5px solid ${strokeColor};
                border-radius: 6px;
                padding: 3px 8px;
                color: #ffffff;
                font-size: 10px;
                font-weight: 800;
                white-space: nowrap;
                transform: translate(-50%, -50%);
                box-shadow: 0 2px 8px rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1px;
              ">
                <div><span style="color:${strokeColor}">${zone.code}</span> — ${zone.name} ${zone.isLocked ? "🔒" : ""}</div>
                <div style="font-size:9px; color:#cbd5e1; font-weight:700;">
                  ${(zone.currentPopulation || 0).toLocaleString()} / ${zone.capacity.toLocaleString()} (${occPercent}%)
                </div>
              </div>
            `;

            const labelIcon = L.divIcon({
              html: labelHtml,
              className: "custom-zone-label",
              iconSize: [0, 0],
            });

            L.marker([centerLat, centerLng], { icon: labelIcon, interactive: false }).addTo(layersRef.current.zones!);

            // IF SELECTED & NOT LOCKED: Render Dynamic Drag Handles
            if (isSelected && !zone.isLocked) {
              // A. Center Move Anchor
              const centerHandleIcon = L.divIcon({
                html: `<div style="
                  background: #0f172a;
                  border: 2px solid ${strokeColor};
                  border-radius: 999px;
                  width: 26px;
                  height: 26px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: ${strokeColor};
                  font-weight: 900;
                  font-size: 13px;
                  cursor: move;
                  transform: translate(-50%, -50%);
                  box-shadow: 0 0 12px ${strokeColor};
                ">❖</div>`,
                className: "custom-center-handle",
                iconSize: [26, 26],
                iconAnchor: [13, 13],
              });

              const centerMarker = L.marker([centerLat, centerLng], {
                icon: centerHandleIcon,
                draggable: true,
              }).addTo(layersRef.current.zones!);

              centerMarker.on("dragstart", () => {
                if (mapRef.current) mapRef.current.dragging.disable();
              });

              centerMarker.on("drag", (e) => {
                const targetLatLng = (e.target as Marker).getLatLng();
                const dLat = targetLatLng.lat - centerLat;
                const dLng = targetLatLng.lng - centerLng;
                const tempBoundary = zone.boundary.map(([lat, lng]) => [lat + dLat, lng + dLng] as [number, number]);
                zonePoly.setLatLngs(tempBoundary as LatLngTuple[]);
                setTransformBadge(`MOVE ZONE: ${zone.name} | LAT ${targetLatLng.lat.toFixed(4)}, LNG ${targetLatLng.lng.toFixed(4)}`);
              });

              centerMarker.on("dragend", (e) => {
                setTransformBadge(null);
                if (mapRef.current) mapRef.current.dragging.enable();
                const targetLatLng = (e.target as Marker).getLatLng();
                const dLat = targetLatLng.lat - centerLat;
                const dLng = targetLatLng.lng - centerLng;
                const updatedBoundary = zone.boundary.map(([lat, lng]) => [lat + dLat, lng + dLng] as [number, number]);
                updateZoneGeometry(zone.id, {
                  center: [targetLatLng.lat, targetLatLng.lng],
                  boundary: updatedBoundary,
                });
              });

              // B. CIRCLE RADIUS HANDLE
              if (zone.shapeType === "circle") {
                const radiusMeters = zone.radiusMeters || 100;
                const radiusLat = centerLat;
                const radiusLng = centerLng + (radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180)));

                const radiusHandleIcon = L.divIcon({
                  html: `<div style="
                    background: #06b6d4;
                    border: 2px solid #ffffff;
                    border-radius: 999px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    font-weight: 900;
                    font-size: 11px;
                    cursor: ew-resize;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 10px #06b6d4;
                  ">↔</div>`,
                  className: "custom-radius-handle",
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                });

                const radiusMarker = L.marker([radiusLat, radiusLng], {
                  icon: radiusHandleIcon,
                  draggable: true,
                }).addTo(layersRef.current.zones!);

                radiusMarker.on("dragstart", () => {
                  if (mapRef.current) mapRef.current.dragging.disable();
                });

                radiusMarker.on("drag", (e) => {
                  const currLatLng = (e.target as Marker).getLatLng();
                  const distMeters = GeometryEngine.calculateDistanceMeters([centerLat, centerLng], [currLatLng.lat, currLatLng.lng]);
                  const newRadius = Math.max(10, Math.round(distMeters));
                  const circlePoints = GeometryEngine.createCirclePolygon([centerLat, centerLng], newRadius);
                  zonePoly.setLatLngs(circlePoints as LatLngTuple[]);
                  setTransformBadge(`RADIUS: ${newRadius}m | AREA: ${Math.round(Math.PI * newRadius * newRadius).toLocaleString()}m²`);
                });

                radiusMarker.on("dragend", (e) => {
                  setTransformBadge(null);
                  if (mapRef.current) mapRef.current.dragging.enable();
                  const currLatLng = (e.target as Marker).getLatLng();
                  const distMeters = GeometryEngine.calculateDistanceMeters([centerLat, centerLng], [currLatLng.lat, currLatLng.lng]);
                  const newRadius = Math.max(10, Math.round(distMeters));
                  updateZoneGeometry(zone.id, { radiusMeters: newRadius });
                });
              } else {
                // C. CORNER & EDGE HANDLES FOR RECTANGLES AND POLYGONS
                zone.boundary.forEach((pt, idx) => {
                  const vertexIcon = L.divIcon({
                    html: `<div style="
                      background: ${strokeColor};
                      border: 2px solid #ffffff;
                      border-radius: 4px;
                      width: 14px;
                      height: 14px;
                      cursor: nwse-resize;
                      transform: translate(-50%, -50%);
                      box-shadow: 0 0 8px ${strokeColor};
                    "></div>`,
                    className: "custom-vertex-handle",
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                  });

                  const vertexMarker = L.marker([pt[0], pt[1]], {
                    icon: vertexIcon,
                    draggable: true,
                  }).addTo(layersRef.current.zones!);

                  vertexMarker.on("dragstart", () => {
                    if (mapRef.current) mapRef.current.dragging.disable();
                  });

                  vertexMarker.on("drag", (e) => {
                    const newLatLng = (e.target as Marker).getLatLng();
                    const updatedBoundary = [...zone.boundary];
                    updatedBoundary[idx] = [newLatLng.lat, newLatLng.lng];
                    zonePoly.setLatLngs(updatedBoundary as LatLngTuple[]);
                    const area = calculatePolygonAreaMeters(updatedBoundary);
                    setTransformBadge(`RESIZE ZONE: ${zone.name} | AREA: ${Math.round(area).toLocaleString()}m²`);
                  });

                  vertexMarker.on("dragend", (e) => {
                    setTransformBadge(null);
                    if (mapRef.current) mapRef.current.dragging.enable();
                    const newLatLng = (e.target as Marker).getLatLng();
                    const updatedBoundary = [...zone.boundary];
                    updatedBoundary[idx] = [newLatLng.lat, newLatLng.lng];
                    updateZoneGeometry(zone.id, { boundary: updatedBoundary });
                  });
                });
              }
            }
          });
        }
      }

      // 6. PLACED ASSETS
      if (layersRef.current.assets) {
        layersRef.current.assets.clearLayers();
        if (layerVisibility.assets) {
          assets.forEach((asset) => {
            const isSelected = selectedObjectType === "asset" && selectedObjectId === asset.id;
            const color = ASSET_COLORS[asset.type] || "#3b82f6";
            const iconEmoji = ASSET_ICONS[asset.type] || "📍";

            // If CCTV Asset: Render Field of View (FOV) Fan Cone
            if (asset.type === "cctv") {
              const heading = asset.heading ?? 135;
              const fov = asset.fov ?? 90;
              const range = asset.rangeMeters ?? asset.coverageRadiusMeters ?? 80;
              const conePoints = createSectorConePolygon([asset.lat, asset.lng], heading, fov, range);

              const conePoly = L.polygon(conePoints as LatLngTuple[], {
                color: isSelected ? "#c084fc" : "#a855f7",
                weight: isSelected ? 2.5 : 1.5,
                fillColor: isSelected ? "#c084fc" : "#a855f7",
                fillOpacity: isSelected ? 0.35 : 0.18,
                dashArray: "4, 4",
              }).addTo(layersRef.current.assets!);

              if (isSelected) {
                // Direction Rotation Handle (↻)
                const radCenter = (heading * Math.PI) / 180;
                const handleDist = range + 12;
                const handleLat = asset.lat + (handleDist * Math.cos(radCenter)) / 111320;
                const handleLng = asset.lng + (handleDist * Math.sin(radCenter)) / (111320 * Math.cos((asset.lat * Math.PI) / 180));

                const rotIcon = L.divIcon({
                  html: `<div style="
                    background: #a855f7;
                    border: 2px solid #ffffff;
                    border-radius: 999px;
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    font-weight: 900;
                    font-size: 12px;
                    cursor: grab;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 10px #a855f7;
                  " title="Drag to rotate CCTV Heading">↻</div>`,
                  className: "custom-cctv-rot-handle",
                  iconSize: [22, 22],
                  iconAnchor: [11, 11],
                });

                const rotMarker = L.marker([handleLat, handleLng], {
                  icon: rotIcon,
                  draggable: true,
                }).addTo(layersRef.current.assets!);

                rotMarker.on("dragstart", () => {
                  if (mapRef.current) mapRef.current.dragging.disable();
                });

                rotMarker.on("drag", (e) => {
                  const curPt = (e.target as Marker).getLatLng();
                  const dLat = curPt.lat - asset.lat;
                  const dLng = (curPt.lng - asset.lng) * Math.cos((asset.lat * Math.PI) / 180);
                  let newHeading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
                  if (newHeading < 0) newHeading += 360;

                  const newCone = createSectorConePolygon([asset.lat, asset.lng], newHeading, fov, range);
                  conePoly.setLatLngs(newCone as LatLngTuple[]);
                  setTransformBadge(`CCTV HEADING: ${newHeading}° | FOV: ${fov}°`);
                });

                rotMarker.on("dragend", (e) => {
                  setTransformBadge(null);
                  if (mapRef.current) mapRef.current.dragging.enable();
                  const curPt = (e.target as Marker).getLatLng();
                  const dLat = curPt.lat - asset.lat;
                  const dLng = (curPt.lng - asset.lng) * Math.cos((asset.lat * Math.PI) / 180);
                  let newHeading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
                  if (newHeading < 0) newHeading += 360;
                  updateAsset(asset.id, { heading: newHeading });
                });

                // Range Handle (↔)
                const rangeLat = asset.lat + (range * Math.cos(radCenter)) / 111320;
                const rangeLng = asset.lng + (range * Math.sin(radCenter)) / (111320 * Math.cos((asset.lat * Math.PI) / 180));

                const rangeIcon = L.divIcon({
                  html: `<div style="
                    background: #c084fc;
                    border: 2px solid #ffffff;
                    border-radius: 999px;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    font-weight: 900;
                    font-size: 10px;
                    cursor: ew-resize;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 10px #c084fc;
                  " title="Drag to resize CCTV Range">↔</div>`,
                  className: "custom-cctv-range-handle",
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                });

                const rangeMarker = L.marker([rangeLat, rangeLng], {
                  icon: rangeIcon,
                  draggable: true,
                }).addTo(layersRef.current.assets!);

                rangeMarker.on("dragstart", () => {
                  if (mapRef.current) mapRef.current.dragging.disable();
                });

                rangeMarker.on("drag", (e) => {
                  const curPt = (e.target as Marker).getLatLng();
                  const distMeters = GeometryEngine.calculateDistanceMeters([asset.lat, asset.lng], [curPt.lat, curPt.lng]);
                  const newRange = Math.max(15, Math.round(distMeters));
                  const newCone = createSectorConePolygon([asset.lat, asset.lng], heading, fov, newRange);
                  conePoly.setLatLngs(newCone as LatLngTuple[]);
                  setTransformBadge(`CCTV RANGE: ${newRange}m | HEADING: ${heading}°`);
                });

                rangeMarker.on("dragend", (e) => {
                  setTransformBadge(null);
                  if (mapRef.current) mapRef.current.dragging.enable();
                  const curPt = (e.target as Marker).getLatLng();
                  const distMeters = GeometryEngine.calculateDistanceMeters([asset.lat, asset.lng], [curPt.lat, curPt.lng]);
                  const newRange = Math.max(15, Math.round(distMeters));
                  updateAsset(asset.id, { rangeMeters: newRange, coverageRadiusMeters: newRange });
                });
              }
            }

            const zoomScale = currentZoom <= 12 ? 0.6 : currentZoom <= 14 ? 0.85 : 1.0;
            const markerHtml = `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: ${isSelected ? "32px" : "28px"};
                height: ${isSelected ? "32px" : "28px"};
                border-radius: 999px;
                background: ${color};
                border: ${isSelected ? "3px solid #ffffff" : "2px solid #ffffff"};
                box-shadow: 0 0 ${isSelected ? "16px" : "10px"} ${color};
                font-size: ${isSelected ? "15px" : "13px"};
                cursor: move;
                transform: translate(-50%, -50%) scale(${zoomScale});
                transition: transform 0.2s ease-out;
              " title="${asset.name}">
                ${iconEmoji}
              </div>
            `;

            const customIcon = L.divIcon({
              html: markerHtml,
              className: "custom-asset-marker",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const marker = L.marker([asset.lat, asset.lng], {
              icon: customIcon,
              draggable: true,
            }).addTo(layersRef.current.assets!);

            marker.on("dragstart", () => {
              if (mapRef.current) mapRef.current.dragging.disable();
            });

            marker.on("dragend", (e) => {
              if (mapRef.current) mapRef.current.dragging.enable();
              const newPos = (e.target as Marker).getLatLng();
              updateAssetPosition(asset.id, newPos.lat, newPos.lng);
            });

            marker.on("click", () => {
              if (onSelectObject) onSelectObject("asset", asset.id);
            });
          });
        }
      }

      // 7. OPERATIONAL ROUTES (SEMANTIC VISUALIZATION & O/D MARKERS)
      if (layersRef.current.routes) {
        layersRef.current.routes.clearLayers();
        if (layerVisibility.routes) {
          routes.forEach((r) => {
            if (r.waypoints && r.waypoints.length >= 2) {
              const roadPoints = generateRoadFollowingRoute(
                r.waypoints,
                snapping?.snapToRoad ? "road_following" : "direct_line",
              );

              const routeColor = r.color || "#ef4444";
              const isEmergency = r.type === "emergency" || r.type === "evacuation";

              const poly = L.polyline(roadPoints as LatLngTuple[], {
                color: routeColor,
                weight: isEmergency ? 5 : 4,
                opacity: 0.9,
                dashArray: isEmergency ? "10, 6" : r.type === "service" ? "4, 4" : undefined,
              }).addTo(layersRef.current.routes!);

              poly.on("click", () => {
                if (onSelectObject) onSelectObject("route", r.id);
              });

              // Origin Badge (O) & Destination Badge (D)
              const startPoint = roadPoints[0];
              const endPoint = roadPoints[roadPoints.length - 1];

              const originHtml = `<div style="background:#22c55e; color:#000; font-weight:900; font-size:9px; border-radius:999px; width:18px; height:18px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.5);">O</div>`;
              const destHtml = `<div style="background:#ef4444; color:#fff; font-weight:900; font-size:9px; border-radius:999px; width:18px; height:18px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.5);">D</div>`;

              L.marker(startPoint as LatLngTuple, { icon: L.divIcon({ html: originHtml, className: "origin-marker" }), interactive: false }).addTo(layersRef.current.routes!);
              L.marker(endPoint as LatLngTuple, { icon: L.divIcon({ html: destHtml, className: "dest-marker" }), interactive: false }).addTo(layersRef.current.routes!);
            }
          });
        }
      }

      // 8. CCTV / SENSORS NETWORK LAYER
      if (layersRef.current.sensors) {
        layersRef.current.sensors.clearLayers();
        if (layerVisibility.sensors !== false && sensors) {
          sensors.forEach((s) => {
            // Field of View (FOV) Fan Arc
            const fovRad = (s.fieldOfViewDegrees * Math.PI) / 180;
            const orientationRad = ((s.orientationDegrees - 90) * Math.PI) / 180;
            const leftAngle = orientationRad - fovRad / 2;
            const rightAngle = orientationRad + fovRad / 2;

            const radiusDeg = s.coverageRadiusMeters / 111320;
            const leftPt: LatLngTuple = [s.lat + radiusDeg * Math.sin(leftAngle), s.lng + radiusDeg * Math.cos(leftAngle)];
            const rightPt: LatLngTuple = [s.lat + radiusDeg * Math.sin(rightAngle), s.lng + radiusDeg * Math.cos(rightAngle)];

            L.polygon([[s.lat, s.lng], leftPt, rightPt], {
              color: s.status === "warning" ? "#f59e0b" : "#a855f7",
              weight: 1.5,
              fillColor: s.status === "warning" ? "#f59e0b" : "#a855f7",
              fillOpacity: 0.12,
              dashArray: "3, 3",
            }).addTo(layersRef.current.sensors!);

            const sensorHtml = `
              <div style="
                background: rgba(15, 23, 42, 0.95);
                border: 1.5px solid ${s.status === "warning" ? "#f59e0b" : "#a855f7"};
                border-radius: 999px;
                padding: 3px 7px;
                color: #ffffff;
                font-size: 10px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
                transform: translate(-50%, -50%);
                box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
              " title="${s.name} — ${s.peopleCount} detected">
                <span style="color:#a855f7;">📹</span> ${s.name} <span style="background:#a855f720; color:#c084fc; padding:1px 4px; border-radius:4px; font-size:9px;">${s.peopleCount}</span>
              </div>
            `;

            const marker = L.marker([s.lat, s.lng], {
              icon: L.divIcon({ html: sensorHtml, className: "custom-sensor-marker", iconSize: [0, 0] }),
            }).addTo(layersRef.current.sensors!);

            marker.on("click", () => {
              if (onSelectObject) onSelectObject("sensor" as any, s.id);
            });
          });
        }
      }

      // 9. LANDMARKS & ATTRACTION NODES LAYER
      if (layersRef.current.landmarks) {
        layersRef.current.landmarks.clearLayers();
        if (layerVisibility.landmarks !== false && landmarks) {
          landmarks.forEach((l) => {
            const iconSymbol = l.type === "main_stage" ? "🎪" : l.type === "food_court" ? "🍱" : l.type === "fan_zone" ? "⭐" : "🏛️";
            const landmarkHtml = `
              <div style="
                background: rgba(15, 23, 42, 0.95);
                border: 1.5px solid #06b6d4;
                border-radius: 8px;
                padding: 4px 9px;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 5px;
                white-space: nowrap;
                transform: translate(-50%, -50%);
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.35);
              " title="${l.name}">
                <span style="font-size:13px;">${iconSymbol}</span>
                <span>${l.name}</span>
                <span style="background:rgba(6, 182, 212, 0.2); color:#22d3ee; padding:1px 5px; border-radius:4px; font-size:9px;">${(l.expectedFootfall / 1000).toFixed(1)}k EST</span>
              </div>
            `;

            const marker = L.marker([l.lat, l.lng], {
              icon: L.divIcon({ html: landmarkHtml, className: "custom-landmark-marker", iconSize: [0, 0] }),
            }).addTo(layersRef.current.landmarks!);

            marker.on("click", () => {
              if (onSelectObject) onSelectObject("landmark" as any, l.id);
            });
          });
        }
      }

      // 10. MOBILE ASSETS & ANIMATED RESPONSE UNITS LAYER
      if (layersRef.current.mobileAssets) {
        layersRef.current.mobileAssets.clearLayers();
        if (layerVisibility.mobileAssets !== false && mobileAssets) {
          mobileAssets.forEach((m) => {
            const assetIcon = m.type.includes("medical") ? "🚑" : m.type.includes("police") || m.type.includes("security") ? "🚔" : m.type.includes("shuttle") ? "🚌" : "👥";
            const statusColor = m.status === "responding" ? "#ef4444" : m.status === "moving" ? "#f59e0b" : "#10b981";

            const mobileHtml = `
              <div style="
                background: rgba(15, 23, 42, 0.95);
                border: 2px solid ${statusColor};
                border-radius: 999px;
                padding: 3px 8px;
                color: #ffffff;
                font-size: 10px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 5px;
                white-space: nowrap;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 12px ${statusColor}80;
                animation: ${m.status === "responding" ? "pulse 1.5s infinite" : "none"};
              " title="${m.name} — Status: ${m.status.toUpperCase()}">
                <span style="font-size:12px;">${assetIcon}</span>
                <span>${m.name}</span>
                <span style="background:${statusColor}25; color:${statusColor}; padding:1px 5px; border-radius:4px; font-size:9px;">${m.status.toUpperCase()}</span>
              </div>
            `;

            const marker = L.marker([m.currentPosition[0], m.currentPosition[1]], {
              icon: L.divIcon({ html: mobileHtml, className: "custom-mobile-marker", iconSize: [0, 0] }),
            }).addTo(layersRef.current.mobileAssets!);

            marker.on("click", () => {
              if (onSelectObject) onSelectObject("mobile" as any, m.id);
            });
          });
        }
      }
    });
  }, [
    regionPolygon,
    regionMode,
    paintedAreas,
    layerVisibility,
    zones,
    assets,
    routes,
    h3Stats,
    showH3GridOverlay,
    currentZoom,
    activeTool,
    snapping,
    selectedObjectId,
    selectedObjectType,
    anchors,
    landmarks,
    mobileAssets,
    sensors,
    updateAnchorPosition,
    updateAsset,
    updateZoneGeometry,
    onSelectObject,
    onSelectH3Cell,
    updateAssetPosition,
  ]);

  // Pointer Events Paint Canvas Engine
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool !== "paint" || !mapRef.current) return;
    isPaintingRef.current = true;
    currentPaintStrokeRef.current = [];

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;
      const latLng = map.containerPointToLatLng(L.point(x, y));
      currentPaintStrokeRef.current.push([latLng.lat, latLng.lng]);
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool !== "paint" || !isPaintingRef.current || !mapRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;
      const latLng = map.containerPointToLatLng(L.point(x, y));
      currentPaintStrokeRef.current.push([latLng.lat, latLng.lng]);

      // Render live stroke preview line
      if (layersRef.current.drawing) {
        layersRef.current.drawing.clearLayers();
        const strokeColor = PAINT_COLORS[paintCategory] || "#06b6d4";
        L.polyline(currentPaintStrokeRef.current as LatLngTuple[], {
          color: strokeColor,
          weight: Math.max(6, Math.round(brushSizeMeters / 4)),
          opacity: 0.7,
        }).addTo(layersRef.current.drawing);
      }
    });
  };

  const handlePointerUp = () => {
    if (activeTool !== "paint" || !isPaintingRef.current) return;
    isPaintingRef.current = false;

    if (layersRef.current.drawing) {
      layersRef.current.drawing.clearLayers();
    }

    const strokePoints = currentPaintStrokeRef.current;
    if (strokePoints.length >= 2) {
      // Buffer stroke into continuous polygon using Turf
      const circlePoly = GeometryEngine.simplifyFreehand(strokePoints, 0.0001);
      if (circlePoly.length >= 3) {
        const areaSqM = Math.round(GeometryEngine.calculateAreaSqKm(circlePoly) * 1_000_000);
        addPaintedArea({
          name: `${paintCategory.toUpperCase()} Area`,
          category: paintCategory,
          boundary: circlePoly,
          color: PAINT_COLORS[paintCategory] || "#06b6d4",
          areaSqMeters: areaSqM,
          createdAt: Date.now(),
        });
      }
    }
    currentPaintStrokeRef.current = [];
  };

  // Interactive Map Click Handler for Non-Paint Tools
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    const map = mapRef.current;

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // 0. SELECT MODE: Deselect object on empty map click
      if (activeTool === "select") {
        if (onSelectObject) onSelectObject(null, null);
        return;
      }

      // 1. REGION DRAWING TOOL
      if (activeTool === "region") {
        setDrawPoints((prev) => {
          // If clicking near first point in polygon mode, complete polygon
          if (regionMode === "polygon" && prev.length >= 3) {
            const firstPt = prev[0];
            const distM = GeometryEngine.calculateDistanceMeters([lat, lng], [firstPt[0], firstPt[1]]);
            if (distM < 40) {
              setRegionPolygon(prev as [number, number][]);
              confirmRegion();
              if (layersRef.current.drawing) layersRef.current.drawing.clearLayers();
              setLastClickToast({
                text: `REGION PERIMETER CONFIRMED (${prev.length} vertices)`,
                id: Date.now(),
              });
              if (onSelectObject) onSelectObject("region", "main-perimeter");
              if (!keepToolActive && onToolComplete) onToolComplete("select");
              return [];
            }
          }

          const updated = [...prev, [lat, lng] as LatLngTuple];

          // Bounding Box (Rectangle) mode: 2 clicks define rectangle
          if (regionMode === "rectangle" && updated.length >= 2) {
            const [p1, p2] = updated;
            const rectPoly: [number, number][] = [
              [p1[0], p1[1]],
              [p1[0], p2[1]],
              [p2[0], p2[1]],
              [p2[0], p1[1]],
            ];
            setRegionPolygon(rectPoly);
            confirmRegion();
            if (layersRef.current.drawing) layersRef.current.drawing.clearLayers();
            setLastClickToast({
              text: `BOUNDING BOX REGION CONFIRMED (4 vertices)`,
              id: Date.now(),
            });
            if (onSelectObject) onSelectObject("region", "main-perimeter");
            if (!keepToolActive && onToolComplete) onToolComplete("select");
            return [];
          }

          // Radial (Circle) mode: 2 clicks define circle
          if (regionMode === "circle" && updated.length >= 2) {
            const [center, edge] = updated;
            const radiusM = GeometryEngine.calculateDistanceMeters([center[0], center[1]], [edge[0], edge[1]]);
            const circlePoly = GeometryEngine.createCirclePolygon([center[0], center[1]], Math.max(50, radiusM));
            setRegionPolygon(circlePoly);
            confirmRegion();
            if (layersRef.current.drawing) layersRef.current.drawing.clearLayers();
            setLastClickToast({
              text: `RADIAL REGION CONFIRMED (Radius: ${radiusM}m)`,
              id: Date.now(),
            });
            if (onSelectObject) onSelectObject("region", "main-perimeter");
            if (!keepToolActive && onToolComplete) onToolComplete("select");
            return [];
          }

          import("leaflet").then((L) => {
            if (layersRef.current.drawing) {
              layersRef.current.drawing.clearLayers();

              if (updated.length >= 3) {
                // Render live filled polygon preview
                L.polygon(updated, {
                  color: "#6366f1",
                  weight: 3,
                  dashArray: "6, 6",
                  fillColor: "#6366f1",
                  fillOpacity: 0.25,
                }).addTo(layersRef.current.drawing);
              } else if (updated.length === 2) {
                // Render line segment preview
                L.polyline(updated, { color: "#6366f1", weight: 3, dashArray: "4, 4" }).addTo(
                  layersRef.current.drawing,
                );
              }

              // Render numbered vertex indicators
              updated.forEach((pt, index) => {
                const markerHtml = `<div style="background:#6366f1; color:#ffffff; font-weight:900; font-size:10px; border-radius:999px; width:18px; height:18px; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 0 10px #6366f1;">${index + 1}</div>`;
                L.marker(pt, {
                  icon: L.divIcon({ html: markerHtml, className: "region-vertex-marker" }),
                  interactive: false,
                }).addTo(layersRef.current.drawing!);
              });
            }
          });

          setLastClickToast({
            text: `VERTEX ${updated.length} ADDED (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            id: Date.now(),
          });

          return updated;
        });
        return;
      }

      // 1.5 ANCHOR PLACEMENT TOOL
      if (activeTool === "anchor") {
        addAnchor({
          name: `Gate ${Math.floor(Math.random() * 90 + 10)}`,
          type: "entry",
          lat,
          lng,
          expectedThroughputPerMin: 1200,
          notes: "Primary ingress gate",
        });
        setLastClickToast({
          text: `ANCHOR PLACED: Gate at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          id: Date.now(),
        });
        if (!keepToolActive && onToolComplete) onToolComplete("select");
        return;
      }

      // 2. RESOURCE PLACEMENT TOOL
      if (activeTool === "resource") {
        const assignedZone = zones.find(z => GeometryEngine.isPointInPolygon([lat, lng], z.boundary))?.id || (zones.length > 0 ? zones[0].id : "central");
        const newAssetId = `asset-${Date.now()}`;
        addAsset({
          name: `${selectedAssetType.toUpperCase()} Unit ${Math.floor(Math.random() * 90 + 10)}`,
          type: selectedAssetType,
          lat,
          lng,
          zoneId: assignedZone,
          status: "active",
          coverageRadiusMeters: 80,
          heading: 135,
          fov: 90,
          rangeMeters: 80,
        });
        setLastClickToast({
          text: `ASSET PLACED: ${selectedAssetType.toUpperCase()} at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          id: Date.now(),
        });
        if (onSelectObject) onSelectObject("asset", newAssetId);
        if (!keepToolActive && onToolComplete) onToolComplete("select");
        return;
      }

      // 3. ROUTE AUTHORING TOOL (OSRM Network / Guided / Manual)
      if (activeTool === "route") {
        setDrawPoints((prev) => {
          const updated = [...prev, [lat, lng] as LatLngTuple];

          import("leaflet").then((L) => {
            if (layersRef.current.drawing) {
              layersRef.current.drawing.clearLayers();
              L.polyline(updated, { color: "#ef4444", weight: 3, dashArray: "6, 6" }).addTo(
                layersRef.current.drawing,
              );
            }
          });

          if (updated.length >= 2) {
            const rawWaypoints = updated as [number, number][];

            // Calculate route asynchronously with OSRM
            fetchOSRMNetworkRoute(rawWaypoints, selectedRouteType === "emergency" ? "driving" : "foot").then((routeData) => {
              addRoute({
                name: `${selectedRouteType.toUpperCase()} Route (${(routeData.distanceMeters / 1000).toFixed(1)} km)`,
                type: selectedRouteType,
                waypoints: routeData.waypoints,
                color: selectedRouteType === "emergency" ? "#ef4444" : "#06b6d4",
                status: "clear",
                distanceMeters: routeData.distanceMeters,
                estMinutes: routeData.estMinutes,
                isRoutedRoad: routeData.isRoutedRoad,
                routeMode: selectedRouteMode,
                routingProvider: routeData.provider,
              });
            });

            if (layersRef.current.drawing) layersRef.current.drawing.clearLayers();
            if (!keepToolActive && onToolComplete) onToolComplete("select");
            return [];
          }

          return updated;
        });
        return;
      }

      // 4. MEASUREMENT TOOL
      if (activeTool === "measure") {
        setMeasurePoints((prev) => {
          const updated = [...prev, [lat, lng] as LatLngTuple];

          import("leaflet").then((L) => {
            if (layersRef.current.measure) {
              layersRef.current.measure.clearLayers();
              if (updated.length >= 2) {
                L.polyline(updated, { color: "#eab308", weight: 3 }).addTo(layersRef.current.measure);
              }
            }
          });

          return updated;
        });
      }

      // 5. CCTV SENSOR PLACEMENT TOOL
      if (activeTool === "sensor") {
        const targetZone = zones.find((z) => GeometryEngine.isPointInPolygon([lat, lng], z.boundary));
        addSensor({
          name: `CCTV Cam ${sensors.length + 1}`,
          type: "cctv",
          lat,
          lng,
          zoneId: targetZone?.id || "",
          orientationDegrees: Math.floor(Math.random() * 360),
          peopleCount: Math.floor(Math.random() * 180 + 20),
        });
        setLastClickToast({
          text: `CCTV SENSOR PLACED at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          id: Date.now(),
        });
        if (!keepToolActive && onToolComplete) onToolComplete("select");
        return;
      }

      // 6. LANDMARK PLACEMENT TOOL
      if (activeTool === "landmark") {
        addLandmark({
          name: `Attraction Stage ${landmarks.length + 1}`,
          type: "main_stage",
          lat,
          lng,
          expectedFootfall: 12500,
        });
        setLastClickToast({
          text: `LANDMARK PLACED at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          id: Date.now(),
        });
        if (!keepToolActive && onToolComplete) onToolComplete("select");
        return;
      }

      // 7. MOBILE ASSET PLACEMENT TOOL
      if (activeTool === "mobile") {
        addMobileAsset({
          name: `Medical Rapid Response 0${mobileAssets.length + 1}`,
          type: "medical_personnel",
          currentPosition: [lat, lng],
          status: "available",
          speedMps: 4.0,
        });
        setLastClickToast({
          text: `MOBILE ASSET DEPLOYED at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          id: Date.now(),
        });
        if (!keepToolActive && onToolComplete) onToolComplete("select");
        return;
      }

      // 8. EXACT POINTER ZONE PLACEMENT TOOL
      if (activeTool === "zone" || activeTool === "rectangle" || activeTool === "circle" || activeTool === "polygon") {
        const offset = 0.0015; // ~150 meters box around exact cursor click point
        const nwLat = lat + offset;
        const nwLng = lng - offset;
        const seLat = lat - offset;
        const seLng = lng + offset;

        const isCircle = activeTool === "circle" || activeDrawingPrimitive === "circle";
        const newZoneId = isCircle ? `zone-circle-${Date.now()}` : `zone-rect-${Date.now()}`;

        if (isCircle) {
          addCircleZone(`Circle Zone ${zones.length + 1}`, "venue", [lat, lng], 150);
        } else {
          addRectangleZone(`Zone ${String.fromCharCode(65 + (zones.length % 26))}`, "venue", nwLat, nwLng, seLat, seLng);
        }

        // Out-of-bounds region validation check
        if (regionPolygon.length >= 3) {
          const isInside = GeometryEngine.isPointInPolygon([lat, lng], regionPolygon);
          if (!isInside) {
            setLastClickToast({
              text: `⚠️ Zone placed outside confirmed region — Clamping boundary`,
              id: Date.now(),
            });
            setTimeout(() => clipZoneToRegion(newZoneId), 100);
          } else {
            setLastClickToast({
              text: `ZONE CREATED AT POINTER: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
              id: Date.now(),
            });
          }
        }

        if (onSelectObject) onSelectObject("zone", newZoneId);
        if (!keepToolActive && onToolComplete) onToolComplete("select");
        return;
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [
    activeTool,
    activeDrawingPrimitive,
    selectedAssetType,
    selectedRouteType,
    selectedRouteMode,
    zones,
    sensors.length,
    landmarks.length,
    mobileAssets.length,
    addAsset,
    addAnchor,
    addSensor,
    addLandmark,
    addMobileAsset,
    addCircleZone,
    addRectangleZone,
    addRoute,
    clipZoneToRegion,
    regionPolygon,
    onSelectObject,
    onToolComplete,
    setRegionPolygon,
    keepToolActive,
  ]);

  return (
    <div
      className="relative h-full min-h-[400px] w-full overflow-hidden rounded-xl border border-border shadow-md touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full bg-surface-muted" />

      {/* 2D SVG Spatial Design Canvas Overlay (Direct 2D Authoring & Interaction) */}
      <SpatialDesignOverlayCanvas
        map={mapInstance}
        activeTool={activeTool}
        selectedAssetType={selectedAssetType}
        onSelectObject={(id, type) => {
          if (onSelectObject) onSelectObject(type as any, id);
        }}
        onToolComplete={onToolComplete}
      />

      {/* Top Banner Overlay for Locked Viewport Design Mode */}
      <DesignModeHeader />

      {/* Active Region Drawing Floating Control HUD */}
      {(activeTool === "region" || drawPoints.length > 0) && (
        <div className="absolute top-14 left-3 z-[1000] flex items-center gap-3 rounded-xl border border-indigo-500/60 bg-slate-950/95 p-2.5 backdrop-blur-md shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-2 font-mono text-xs text-indigo-300 font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-ping" />
            <span>REGION PERIMETER: {drawPoints.length} vertices placed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCompleteRegion}
              disabled={drawPoints.length < 3}
              className={`rounded-lg px-2.5 py-1 text-xs font-black transition-all ${
                drawPoints.length >= 3
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
              }`}
              title={drawPoints.length < 3 ? "Minimum 3 vertices required to complete region" : "Confirm region boundary"}
            >
              COMPLETE REGION ({drawPoints.length >= 3 ? "READY" : `${3 - drawPoints.length} MORE`})
            </button>

            {drawPoints.length > 0 && (
              <button
                type="button"
                onClick={handleCancelRegion}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Active Tool Banner */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-xl border border-border bg-surface/90 px-3 py-1.5 backdrop-blur-md shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-xs font-bold text-foreground font-mono">
          {activeTool === "paint"
            ? `🖌️ PAINT MODE (${paintCategory.toUpperCase()}): DRAG ON MAP TO DRAW GEOMASK`
            : activeTool === "region"
              ? `📐 REGION TOOL: CLICK MAP TO DRAW BOUNDARY POLYGON`
              : activeTool === "resource"
                ? `📍 RESOURCE TOOL: CLICK MAP TO PLACE ${selectedAssetType.toUpperCase()}`
                : activeTool === "route"
                  ? `🛣️ ROUTE TOOL (${selectedRouteMode.toUpperCase()}): CLICK 2 POINTS FOR OSRM NETWORK PATH`
                  : activeTool === "measure"
                    ? `📏 MEASURE TOOL (${measureMode.toUpperCase()}): CLICK MAP POINTS`
                    : `✋ SELECT / INSPECT MODE ACTIVE`}
        </span>
      </div>

      {/* Dynamic Transform & Geometry Badge */}
      {transformBadge && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 rounded-xl border border-cyan-400 bg-slate-950/95 px-4 py-2 text-xs font-mono font-black text-cyan-300 shadow-2xl animate-pulse">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{transformBadge}</span>
        </div>
      )}

      {/* Floating Layer Toggle Control Widget */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface/90 p-1.5 backdrop-blur-md shadow-md text-[11px] font-mono font-bold">
        <span className="text-foreground-muted uppercase text-[9px] px-1">Layers:</span>
        <button
          type="button"
          onClick={() => toggleLayerVisibility("region")}
          className={`rounded-lg px-2 py-0.5 border ${
            layerVisibility.region ? "border-indigo-500 bg-indigo-500/20 text-indigo-300" : "border-border text-foreground-muted/50"
          }`}
        >
          Region
        </button>
        <button
          type="button"
          onClick={() => toggleLayerVisibility("paint")}
          className={`rounded-lg px-2 py-0.5 border ${
            layerVisibility.paint ? "border-cyan-500 bg-cyan-500/20 text-cyan-300" : "border-border text-foreground-muted/50"
          }`}
        >
          Paint ({paintedAreas?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => toggleLayerVisibility("zones")}
          className={`rounded-lg px-2 py-0.5 border ${
            layerVisibility.zones ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-border text-foreground-muted/50"
          }`}
        >
          Zones ({zones.length})
        </button>
        <button
          type="button"
          onClick={() => toggleLayerVisibility("routes")}
          className={`rounded-lg px-2 py-0.5 border ${
            layerVisibility.routes ? "border-rose-500 bg-rose-500/20 text-rose-300" : "border-border text-foreground-muted/50"
          }`}
        >
          Routes ({routes.length})
        </button>
        <button
          type="button"
          onClick={() => toggleLayerVisibility("assets")}
          className={`rounded-lg px-2 py-0.5 border ${
            layerVisibility.assets ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-border text-foreground-muted/50"
          }`}
        >
          Assets ({assets.length})
        </button>
      </div>

      {/* Measurement Tool Active Overlay Card */}
      {activeTool === "measure" && measurePoints.length > 0 && (
        <div className="absolute top-14 left-3 z-[1000] flex flex-col gap-2 rounded-xl border border-border bg-surface/95 p-3 backdrop-blur-md shadow-lg w-72">
          <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1">
              📏 Live Measurement Result
            </span>
            <span className="text-[10px] font-mono text-foreground-muted">{measurePoints.length} points placed</span>
          </div>

          <div className="space-y-1 font-mono text-xs text-foreground">
            <div className="flex justify-between">
              <span className="text-foreground-muted">Distance:</span>
              <span className="font-bold text-foreground">
                {measureDistance >= 1000
                  ? `${(measureDistance / 1000).toFixed(2)} km`
                  : `${Math.round(measureDistance)} meters`}
              </span>
            </div>

            {measurePoints.length >= 3 && (
              <div className="flex justify-between">
                <span className="text-foreground-muted">Enclosed Area:</span>
                <span className="font-bold text-foreground">
                  {measureArea >= 1_000_000
                    ? `${(measureArea / 1_000_000).toFixed(2)} sq km`
                    : `${Math.round(measureArea).toLocaleString()} sq m`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setMeasurePoints([])}
              className="flex-1 rounded-lg border border-border bg-surface-muted py-1 text-xs font-bold text-foreground hover:bg-surface"
            >
              [ CLEAR ]
            </button>
            <button
              type="button"
              onClick={() => {
                const text = `Distance: ${(measureDistance / 1000).toFixed(2)} km${
                  measurePoints.length >= 3 ? `, Area: ${(measureArea / 1_000_000).toFixed(2)} sq km` : ""
                }`;
                navigator.clipboard.writeText(text);
                alert(`Copied to clipboard: "${text}"`);
              }}
              className="flex-1 rounded-lg bg-amber-500 py-1 text-xs font-bold text-black hover:bg-amber-400"
            >
              [ COPY ]
            </button>
          </div>
        </div>
      )}

      {/* LIVE COORDINATE CROSSHAIR OVERLAY */}
      {hoverCoords && (
        <div className="absolute bottom-4 right-14 z-[1000] flex items-center gap-2 rounded-xl border border-border/80 bg-surface/90 px-3 py-1.5 backdrop-blur-md shadow-sm font-mono text-[11px]">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-foreground-muted font-bold">LAT:</span>
          <span className="text-cyan-300 font-extrabold">{hoverCoords.lat.toFixed(5)}</span>
          <span className="text-foreground-muted font-bold ml-1">LNG:</span>
          <span className="text-cyan-300 font-extrabold">{hoverCoords.lng.toFixed(5)}</span>
        </div>
      )}

      {/* CLICK POINT ADDED TOAST NOTIFICATION */}
      {lastClickToast && (
        <div className="absolute top-14 right-4 z-[1000] flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/90 px-3.5 py-2 backdrop-blur-md shadow-lg font-mono text-xs text-emerald-200 animate-bounce">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-extrabold">{lastClickToast.text}</span>
        </div>
      )}
    </div>
  );
}
