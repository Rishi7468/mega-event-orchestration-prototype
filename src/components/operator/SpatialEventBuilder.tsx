"use client";

import { useState } from "react";
import {
  SpatialEventBuilderMap,
  type BuilderTool,
  type FocusMode,
} from "@/components/map/SpatialEventBuilderMap";
import { H3CellInspectorModal } from "@/components/operator/H3CellInspectorModal";
import {
  useEventAuthoringStore,
  type AssetType,
} from "@/store/eventAuthoringStore";
import {
  EVENT_PRESETS,
  searchGeocodedLocation,
} from "@/data/eventPresets";
import { evaluateResourceCoverage } from "@/lib/intelligence/planningEngine";
import type { H3CellStats } from "@/lib/spatial/h3Grid";
import {
  Sparkles,
  MapPin,
  Search,
  Layers,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Plus,
  Compass,
  Radio,
  Sliders,
} from "lucide-react";

type SpatialEventBuilderProps = {
  onCompleteAndEnterOperations: () => void;
};

const PALETTE_ASSETS: { type: AssetType; label: string; emoji: string }[] = [
  { type: "gate", label: "Gate", emoji: "🚪" },
  { type: "cctv", label: "CCTV", emoji: "📹" },
  { type: "medical", label: "Medical", emoji: "🚑" },
  { type: "field_team", label: "Field Team", emoji: "🛡️" },
  { type: "volunteer", label: "Volunteer", emoji: "👥" },
  { type: "parking", label: "Parking", emoji: "🅿️" },
  { type: "entry", label: "Entry", emoji: "↗️" },
  { type: "exit", label: "Exit", emoji: "↙️" },
  { type: "checkpoint", label: "Checkpoint", emoji: "⚠️" },
];

export function SpatialEventBuilder({
  onCompleteAndEnterOperations,
}: SpatialEventBuilderProps) {
  const [activeTool, setActiveTool] = useState<BuilderTool>("select");
  const [focusMode, setFocusMode] = useState<FocusMode>("planning");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedH3Cell, setSelectedH3Cell] = useState<H3CellStats | null>(null);

  const {
    zones,
    assets,
    loadPreset,
    setRegionPolygon,
    deleteAsset,
    autoPlaceRecommendedResources,
    resetEventAuthoring,
  } = useEventAuthoringStore();

  const { gaps: coverageGaps, overallSystemHealthPercent } = evaluateResourceCoverage(zones);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) ?? null;

  const handleSearchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const result = searchGeocodedLocation(searchQuery);
    if (result) {
      setRegionPolygon(result.suggestedPolygon);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    loadPreset(presetId);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar & Preset Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/15 px-3 py-0.5 text-[11px] font-bold text-accent border border-accent/30 uppercase tracking-wider">
              [SPATIAL EVENT BUILDER]
            </span>
            <h1 className="text-lg font-bold text-foreground">Map-First Event Model Authoring</h1>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            Construct event boundaries, operational sectors, and drag resources directly on the map.
          </p>
        </div>

        {/* Location Search Bar & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchLocation} className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search location (e.g. Mumbai, Delhi, Ahmedabad)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-xl border border-border bg-surface-muted/60 pl-8 pr-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-accent"
            />
          </form>

          <div className="flex items-center gap-1.5">
            {EVENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className="rounded-xl border border-border bg-surface-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent hover:bg-surface-muted transition-all"
              >
                ⚡ {preset.name.split(" — ")[0]}
              </button>
            ))}
            <button
              type="button"
              onClick={resetEventAuthoring}
              className="rounded-xl border border-border p-2 text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
              title="Reset Event Authoring"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Builder Grid: Toolbox Left, Map Center, Inspector Right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_320px]">
        {/* LEFT PALETTE: CLASH OF CLANS ASSET TOOLBOX */}
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted block mb-2">
              1. Map Authoring Tools
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTool("select")}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeTool === "select"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-surface-muted/50 text-foreground hover:bg-surface-muted"
                }`}
              >
                ✋ Select / Drag Mode
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("draw_region")}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  activeTool === "draw_region"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-surface-muted/50 text-foreground hover:bg-surface-muted"
                }`}
              >
                📐 Draw Region Polygon
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted block mb-2">
              2. Place Assets on Map
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {PALETTE_ASSETS.map((asset) => (
                <button
                  key={asset.type}
                  type="button"
                  onClick={() => setActiveTool(asset.type)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    activeTool === asset.type
                      ? "border-accent bg-accent/15 text-accent shadow-sm"
                      : "border-border bg-surface-muted/40 text-foreground hover:bg-surface-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{asset.emoji}</span> {asset.label}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-foreground-muted" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: MAP CANVAS & FOCUS MODES */}
        <div className="space-y-3">
          {/* Focus Mode Navigation Bar */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-1.5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-accent" /> Spatial Focus Mode:
            </span>

            <div className="flex items-center gap-1">
              {[
                { mode: "planning", label: "Planning", icon: Sliders },
                { mode: "crowd", label: "Crowd H3 Grid", icon: Compass },
                { mode: "resources", label: "Resources", icon: MapPin },
                { mode: "safety", label: "Safety & Risk", icon: ShieldAlert },
                { mode: "live", label: "Live Telemetry", icon: Radio },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.mode}
                    type="button"
                    onClick={() => setFocusMode(m.mode as FocusMode)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      focusMode === m.mode
                        ? "bg-accent text-accent-foreground shadow-xs"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spatial Event Builder Map */}
          <SpatialEventBuilderMap
            activeTool={activeTool}
            focusMode={focusMode}
            onSelectAsset={(id) => setSelectedAssetId(id)}
            onSelectH3Cell={(cell) => setSelectedH3Cell(cell)}
          />
        </div>

        {/* RIGHT COLUMN: INSPECTOR & RESOURCE COVERAGE AUDIT */}
        <div className="space-y-4">
          {/* Selected Asset Inspector */}
          {selectedAsset ? (
            <div className="rounded-2xl border border-border bg-surface p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                  Asset Inspector
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAssetId(null)}
                  className="text-xs text-foreground-muted hover:underline"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-foreground-muted font-mono uppercase block">Name</span>
                  <span className="font-bold text-foreground">{selectedAsset.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="rounded-lg bg-surface-muted p-2 border border-border">
                    LAT: {selectedAsset.lat.toFixed(4)}
                  </div>
                  <div className="rounded-lg bg-surface-muted p-2 border border-border">
                    LNG: {selectedAsset.lng.toFixed(4)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-foreground-muted font-mono uppercase block">H3 Cell Index</span>
                  <span className="font-mono text-accent text-xs font-bold">{selectedAsset.h3Cell}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-foreground-muted font-mono uppercase">Status</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {selectedAsset.status.toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    deleteAsset(selectedAsset.id);
                    setSelectedAssetId(null);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all mt-2"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove Asset from Map
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-foreground-muted text-center space-y-1 shadow-sm">
              <span className="font-bold text-foreground block">Click any asset on map</span>
              <span>to inspect coordinates, zone assignment & H3 cell index.</span>
            </div>
          )}

          {/* Resource Coverage & Deficiency Audit */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Resource Coverage Audit
              </h3>
              <span
                className={`font-mono font-bold text-xs rounded-full px-2 py-0.5 border ${
                  overallSystemHealthPercent >= 75
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}
              >
                {overallSystemHealthPercent}% Health
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-foreground-muted">
                <span>Placed Assets Count:</span>
                <span className="font-bold text-foreground">{assets.length} Assets</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>Configured Sectors:</span>
                <span className="font-bold text-foreground">{zones.length} Zones</span>
              </div>
            </div>

            {coverageGaps.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <ShieldAlert className="h-4 w-4" /> Coverage Gap Detected
                </div>
                <p className="text-[11px] text-amber-200">
                  {coverageGaps[0].message}
                </p>
                <button
                  type="button"
                  onClick={autoPlaceRecommendedResources}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition-all mt-1"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Auto-Deploy Missing Resources
                </button>
              </div>
            )}
          </div>

          {/* Handoff to Live Operations CTA */}
          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 space-y-3 shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Plan Ready
              </h3>
              <p className="text-[11px] text-foreground-muted mt-1">
                Spatial model complete with {assets.length} placed assets & H3 indexing.
              </p>
            </div>

            <button
              type="button"
              onClick={onCompleteAndEnterOperations}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
            >
              <Sparkles className="h-4 w-4" /> [ENTER LIVE OPERATIONS COMMAND CENTER]
            </button>
          </div>
        </div>
      </div>

      {/* H3 Hexagon Cell Inspector Modal */}
      <H3CellInspectorModal
        cellStats={selectedH3Cell}
        onClose={() => setSelectedH3Cell(null)}
      />
    </div>
  );
}
