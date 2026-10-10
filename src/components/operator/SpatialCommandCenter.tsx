"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Activity,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import type { SelectedMapObject } from "@/components/map/SpatialCommandMap";
import { SelectedZonePanel } from "@/components/operator/SelectedZonePanel";
import { WhatIfSimulationModal } from "@/components/operator/WhatIfSimulationModal";
import { LiveOperatorRecommendations } from "@/components/operator/LiveOperatorRecommendations";
import { EventAuthoringModal } from "@/components/operator/EventAuthoringModal";
import { ScenarioControlPanel } from "@/components/operator/ScenarioControlPanel";
import { NonAppBroadcastPanel } from "@/components/operator/NonAppBroadcastPanel";
import { IncidentReviewPanel } from "@/components/operator/IncidentReviewPanel";
import { primaryGeography } from "@/data/geography";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { useSimulationStore } from "@/store/simulationStore";
import type { SituationAssessment } from "@/types";

const SpatialCommandMap = dynamic(
  () => import("@/components/map/SpatialCommandMap").then((mod) => mod.SpatialCommandMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[580px] w-full items-center justify-center rounded-2xl bg-[#0c0e12] border border-border text-xs text-foreground-muted animate-pulse">
        Initializing Real Geospatial Command Map...
      </div>
    ),
  },
);

type SpatialCommandCenterProps = {
  activeAssessment?: SituationAssessment | null;
  onApproveSituation?: (assessment: SituationAssessment) => void;
};

export function SpatialCommandCenter({
  activeAssessment,
  onApproveSituation,
}: SpatialCommandCenterProps) {
  const [selectedObject, setSelectedObject] = useState<SelectedMapObject>(null);
  const [isAuthoringOpen, setIsAuthoringOpen] = useState<boolean>(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [whatIfTargetZone, setWhatIfTargetZone] = useState<string | null>("central");

  const { eventName, expectedAttendance, zones: authoringZones } = useEventAuthoringStore();

  const phase = useSimulationStore((state) => state.phase);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const venueGates = useSimulationStore((state) => state.venueGates);
  const cameras = useSimulationStore((state) => state.cameras);
  const routes = useSimulationStore((state) => state.routes);
  const incidents = useSimulationStore((state) => state.incidents);
  const executeIntervention = useSimulationStore((state) => state.executeIntervention);
  const addFieldTask = useSimulationStore((state) => state.addFieldTask);
  const fieldTasks = useSimulationStore((state) => state.fieldTasks);

  // Selected Zone object lookup
  const selectedZoneId = selectedObject?.type === "zone" ? selectedObject.id : null;
  const selectedZoneDef = authoringZones.find((z) => z.id === selectedZoneId);
  const selectedZoneSnapshot = zoneSnapshots.find((s) => s.zoneId === selectedZoneId);

  const handleOpenWhatIf = (zoneId: string) => {
    setWhatIfTargetZone(zoneId);
    setIsWhatIfOpen(true);
  };

  const handleApplyWhatIfIntervention = (interventionId: string) => {
    if (activeAssessment && onApproveSituation) {
      onApproveSituation(activeAssessment);
    } else {
      executeIntervention(interventionId);
    }

    // Add field task dispatch if not duplicate
    const isDuplicate = fieldTasks.some((t) => t.title === "Promote Gate B & Redirect Inflow");
    if (!isDuplicate) {
      addFieldTask({
        title: "Promote Gate B & Redirect Inflow",
        assignedStaff: "Field Response Unit 01 (Sector 1)",
        zoneId: "central",
        gateId: "gate-b",
        type: "gate_control",
        priority: "high",
        status: "assigned",
        instruction: "Set up queue stanchions at Gate B and direct pedestrian arrivals away from Gate A.",
      });
    }
  };

  const isReplayMode = useSimulationStore((state) => state.isReplayMode);

  return (
    <div className="space-y-4">
      {/* Top Event Command Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">{eventName}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider font-mono ${
                isReplayMode
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
              }`}>
                {isReplayMode ? "[HISTORICAL REPLAY MODE]" : "[OPERATOR DISPATCH STATE]"}
              </span>
            </div>
            <p className="text-xs text-foreground-muted">
              Capacity: <span className="font-semibold text-foreground">{expectedAttendance.toLocaleString("en-US")}</span> visitors | Zones:{" "}
              <span className="font-semibold text-foreground">{authoringZones.length} Sectors</span> | Phase:{" "}
              <span className="font-mono uppercase font-bold text-accent">{phase}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAuthoringOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-muted/50 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent" /> Configure Event & Region
          </button>

          <button
            type="button"
            onClick={() => handleOpenWhatIf("central")}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-md shadow-accent/20 hover:bg-accent/90 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" /> &ldquo;What-If?&rdquo; Simulator
          </button>
        </div>
      </div>

      {/* Scenario Control Simulation Bar */}
      <ScenarioControlPanel />

      {/* PHASE 9 — LIVE OPERATOR RECOMMENDATIONS (DECISION SUPPORT LAYER) */}
      <LiveOperatorRecommendations onRunWhatIf={handleOpenWhatIf} />

      {/* Hero Spatial Map + Selected Zone Command Drawer Grid */}
      <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto]">
        {/* Dominant Real Geospatial Map */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
          <SpatialCommandMap
            geography={primaryGeography}
            zones={authoringZones}
            snapshots={zoneSnapshots}
            gates={venueGates}
            cameras={cameras}
            routes={routes}
            incidents={incidents}
            onSelectObject={(obj) => setSelectedObject(obj)}
            selectedObjectId={selectedZoneId}
            height={580}
          />
        </div>

        {/* Slide-out / Contextual Selected Zone Command Panel */}
        {selectedZoneDef && (
          <div className="xl:w-[380px]">
            <SelectedZonePanel
              zone={selectedZoneDef}
              snapshot={selectedZoneSnapshot}
              gates={venueGates}
              onClose={() => setSelectedObject(null)}
              onRunWhatIf={(zId) => handleOpenWhatIf(zId)}
              onApproveIntervention={() => handleApplyWhatIfIntervention("redirect-arrivals")}
            />
          </div>
        )}
      </div>

      {/* Live Operational Event Feed & Log */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {isReplayMode ? "Replay Timeline Milestones & Spatial Log" : "Live Command Feed & Spatial Log"}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            {isReplayMode ? "[CANONICAL REPLAY TIMELINE]" : "[OPERATOR DISPATCH LOG]"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
            <span className="text-[10px] text-foreground-muted font-mono block">14:00 IST (T+0s)</span>
            <span className="font-semibold text-foreground block mt-0.5">Baseline Inflow</span>
            <span className="text-[11px] text-emerald-400">1,200/min [SIMULATED] &lt; 4,200/min</span>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
            <span className="text-[10px] text-foreground-muted font-mono block">14:45 IST (T+150s)</span>
            <span className="font-semibold text-foreground block mt-0.5">Corridor Surge</span>
            <span className="text-[11px] text-amber-400">3,100/min [SIMULATED] approaching threshold</span>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
            <span className="text-[10px] text-foreground-muted font-mono block">15:15 IST (T+250s)</span>
            <span className="font-semibold text-foreground block mt-0.5">Threshold Rule Trigger</span>
            <span className="text-[11px] text-rose-400 font-bold">5,200/min &gt; 4,200/min Warning</span>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
            <span className="text-[10px] text-foreground-muted font-mono block">15:30 IST (T+300s)</span>
            <span className="font-semibold text-foreground block mt-0.5">Documented Milestone</span>
            <span className="text-[11px] text-accent">Perimeter Crush Record (Inquiry §8)</span>
          </div>
        </div>
      </div>

      {/* STAGE E — NON-APP EMERGENCY BROADCAST DISPATCH & CHANNEL COMPARISON */}
      <NonAppBroadcastPanel />

      {/* STAGE B — POST-INCIDENT AUDIT & INQUIRY REVIEW PANEL */}
      <IncidentReviewPanel />

      {/* Event Setup Modal */}
      <EventAuthoringModal isOpen={isAuthoringOpen} onClose={() => setIsAuthoringOpen(false)} />

      {/* What-If Simulation Modal */}
      <WhatIfSimulationModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        targetZoneId={whatIfTargetZone}
        onApplyIntervention={handleApplyWhatIfIntervention}
      />
    </div>
  );
}
