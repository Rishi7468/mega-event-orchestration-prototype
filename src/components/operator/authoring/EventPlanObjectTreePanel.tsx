import React, { useState } from "react";
import {
  Layers,
  MapPin,
  Route as RouteIcon,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  Focus,
} from "lucide-react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";

interface EventPlanObjectTreePanelProps {
  selectedObjectType?: string | null;
  selectedObjectId?: string | null;
  onSelectObject: (type: "asset" | "zone" | "route" | "paint" | "anchor" | "region" | null, id: string | null) => void;
}

export const EventPlanObjectTreePanel: React.FC<EventPlanObjectTreePanelProps> = ({
  selectedObjectType,
  selectedObjectId,
  onSelectObject,
}) => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    region: true,
    zones: true,
    anchors: true,
    routes: true,
    assets: true,
  });

  const regionPolygon = useEventAuthoringStore((state) => state.regionPolygon);
  const zones = useEventAuthoringStore((state) => state.zones);
  const anchors = useEventAuthoringStore((state) => state.anchors);
  const routes = useEventAuthoringStore((state) => state.routes);
  const assets = useEventAuthoringStore((state) => state.assets);
  const layerVisibility = useEventAuthoringStore((state) => state.layerVisibility);
  const toggleLayerVisibility = useEventAuthoringStore((state) => state.toggleLayerVisibility);

  const deleteZone = useEventAuthoringStore((state) => state.deleteZone);
  const deleteAnchor = useEventAuthoringStore((state) => state.deleteAnchor);
  const deleteRoute = useEventAuthoringStore((state) => state.deleteRoute);
  const deleteAsset = useEventAuthoringStore((state) => state.deleteAsset);

  const toggleSection = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredZones = zones.filter((z) => z.name.toLowerCase().includes(search.toLowerCase()) || z.code.toLowerCase().includes(search.toLowerCase()));
  const filteredAnchors = anchors.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRoutes = routes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const filteredAssets = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 text-slate-100 text-xs select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <Layers className="h-4 w-4 text-indigo-400" /> Plan Structure
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {zones.length + anchors.length + routes.length + assets.length} Objects
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Hierarchy List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* REGION SECTION */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div
            onClick={() => toggleSection("region")}
            className="flex items-center justify-between p-2 hover:bg-slate-800/50 cursor-pointer text-slate-300 font-bold"
          >
            <div className="flex items-center gap-1.5">
              {expanded.region ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Region Perimeter</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility("region");
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              {layerVisibility.region ? <Eye className="h-3.5 w-3.5 text-indigo-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {expanded.region && (
            <div
              onClick={() => onSelectObject("region", "main-perimeter")}
              className={`flex items-center justify-between pl-6 pr-2 py-1.5 text-[11px] cursor-pointer hover:bg-slate-800/60 ${
                selectedObjectType === "region" ? "bg-indigo-600/20 text-indigo-300 font-bold border-l-2 border-indigo-500" : "text-slate-400"
              }`}
            >
              <span>{regionPolygon.length > 0 ? `${regionPolygon.length} Point Polygon` : "Undefined Polygon"}</span>
              <Focus className="h-3 w-3 text-slate-500" />
            </div>
          )}
        </div>

        {/* ZONES SECTION */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div
            onClick={() => toggleSection("zones")}
            className="flex items-center justify-between p-2 hover:bg-slate-800/50 cursor-pointer text-slate-300 font-bold"
          >
            <div className="flex items-center gap-1.5">
              {expanded.zones ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Operational Zones ({filteredZones.length})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility("zones");
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              {layerVisibility.zones ? <Eye className="h-3.5 w-3.5 text-indigo-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {expanded.zones &&
            filteredZones.map((z) => {
              const isSelected = selectedObjectType === "zone" && selectedObjectId === z.id;
              return (
                <div
                  key={z.id}
                  onClick={() => onSelectObject("zone", z.id)}
                  className={`flex items-center justify-between pl-6 pr-2 py-1.5 text-[11px] cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-600/30 text-indigo-200 font-bold border-l-2 border-indigo-500" : "text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-[10px] text-indigo-400 font-bold mr-1">{z.code}</span>
                    {z.name}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 font-semibold">{z.capacity.toLocaleString()} cap</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteZone(z.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* ANCHORS SECTION */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div
            onClick={() => toggleSection("anchors")}
            className="flex items-center justify-between p-2 hover:bg-slate-800/50 cursor-pointer text-slate-300 font-bold"
          >
            <div className="flex items-center gap-1.5">
              {expanded.anchors ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Anchors & Gates ({filteredAnchors.length})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility("anchors");
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              {layerVisibility.anchors ? <Eye className="h-3.5 w-3.5 text-indigo-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {expanded.anchors &&
            filteredAnchors.map((a) => {
              const isSelected = selectedObjectType === "anchor" && selectedObjectId === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => onSelectObject("anchor", a.id)}
                  className={`flex items-center justify-between pl-6 pr-2 py-1.5 text-[11px] cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-600/30 text-indigo-200 font-bold border-l-2 border-indigo-500" : "text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{a.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnchor(a.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
        </div>

        {/* ROUTES SECTION */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div
            onClick={() => toggleSection("routes")}
            className="flex items-center justify-between p-2 hover:bg-slate-800/50 cursor-pointer text-slate-300 font-bold"
          >
            <div className="flex items-center gap-1.5">
              {expanded.routes ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Emergency Routes ({filteredRoutes.length})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility("routes");
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              {layerVisibility.routes ? <Eye className="h-3.5 w-3.5 text-indigo-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {expanded.routes &&
            filteredRoutes.map((r) => {
              const isSelected = selectedObjectType === "route" && selectedObjectId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectObject("route", r.id)}
                  className={`flex items-center justify-between pl-6 pr-2 py-1.5 text-[11px] cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-600/30 text-indigo-200 font-bold border-l-2 border-indigo-500" : "text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <RouteIcon className="h-3 w-3 text-rose-400 shrink-0" />
                    <span className="truncate">{r.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoute(r.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
        </div>

        {/* RESOURCES SECTION */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <div
            onClick={() => toggleSection("assets")}
            className="flex items-center justify-between p-2 hover:bg-slate-800/50 cursor-pointer text-slate-300 font-bold"
          >
            <div className="flex items-center gap-1.5">
              {expanded.assets ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <span>Resources & CCTV ({filteredAssets.length})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility("assets");
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              {layerVisibility.assets ? <Eye className="h-3.5 w-3.5 text-indigo-400" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {expanded.assets &&
            filteredAssets.map((asset) => {
              const isSelected = selectedObjectType === "asset" && selectedObjectId === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectObject("asset", asset.id)}
                  className={`flex items-center justify-between pl-6 pr-2 py-1.5 text-[11px] cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-600/30 text-indigo-200 font-bold border-l-2 border-indigo-500" : "text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <Shield className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{asset.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAsset(asset.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
