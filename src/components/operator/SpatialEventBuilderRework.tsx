"use client";

import { useState, useEffect } from "react";
import { SpatialEventBuilderMap } from "@/components/map/SpatialEventBuilderMap";
import { CompactToolbar, type AuthoringTool } from "@/components/operator/authoring/CompactToolbar";
import { GeoJSONImportExportModal } from "@/components/operator/authoring/GeoJSONImportExportModal";
import { H3CellInspectorModal } from "@/components/operator/H3CellInspectorModal";
import { SmartOnboardingModal } from "@/components/operator/authoring/SmartOnboardingModal";
import { ZoneConfigModal } from "@/components/operator/authoring/ZoneConfigModal";
import { ResetEventPlanModal } from "@/components/operator/authoring/ResetEventPlanModal";
import { WhatsMissingModal } from "@/components/operator/authoring/WhatsMissingModal";
import { RegionConfirmationBanner } from "@/components/operator/authoring/RegionConfirmationBanner";
import { FootageAnalysisDrawer } from "@/components/operator/authoring/FootageAnalysisDrawer";
import { SourceRegistryPanel } from "@/components/operator/authoring/SourceRegistryPanel";
import { RightContextPanel, type RightPanelTab } from "@/components/operator/authoring/RightContextPanel";
import { EventPlanningQuestionnaireModal } from "@/components/operator/authoring/EventPlanningQuestionnaireModal";

import {
  useEventAuthoringStore,
  type AssetType,
  type RouteType,
  type EventType,
} from "@/store/eventAuthoringStore";
import type { RouteAuthoringMode } from "@/types/eventPlan";
import { GeocodingService } from "@/lib/spatial/geocodingService";
import type { H3CellStats } from "@/lib/spatial/h3Grid";
import {
  Search,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Plus,
} from "lucide-react";

type SpatialEventBuilderReworkProps = {
  onCompleteAndEnterOperations: () => void;
};

export function SpatialEventBuilderRework({
  onCompleteAndEnterOperations,
}: SpatialEventBuilderReworkProps) {
  const [activeTool, setActiveTool] = useState<AuthoringTool>("select");
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>("cctv");
  const [selectedRouteType, setSelectedRouteType] = useState<RouteType>("emergency");
  const [measureMode, setMeasureMode] = useState<"distance" | "area" | "radius">("distance");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showGeoJSONModal, setShowGeoJSONModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState<boolean>(false);
  const [showZoneConfigModal, setShowZoneConfigModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showWhatsMissingModal, setShowWhatsMissingModal] = useState<boolean>(false);
  const [showFootageDrawer, setShowFootageDrawer] = useState<boolean>(false);
  const [showSourceRegistry, setShowSourceRegistry] = useState<boolean>(false);
  const [fixNotification] = useState<string | null>(null);

  const [selectedRouteMode, setSelectedRouteMode] = useState<RouteAuthoringMode>("network");
  const [selectedObjectType, setSelectedObjectType] = useState<"asset" | "zone" | "route" | "paint" | "anchor" | "region" | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedH3Cell, setSelectedH3Cell] = useState<H3CellStats | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("structure");

  // Store state bindings
  const {
    activeEventMode,
    commandMode,
    eventName,
    expectedAttendance,
    eventDurationHours,
    locationName,
    setCommandMode,
    setCenterCoordinates,
    createEventWithTemplate,
    startNewBlankEvent,
    addZone,
    tickSimulation,
  } = useEventAuthoringStore();

  // Run live Digital Twin simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      tickSimulation();
    }, 1500);
    return () => clearInterval(timer);
  }, [tickSimulation]);

  // Geocoding Search Submit
  const handleSearchLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = GeocodingService.search(searchQuery);
    if (result) {
      setCenterCoordinates(result.center, result.name);
    }
  };

  // "Show Me What To Fix" / Whats Missing Handler
  const handleShowMeWhatToFix = () => {
    setShowWhatsMissingModal(true);
  };

  const handleStartOnboardingEvent = (params: {
    eventType: EventType;
    eventName: string;
    locationName: string;
    center: [number, number];
    useRecommendedPlan: boolean;
    attendance: number;
    durationHours: number;
  }) => {
    createEventWithTemplate(params);
  };

  const handleStepClick = (mode: "build" | "plan" | "simulate" | "operate") => {
    setCommandMode(mode);
    if (mode === "build") {
      setRightPanelTab("structure");
    } else if (mode === "plan") {
      setRightPanelTab("presets");
    } else if (mode === "simulate") {
      setRightPanelTab("twin");
    } else if (mode === "operate") {
      onCompleteAndEnterOperations();
    }
  };

  return (
    <div className="h-[calc(100dvh-6.5rem)] flex flex-col overflow-hidden font-sans space-y-2 p-1">
      {/* 1. COMPACT COMMAND CENTER HEADER BAR */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/95 px-3 py-2 shadow-md shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-black text-sm">
            🛰️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-black tracking-tight text-slate-100 uppercase truncate">
                MAHAKUMBH EVENT ZONE BUILDER
              </h1>
              <span
                className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${
                  activeEventMode === "new"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : activeEventMode === "template"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      : "border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
                }`}
              >
                {activeEventMode === "new" && "✦ CUSTOM"}
                {activeEventMode === "template" && "📋 TEMPLATE"}
                {activeEventMode === "demo" && "⚡ DEMO"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {eventName} • {locationName} • ~{expectedAttendance.toLocaleString()} pax
            </p>
          </div>
        </div>

        {/* Location Quick Search Form */}
        <form onSubmit={handleSearchLocation} className="relative flex-1 max-w-sm flex items-center min-w-[200px]">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search e.g. Marine Drive, Manipur..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-14 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1 rounded bg-indigo-600 px-2 py-0.5 font-bold text-white text-[10px] hover:bg-indigo-500 transition-colors"
          >
            GO
          </button>
        </form>

        {/* Workflow Stepper & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {(["build", "plan", "simulate", "operate"] as const).map((mode, idx) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleStepClick(mode)}
                className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase transition-all ${
                  commandMode === mode
                    ? "bg-indigo-600 text-white font-black shadow-md"
                    : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {idx + 1}. {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => startNewBlankEvent({ name: "New Event Plan", center: [25.4321, 81.8765] })}
            className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
            title="Start a fresh, empty workspace with zero pre-existing objects"
          >
            <Plus className="h-3 w-3 text-emerald-400" />
            <span>NEW PLAN</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>TEMPLATE</span>
          </button>

          <button
            type="button"
            onClick={onCompleteAndEnterOperations}
            className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-[10px] font-black text-slate-950 hover:bg-emerald-400 shadow transition-all"
          >
            <span>LIVE OPS</span> <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER: DOMINANT MAP (LEFT) + RIGHT CONTEXT PANEL */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2 overflow-hidden">
        {/* DOMINANT MAP CANVAS AREA */}
        <div className="flex-1 h-full min-h-0 flex flex-col relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          {/* Region-First Gatekeeper Banner */}
          <div className="shrink-0 p-1 bg-slate-900/60 border-b border-slate-800">
            <RegionConfirmationBanner onEditRegion={() => setActiveTool("region")} />
          </div>

          {/* Compact Spatial Tools Bar */}
          <div className="shrink-0 p-1 bg-slate-950/80 border-b border-slate-800/80">
            <CompactToolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              selectedAssetType={selectedAssetType}
              setSelectedAssetType={setSelectedAssetType}
              selectedRouteType={selectedRouteType}
              setSelectedRouteType={setSelectedRouteType}
              selectedRouteMode={selectedRouteMode}
              setSelectedRouteMode={setSelectedRouteMode}
              measureMode={measureMode}
              setMeasureMode={setMeasureMode}
              onOpenGeoJSON={() => setShowGeoJSONModal(true)}
              onOpenResetModal={() => setShowResetModal(true)}
              onOpenWhatsMissingModal={() => setShowWhatsMissingModal(true)}
            />
          </div>

          {/* Full-Height Interactive Leaflet Map & Design Canvas */}
          <div className="flex-1 min-h-0 w-full relative">
            <SpatialEventBuilderMap
              activeTool={activeTool}
              selectedAssetType={selectedAssetType}
              selectedRouteType={selectedRouteType}
              selectedRouteMode={selectedRouteMode}
              measureMode={measureMode}
              showH3GridOverlay={commandMode === "simulate" || activeTool === "h3"}
              selectedObjectType={selectedObjectType}
              selectedObjectId={selectedObjectId}
              onToolComplete={(tool) => setActiveTool(tool as any)}
              onSelectObject={(type, id) => {
                setSelectedObjectType(type);
                setSelectedObjectId(id);
                if (type && id) {
                  if (type !== "paint" && type !== "region") {
                    useEventAuthoringStore.getState().setSelectedObject(id, type as any);
                  }
                  setRightPanelTab("inspector");
                }
              }}
              onSelectH3Cell={(cell) => setSelectedH3Cell(cell)}
            />

            {/* Notification Toast Banner */}
            {fixNotification && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-emerald-400 shadow-2xl animate-in fade-in">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{fixNotification}</span>
              </div>
            )}
          </div>
        </div>

        {/* UNIFIED CONTEXTUAL RIGHT PANEL */}
        <div className="w-full lg:w-80 xl:w-96 h-full flex flex-col min-h-0 shrink-0 rounded-xl border border-slate-800 bg-slate-900 overflow-y-auto">
          <RightContextPanel
            activeTab={rightPanelTab}
            setActiveTab={setRightPanelTab}
            selectedObjectType={selectedObjectType as any}
            selectedObjectId={selectedObjectId}
            onOpenQuestionnaire={() => setShowQuestionnaireModal(true)}
            onOpenWhatsMissingModal={() => setShowWhatsMissingModal(true)}
            onOpenFootageDrawer={() => setShowFootageDrawer(true)}
            onOpenSourceRegistry={() => setShowSourceRegistry(true)}
          />
        </div>
      </div>

      {/* Footage Analysis Drawer */}
      <FootageAnalysisDrawer
        isOpen={showFootageDrawer}
        onClose={() => setShowFootageDrawer(false)}
      />

      {/* Data Source Registry Panel */}
      <SourceRegistryPanel
        isOpen={showSourceRegistry}
        onClose={() => setShowSourceRegistry(false)}
      />

      {/* Smart Onboarding / Template Selection Modal */}
      <SmartOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onStartEvent={handleStartOnboardingEvent}
      />

      {/* Zone Configuration Modal */}
      <ZoneConfigModal
        isOpen={showZoneConfigModal}
        onClose={() => setShowZoneConfigModal(false)}
        onSave={(newZoneData) => {
          addZone(newZoneData);
          setShowZoneConfigModal(false);
        }}
      />

      {/* Reset Event Plan Modal */}
      <ResetEventPlanModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />

      {/* What's Missing Analysis Modal */}
      <WhatsMissingModal
        isOpen={showWhatsMissingModal}
        onClose={() => setShowWhatsMissingModal(false)}
      />

      {/* GeoJSON Import/Export Modal */}
      <GeoJSONImportExportModal
        isOpen={showGeoJSONModal}
        onClose={() => setShowGeoJSONModal(false)}
      />

      {/* Operational Questionnaire Modal */}
      <EventPlanningQuestionnaireModal
        isOpen={showQuestionnaireModal}
        onClose={() => setShowQuestionnaireModal(false)}
        onGeneratePlan={() => setShowQuestionnaireModal(false)}
      />

      {/* H3 Cell Inspector Modal */}
      {selectedH3Cell && (
        <H3CellInspectorModal
          cellStats={selectedH3Cell}
          onClose={() => setSelectedH3Cell(null)}
        />
      )}
    </div>
  );
}
