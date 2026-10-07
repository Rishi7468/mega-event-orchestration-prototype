"use client";

import { useState, useEffect } from "react";
import {
  useEventAuthoringStore,
  type AssetType,
  type AssetCategory,
  type RouteType,
} from "@/store/eventAuthoringStore";
import type { PaintCategory, RouteAuthoringMode } from "@/types/eventPlan";
import {
  MousePointer,
  Square,
  Pentagon,
  Circle,
  FileCode,
  Layers,
  MapPin,
  Navigation,
  Ruler,
  RotateCcw,
  RotateCw,
  Sparkles,
  Paintbrush,
  Eraser,
  Lock,
  Unlock,
  Trash2,
  Globe,
  Waypoints,
  Edit3,
  Anchor as AnchorIcon,
  DoorOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Ambulance,
  Crosshair,
  Building2,
  Users,
  Radio,
  Car,
  Bus,
  Droplets,
  Zap,
  Info,
  Ticket,
} from "lucide-react";

export type AuthoringTool =
  | "select"
  | "rectangle"
  | "circle"
  | "polygon"
  | "region"
  | "paint"
  | "zone"
  | "anchor"
  | "resource"
  | "route"
  | "measure"
  | "h3";

type CompactToolbarProps = {
  activeTool: AuthoringTool;
  setActiveTool: (tool: AuthoringTool) => void;
  selectedAssetType: AssetType;
  setSelectedAssetType: (type: AssetType) => void;
  selectedRouteType: RouteType;
  setSelectedRouteType: (type: RouteType) => void;
  selectedRouteMode?: RouteAuthoringMode;
  setSelectedRouteMode?: (mode: RouteAuthoringMode) => void;
  measureMode: "distance" | "area" | "radius";
  setMeasureMode: (mode: "distance" | "area" | "radius") => void;
  onOpenGeoJSON: () => void;
  onOpenResetModal?: () => void;
  onOpenWhatsMissingModal?: () => void;
};

const ASSET_PALETTES: Record<
  AssetCategory,
  { label: string; items: { type: AssetType; label: string; icon: React.ComponentType<{ className?: string }> }[] }
> = {
  crowd_management: {
    label: "Crowd Management",
    items: [
      { type: "gate", label: "Gate", icon: DoorOpen },
      { type: "entry", label: "Ingress", icon: ArrowUpRight },
      { type: "exit", label: "Egress", icon: ArrowDownLeft },
      { type: "barricade", label: "Barricade", icon: Shield },
      { type: "checkpoint", label: "Checkpoint", icon: AlertTriangle },
      { type: "crowd_marshal", label: "Marshal Post", icon: ShieldCheck },
    ],
  },
  safety: {
    label: "Safety & Security",
    items: [
      { type: "cctv", label: "CCTV", icon: Radio },
      { type: "security_post", label: "Security Post", icon: ShieldCheck },
      { type: "emergency_station", label: "Emerg. Station", icon: AlertTriangle },
      { type: "assembly_area", label: "Assembly Area", icon: Users },
      { type: "restricted_area", label: "Restricted Zone", icon: Shield },
    ],
  },
  medical: {
    label: "Medical & Health",
    items: [
      { type: "medical", label: "Medical Unit", icon: Ambulance },
      { type: "first_aid", label: "First Aid Post", icon: Crosshair },
      { type: "ambulance_stand", label: "Ambulance Stand", icon: Car },
      { type: "hospital_access", label: "Hospital Access", icon: Building2 },
    ],
  },
  people: {
    label: "Personnel & Staff",
    items: [
      { type: "volunteer", label: "Volunteer Post", icon: Users },
      { type: "field_team", label: "Field Patrol", icon: Radio },
      { type: "police", label: "Police Detail", icon: ShieldCheck },
      { type: "info_desk", label: "Info Desk", icon: Info },
    ],
  },
  infrastructure: {
    label: "Infrastructure & Logistics",
    items: [
      { type: "parking", label: "Parking Hub", icon: Car },
      { type: "shuttle_stop", label: "Shuttle Stop", icon: Bus },
      { type: "water", label: "Water Station", icon: Droplets },
      { type: "toilet", label: "Sanitation", icon: Building2 },
      { type: "food", label: "Food Plaza", icon: Ticket },
      { type: "charging", label: "Charging Station", icon: Zap },
      { type: "lost_found", label: "Lost & Found", icon: Info },
    ],
  },
};

const PAINT_CATEGORIES: { cat: PaintCategory; label: string; color: string }[] = [
  { cat: "crowd", label: "Crowd Area", color: "#06b6d4" },
  { cat: "queue", label: "Queue Area", color: "#3b82f6" },
  { cat: "restricted", label: "Restricted", color: "#ef4444" },
  { cat: "medical", label: "Medical Area", color: "#10b981" },
  { cat: "emergency", label: "Emergency", color: "#f43f5e" },
  { cat: "vip", label: "VIP Zone", color: "#a855f7" },
  { cat: "parking", label: "Parking", color: "#6366f1" },
  { cat: "staff", label: "Staff Area", color: "#f59e0b" },
  { cat: "custom", label: "Custom", color: "#64748b" },
];

const ROUTE_TYPES: { type: RouteType; label: string; color: string }[] = [
  { type: "emergency", label: "Emergency Corridor", color: "#ef4444" },
  { type: "evacuation", label: "Mass Evacuation", color: "#f97316" },
  { type: "entry", label: "Crowd Ingress", color: "#3b82f6" },
  { type: "exit", label: "Crowd Egress", color: "#10b981" },
  { type: "crowd_flow", label: "Internal Circulation", color: "#06b6d4" },
  { type: "vip", label: "VIP Corridor", color: "#a855f7" },
  { type: "staff", label: "Staff Route", color: "#eab308" },
  { type: "service", label: "Logistics Route", color: "#64748b" },
];

const BRUSH_SIZES = [15, 30, 60, 120, 250];

export function CompactToolbar({
  activeTool,
  setActiveTool,
  selectedAssetType,
  setSelectedAssetType,
  selectedRouteType,
  setSelectedRouteType,
  selectedRouteMode = "network",
  setSelectedRouteMode,
  measureMode,
  setMeasureMode,
  onOpenGeoJSON,
  onOpenResetModal,
  onOpenWhatsMissingModal,
}: CompactToolbarProps) {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("crowd_management");

  const {
    regionMode,
    setRegionMode,
    isRegionConfirmed,
    isCanvasLocked,
    toggleCanvasLock,
    paintCategory,
    setPaintCategory,
    brushSizeMeters,
    setBrushSize,
    paintMode,
    setPaintMode,
    paintedAreas,
    clearPaintedAreas,
    convertPaintToZone,
    undo,
    redo,
    pastHistory,
    futureHistory,
    generateOperationalZones,
    addRectangleZone,
    addCircleZone,
    centerCoordinates,
    selectedObjectId,
    selectedObjectType,
    deleteSelectedObject,
    keepToolActive,
    toggleKeepToolActive,
  } = useEventAuthoringStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) return;
        if (selectedObjectId && selectedObjectType) {
          deleteSelectedObject(selectedObjectId, selectedObjectType);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, selectedObjectType, deleteSelectedObject]);

  const canUndo = pastHistory.length > 0;
  const canRedo = futureHistory.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-md space-y-3">
      {/* Primary Toolbar Group */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        {/* Main Tools Group */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTool("select")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              activeTool === "select"
                ? "border-accent bg-accent text-accent-foreground shadow-xs"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title="Select & Inspect Objects on Canvas"
          >
            <MousePointer className="h-3.5 w-3.5" /> SELECT
          </button>

          <button
            type="button"
            onClick={toggleKeepToolActive}
            className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
              keepToolActive
                ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-xs"
                : "border-border bg-surface-muted/30 text-foreground-muted hover:bg-surface-muted"
            }`}
            title="Keep Tool Active after placing objects (Sticky Creation Mode)"
          >
            <Sparkles className={`h-3 w-3 ${keepToolActive ? "text-amber-400" : "text-foreground-muted"}`} />
            {keepToolActive ? "Sticky ON" : "Sticky OFF"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("region")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              activeTool === "region"
                ? "border-accent bg-accent text-accent-foreground shadow-xs"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title="Define Authoritative Spatial Region Boundary"
          >
            <Square className="h-3.5 w-3.5" /> REGION
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("paint")}
            disabled={!isRegionConfirmed}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              !isRegionConfirmed
                ? "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
                : activeTool === "paint"
                ? "border-cyan-500 bg-cyan-500 text-black shadow-xs font-black"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title={isRegionConfirmed ? "Paint Spatial Areas (Crowd, Queue, Medical, Emergency, VIP)" : "Define and confirm event region first."}
          >
            <Paintbrush className="h-3.5 w-3.5" /> PAINT
            {!isRegionConfirmed && <Lock className="h-3 w-3 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("zone")}
            disabled={!isRegionConfirmed}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              !isRegionConfirmed
                ? "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
                : activeTool === "zone"
                ? "border-accent bg-accent text-accent-foreground shadow-xs"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title={isRegionConfirmed ? "Operational Zones & Partitioning" : "Define and confirm event region first."}
          >
            <Layers className="h-3.5 w-3.5" /> ZONES
            {!isRegionConfirmed && <Lock className="h-3 w-3 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("anchor")}
            disabled={!isRegionConfirmed}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              !isRegionConfirmed
                ? "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
                : activeTool === "anchor"
                ? "border-emerald-500 bg-emerald-500 text-black shadow-xs font-black"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title={isRegionConfirmed ? "Place Operational Anchors (Gates, Ingress, Checkpoints, Medical Bases)" : "Define and confirm event region first."}
          >
            <AnchorIcon className="h-3.5 w-3.5" /> ANCHORS
            {!isRegionConfirmed && <Lock className="h-3 w-3 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("route")}
            disabled={!isRegionConfirmed}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              !isRegionConfirmed
                ? "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
                : activeTool === "route"
                ? "border-accent bg-accent text-accent-foreground shadow-xs"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title={isRegionConfirmed ? "OSRM Network & Event Corridors" : "Define and confirm event region first."}
          >
            <Navigation className="h-3.5 w-3.5" /> ROUTES
            {!isRegionConfirmed && <Lock className="h-3 w-3 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("resource")}
            disabled={!isRegionConfirmed}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              !isRegionConfirmed
                ? "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
                : activeTool === "resource"
                ? "border-accent bg-accent text-accent-foreground shadow-xs"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title={isRegionConfirmed ? "Tactical Resource Placement" : "Define and confirm event region first."}
          >
            <MapPin className="h-3.5 w-3.5" /> ASSETS
            {!isRegionConfirmed && <Lock className="h-3 w-3 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("measure")}
            disabled={!isRegionConfirmed}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              !isRegionConfirmed
                ? "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
                : activeTool === "measure"
                ? "border-amber-500 bg-amber-500 text-black font-extrabold shadow-xs"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
            title={isRegionConfirmed ? "Live Measurement Tool" : "Define and confirm event region first."}
          >
            <Ruler className="h-3.5 w-3.5" /> MEASURE
          </button>
        </div>

        {/* Lock Canvas, Undo, Redo & GeoJSON Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleCanvasLock}
            className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold transition-all ${
              isCanvasLocked
                ? "border-amber-500 bg-amber-500/20 text-amber-400 font-mono"
                : "border-border bg-surface-muted/50 text-foreground-muted hover:text-foreground"
            }`}
            title={isCanvasLocked ? "Canvas Locked: Map pan/zoom locked for smooth painting" : "Lock Canvas for Painting"}
          >
            {isCanvasLocked ? <Lock className="h-3.5 w-3.5 text-amber-400" /> : <Unlock className="h-3.5 w-3.5" />}
            {isCanvasLocked ? "LOCKED" : "LOCK"}
          </button>

          <span className="h-4 w-px bg-border mx-1" />

          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={`rounded-lg border p-1.5 text-xs transition-all ${
              canUndo
                ? "border-border bg-surface-muted text-foreground hover:bg-surface-muted/80"
                : "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
            }`}
            title="Undo Last Action"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={`rounded-lg border p-1.5 text-xs transition-all ${
              canRedo
                ? "border-border bg-surface-muted text-foreground hover:bg-surface-muted/80"
                : "border-border/40 bg-surface-muted/20 text-foreground-muted/40 cursor-not-allowed"
            }`}
            title="Redo Action"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          {onOpenWhatsMissingModal && (
            <button
              type="button"
              onClick={onOpenWhatsMissingModal}
              className="flex items-center gap-1 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 shadow-xs"
              title="Analyze Plan Completeness & Missing Infrastructure"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> WHAT&apos;S MISSING?
            </button>
          )}

          {onOpenResetModal && (
            <button
              type="button"
              onClick={onOpenResetModal}
              className="flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 shadow-xs"
              title="Reset Event Plan Elements"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" /> RESET
            </button>
          )}

          <button
            type="button"
            onClick={onOpenGeoJSON}
            className="flex items-center gap-1 rounded-xl border border-border bg-surface-muted/50 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted"
            title="Import or Export GeoJSON Plan"
          >
            <FileCode className="h-3.5 w-3.5 text-accent" /> GeoJSON
          </button>
        </div>
      </div>

      {/* SECONDARY TOOL-CONTEXTUAL SUB-RIBBONS */}

      {/* PAINT SUB-RIBBON */}
      {activeTool === "paint" && (
        <div className="space-y-2 rounded-xl bg-surface-muted/60 p-2.5 border border-cyan-500/30 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-extrabold text-foreground-muted uppercase text-[10px] font-mono mr-1">Category:</span>
              {PAINT_CATEGORIES.map((p) => (
                <button
                  key={p.cat}
                  type="button"
                  onClick={() => setPaintCategory(p.cat)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-[11px] border transition-all ${
                    paintCategory === p.cat
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-extrabold scale-[1.02]"
                      : "border-border/60 bg-surface text-foreground hover:border-cyan-500/50"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPaintMode("paint")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold border ${
                  paintMode === "paint" ? "border-cyan-400 bg-cyan-500/20 text-cyan-300" : "border-border bg-surface text-foreground-muted"
                }`}
              >
                <Paintbrush className="h-3 w-3" /> Paint
              </button>
              <button
                type="button"
                onClick={() => setPaintMode("erase")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold border ${
                  paintMode === "erase" ? "border-rose-400 bg-rose-500/20 text-rose-300" : "border-border bg-surface text-foreground-muted"
                }`}
              >
                <Eraser className="h-3 w-3" /> Erase
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-foreground-muted uppercase text-[10px] font-mono">Brush Size:</span>
              <div className="flex items-center gap-1">
                {BRUSH_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBrushSize(size)}
                    className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold border ${
                      brushSizeMeters === size ? "border-cyan-400 bg-cyan-500/30 text-cyan-200" : "border-border bg-surface text-foreground-muted"
                    }`}
                  >
                    {size}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {paintedAreas.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const latest = paintedAreas[paintedAreas.length - 1];
                    const res = convertPaintToZone(latest.id);
                    if (!res.success) alert(res.error);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 font-bold text-white shadow-xs hover:bg-emerald-600"
                >
                  <Sparkles className="h-3.5 w-3.5" /> [ CONVERT TO ZONE ]
                </button>
              )}

              {paintedAreas.length > 0 && (
                <button
                  type="button"
                  onClick={clearPaintedAreas}
                  className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3 w-3" /> Clear Paint ({paintedAreas.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REGION SUB-RIBBON */}
      {activeTool === "region" && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted/50 p-2 border border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground-muted uppercase text-[10px]">Shape Mode:</span>
            <button
              type="button"
              onClick={() => setRegionMode("polygon")}
              className={`rounded-lg px-2.5 py-1 font-bold ${
                regionMode === "polygon" ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-surface"
              }`}
            >
              <Pentagon className="h-3 w-3 inline mr-1" /> Polygon
            </button>
            <button
              type="button"
              onClick={() => setRegionMode("rectangle")}
              className={`rounded-lg px-2.5 py-1 font-bold ${
                regionMode === "rectangle" ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-surface"
              }`}
            >
              <Square className="h-3 w-3 inline mr-1" /> Rectangle
            </button>
            <button
              type="button"
              onClick={() => setRegionMode("circle")}
              className={`rounded-lg px-2.5 py-1 font-bold ${
                regionMode === "circle" ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-surface"
              }`}
            >
              <Circle className="h-3 w-3 inline mr-1" /> Circle / Radius
            </button>
          </div>

          <span className="text-[11px] text-foreground-muted italic font-mono">
            Click map points to establish authoritative vector event boundary
          </span>
        </div>
      )}

      {/* ZONE SUB-RIBBON */}
      {(activeTool === "zone" || activeTool === "rectangle" || activeTool === "circle") && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted/50 p-2 border border-border/50 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-foreground font-mono">Zones & Primitives:</span>
            <button
              type="button"
              onClick={() => {
                useEventAuthoringStore.getState().setDrawingPrimitive("rectangle");
                setActiveTool("rectangle");
              }}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 font-bold transition-all ${
                activeTool === "rectangle"
                  ? "border-accent bg-accent text-accent-foreground font-black shadow-xs"
                  : "bg-surface border-accent/40 text-accent hover:bg-accent/10"
              }`}
            >
              <Square className="h-3.5 w-3.5" /> + Rectangle Mode
            </button>
            <button
              type="button"
              onClick={() => {
                useEventAuthoringStore.getState().setDrawingPrimitive("circle");
                setActiveTool("circle");
              }}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 font-bold transition-all ${
                activeTool === "circle"
                  ? "border-accent bg-accent text-accent-foreground font-black shadow-xs"
                  : "bg-surface border-accent/40 text-accent hover:bg-accent/10"
              }`}
            >
              <Circle className="h-3.5 w-3.5" /> + Circle Mode
            </button>

            <span className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => {
                const selectedObjectId = useEventAuthoringStore.getState().selectedObjectId;
                if (selectedObjectId) {
                  useEventAuthoringStore.getState().generateZoneCCTVRecommendations(selectedObjectId);
                } else if (useEventAuthoringStore.getState().zones.length > 0) {
                  useEventAuthoringStore.getState().generateZoneCCTVRecommendations(useEventAuthoringStore.getState().zones[0].id);
                }
              }}
              className="flex items-center gap-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2.5 py-1 font-bold hover:bg-purple-900/50"
            >
              <Radio className="h-3.5 w-3.5 text-purple-400" /> Auto-Place CCTV Nodes
            </button>
          </div>

          <button
            type="button"
            onClick={generateOperationalZones}
            className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1 font-bold text-accent-foreground hover:bg-accent/90"
          >
            <Sparkles className="h-3.5 w-3.5" /> Pravaah Auto Partition
          </button>
        </div>
      )}

      {/* RESOURCE SUB-RIBBON */}
      {activeTool === "resource" && (
        <div className="space-y-2 rounded-xl bg-surface-muted/50 p-2.5 border border-border/50 text-xs">
          <div className="flex flex-wrap items-center gap-1 border-b border-border/50 pb-1.5">
            {(Object.keys(ASSET_PALETTES) as AssetCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {ASSET_PALETTES[cat].label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            {ASSET_PALETTES[activeCategory].items.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedAssetType(item.type)}
                  className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] font-bold transition-all ${
                    selectedAssetType === item.type
                      ? "border-accent bg-accent/20 text-accent font-extrabold shadow-xs scale-[1.02]"
                      : "border-border/60 bg-surface text-foreground hover:border-accent"
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5 text-accent/80 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ROUTE SUB-RIBBON */}
      {activeTool === "route" && (
        <div className="space-y-2 rounded-xl bg-surface-muted/60 p-2.5 border border-border/50 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-foreground-muted uppercase text-[10px] font-mono">Routing Mode:</span>
              <button
                type="button"
                onClick={() => setSelectedRouteMode && setSelectedRouteMode("network")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ${
                  selectedRouteMode === "network" ? "bg-accent text-accent-foreground" : "bg-surface text-foreground"
                }`}
              >
                <Globe className="h-3 w-3" /> A. Network Route (OSRM)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRouteMode && setSelectedRouteMode("guided")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ${
                  selectedRouteMode === "guided" ? "bg-accent text-accent-foreground" : "bg-surface text-foreground"
                }`}
              >
                <Waypoints className="h-3 w-3" /> B. Guided Road Snap
              </button>
              <button
                type="button"
                onClick={() => setSelectedRouteMode && setSelectedRouteMode("manual")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ${
                  selectedRouteMode === "manual" ? "bg-accent text-accent-foreground" : "bg-surface text-foreground"
                }`}
              >
                <Edit3 className="h-3 w-3" /> C. Manual Event Corridor
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold text-foreground-muted uppercase text-[10px] font-mono mr-1">Route Type:</span>
            {ROUTE_TYPES.map((rt) => (
              <button
                key={rt.type}
                type="button"
                onClick={() => setSelectedRouteType(rt.type)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-[11px] border transition-all ${
                  selectedRouteType === rt.type
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border/60 bg-surface text-foreground hover:border-accent"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: rt.color }} />
                {rt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MEASURE SUB-RIBBON */}
      {activeTool === "measure" && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-muted/50 p-2 border border-border/50 text-xs">
          <span className="font-bold text-foreground-muted uppercase text-[10px]">Measure Tool:</span>
          <button
            type="button"
            onClick={() => setMeasureMode("distance")}
            className={`rounded-lg px-2.5 py-1 font-bold ${
              measureMode === "distance" ? "bg-amber-500 text-black" : "text-foreground hover:bg-surface"
            }`}
          >
            Distance (km)
          </button>
          <button
            type="button"
            onClick={() => setMeasureMode("area")}
            className={`rounded-lg px-2.5 py-1 font-bold ${
              measureMode === "area" ? "bg-amber-500 text-black" : "text-foreground hover:bg-surface"
            }`}
          >
            Area (km²)
          </button>
          <button
            type="button"
            onClick={() => setMeasureMode("radius")}
            className={`rounded-lg px-2.5 py-1 font-bold ${
              measureMode === "radius" ? "bg-amber-500 text-black" : "text-foreground hover:bg-surface"
            }`}
          >
            Radius (m)
          </button>
        </div>
      )}

      {/* ACTIVE STEP GUIDANCE BANNER */}
      <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-xs text-cyan-200">
        <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
        <div className="flex-1 font-medium">
          <span className="font-bold uppercase tracking-wider text-cyan-400 font-mono text-[10px] mr-2">
            EXPECTED ACTION:
          </span>
          {activeTool === "select" && "Click any spatial object on the map canvas to open Object Inspector."}
          {activeTool === "region" && "Click map points to define event perimeter. Min 3 vertices required."}
          {activeTool === "paint" && "Drag pointer on map canvas to draw freehand spatial mask draft."}
          {activeTool === "zone" && "Select a painted area to convert into an operational zone."}
          {activeTool === "anchor" && "Click map to place Operational Anchor (Gate / Ingress / Checkpoint / Medical Base)."}
          {activeTool === "route" && `Click Origin (O) point on map, then Destination (D) point to generate ${selectedRouteMode === "network" ? "OSRM road route" : "corridor"}.`}
          {activeTool === "resource" && "Click map location to deploy tactical resource."}
          {activeTool === "measure" && "Click 2 or more points on map canvas to calculate live distance."}
          {activeTool === "h3" && "H3 Grid overlay active. Visualizing spatial hexagon cell indexes."}
        </div>
      </div>
    </div>
  );
}
