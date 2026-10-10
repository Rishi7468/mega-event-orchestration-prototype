"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  AlertRow,
  BeforeAfterDeltaCard,
  DestinationStatusBar,
  EventPulseCard,
  EventScheduleCard,
  ForecastCard,
  IncidentPanel,
  LineagePipeline,
  OperatorPanel,
  OutcomePanel,
  RecommendationPanel,
  ScenarioControlPanel,
  SituationalIntelligencePanel,
} from "@/components/operator";
import { SpatialCommandCenter } from "@/components/operator/SpatialCommandCenter";
import { EventPlanningWizard } from "@/components/operator/EventPlanningWizard";
import { CameraFeedCard } from "@/components/camera";
import { OperatorDestinationMap } from "@/components/map";
import { PressureBar } from "@/components/shared";
import { event, primaryDestination, zones } from "@/data";
import {
  getCamerasForPhase,
  getGatesForPhase,
  getRoutesForPhase,
  getScenarioSnapshots,
  isElevated,
  isRecovering,
} from "@/lib/conditions";
import { evaluateSituationalIntelligence } from "@/lib/intelligence/ruleEngine";
import { computeDestinationSummary } from "@/lib/operator";
import {
  getOperatorAlerts,
  getOperatorRecommendation,
  getRedistributionImpact,
  getUrgentForecast,
} from "@/lib/recommendation";
import { useSimulationStore } from "@/store/simulationStore";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import type { SituationAssessment } from "@/types";
import { Compass, LayoutGrid, SlidersHorizontal, Zap, Radio, MapPin } from "lucide-react";

// Dynamically import Map-First Spatial Event Builder Rework with SSR disabled
const SpatialEventBuilder = dynamic(
  () => import("@/components/operator/SpatialEventBuilderRework").then((mod) => mod.SpatialEventBuilderRework),
  { ssr: false },
);

export default function OperatorOverviewPage() {
  const phase = useSimulationStore((state) => state.phase);
  const activeEventConfigId = useSimulationStore((state) => state.activeEventConfigId);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const incidents = useSimulationStore((state) => state.incidents);
  const measurements = useSimulationStore((state) => state.measurements);
  const approveResponse = useSimulationStore((state) => state.approveOperatorResponse);
  const fieldTasks = useSimulationStore((state) => state.fieldTasks);
  const addFieldTask = useSimulationStore((state) => state.addFieldTask);

  const loadPreset = useEventAuthoringStore((state) => state.loadPreset);
  const isRegionDefined = useEventAuthoringStore((state) => state.isRegionDefined);
  const authoringZones = useEventAuthoringStore((state) => state.zones);
  const activeEventMode = useEventAuthoringStore((state) => state.activeEventMode);

  const [journeyMode, setJourneyMode] = useState<"operations" | "builder" | "wizard">("operations");
  const [viewMode, setViewMode] = useState<"spatial" | "classic">("spatial");
  const [dismissedSituationId, setDismissedSituationId] = useState<string | null>(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);

  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
  const gates = getGatesForPhase(phase);
  const routes = getRoutesForPhase(phase);
  const cameras = getCamerasForPhase(phase);
  const alerts = getOperatorAlerts(zoneSnapshots, gates, routes, incidents);
  const summary = computeDestinationSummary(zoneSnapshots, alerts);
  const scenarioSnapshots = getScenarioSnapshots(phase);
  const recommendation = scenarioSnapshots ? getOperatorRecommendation(scenarioSnapshots, latestMeasurement) : null;
  const impact = scenarioSnapshots ? getRedistributionImpact(scenarioSnapshots, latestMeasurement) : null;
  const forecast = getUrgentForecast(zoneSnapshots);
  const recovering = isRecovering(phase);

  // Evaluate Deterministic Situational Intelligence
  const { assessments, pulse } = evaluateSituationalIntelligence(
    phase,
    zoneSnapshots,
    gates,
    routes,
    incidents,
    activeEventConfigId,
  );

  const activeAssessment = assessments.find((a) => a.id !== dismissedSituationId) ?? null;

  const handleApproveSituation = (assessment: SituationAssessment) => {
    if (isProcessingApproval) return;
    setIsProcessingApproval(true);

    approveResponse();

    if (assessment.recommendedAction) {
      const isDuplicate = fieldTasks.some(
        (t) => t.title === assessment.recommendedAction?.label && t.zoneId === assessment.zoneId,
      );

      if (!isDuplicate) {
        addFieldTask({
          title: assessment.recommendedAction.label,
          assignedStaff: "Officer Ramesh (Sector 1)",
          zoneId: assessment.zoneId,
          gateId: "gate-b",
          type: "gate_control",
          priority: assessment.severity === "CRITICAL" ? "critical" : "high",
          status: "assigned",
          instruction: `${assessment.recommendedAction.rationale} Target: ${assessment.recommendedAction.target}.`,
        });
      }
    }

    setTimeout(() => {
      setIsProcessingApproval(false);
    }, 600);
  };

  const handleFastDemoPreset = () => {
    loadPreset("preset-maha-kumbh");
    setJourneyMode("operations");
    setViewMode("spatial");
  };

  const stage = recovering
    ? "outcome"
    : recommendation || activeAssessment
      ? "recommended"
      : isElevated(phase)
        ? "forecast"
        : "observed";

  return (
    <div className="space-y-5">
      {/* Primary Operational Journey Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Journey Mode:
          </span>
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface-muted/50 p-1">
            <button
              type="button"
              onClick={() => setJourneyMode("operations")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                journeyMode === "operations"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Radio className="h-3.5 w-3.5" /> 📡 Mahakumbh Command Center
            </button>

            <button
              type="button"
              onClick={() => setJourneyMode("builder")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                journeyMode === "builder"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" /> 🛠️ Mahakumbh Event Zone Builder
            </button>

            <button
              type="button"
              onClick={() => setJourneyMode("wizard")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                journeyMode === "wizard"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> 🎯 Wizard Setup
            </button>
          </div>
        </div>

        {/* Fast Hackathon Demo Shortcut */}
        <div className="flex items-center gap-2">
          {journeyMode === "operations" && (
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted/50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("spatial")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "spatial"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <Compass className="h-3.5 w-3.5" /> Spatial Map
              </button>

              <button
                type="button"
                onClick={() => setViewMode("classic")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === "classic"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Classic View
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleFastDemoPreset}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all shadow-xs"
            title="Instant 30-sec demo mode loading preconfigured Maha Kumbh preset"
          >
            <Zap className="h-3.5 w-3.5 fill-amber-400" /> Fast Demo Mode
          </button>
        </div>
      </div>

      {/* JOURNEY 1: MAP-FIRST SPATIAL EVENT BUILDER */}
      {journeyMode === "builder" ? (
        <SpatialEventBuilder
          onCompleteAndEnterOperations={() => {
            setJourneyMode("operations");
            setViewMode("spatial");
          }}
        />
      ) : journeyMode === "wizard" ? (
        /* JOURNEY 2: EVENT PLANNING WIZARD */
        <EventPlanningWizard
          onCompleteAndEnterOperations={() => {
            setJourneyMode("operations");
            setViewMode("spatial");
          }}
        />
      ) : !isRegionDefined && authoringZones.length === 0 && activeEventMode !== "demo" ? (
        /* EVENT PLAN INCOMPLETE SCREEN — ZERO SILENT FALLBACK */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-500/30 bg-surface/95 p-12 text-center shadow-lg backdrop-blur-md space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-inner">
            <Radio className="h-10 w-10 animate-pulse" />
          </div>

          <div className="max-w-md space-y-2">
            <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Event Plan Incomplete
            </span>
            <h2 className="text-2xl font-black text-foreground font-mono">No Active Spatial Perimeter</h2>
            <p className="text-xs text-foreground-muted leading-relaxed font-mono">
              Live Operations Center cannot start without a spatial event boundary and partitioned operational zones. No default demo fallback is active.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setJourneyMode("builder")}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-md hover:brightness-110 transition-all font-mono"
            >
              <MapPin className="h-4 w-4" /> [ 🛠️ BUILD EVENT FROM SCRATCH ]
            </button>
            <button
              type="button"
              onClick={() => setJourneyMode("wizard")}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-5 py-2.5 text-xs font-bold text-foreground hover:bg-surface transition-all font-mono"
            >
              <SlidersHorizontal className="h-4 w-4" /> [ 🎯 LAUNCH WIZARD SETUP ]
            </button>
            <button
              type="button"
              onClick={handleFastDemoPreset}
              className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all font-mono"
            >
              <Zap className="h-4 w-4" /> [ ⚡ LOAD MAHA KUMBH DEMO ]
            </button>
          </div>
        </div>
      ) : (
        /* JOURNEY 3: LIVE OPERATIONS CENTER */
        <div className="space-y-5">
          {viewMode === "spatial" ? (
            <SpatialCommandCenter
              activeAssessment={activeAssessment}
              onApproveSituation={handleApproveSituation}
            />
          ) : (
            /* CLASSIC ANALYTICS VIEW */
            <div className="space-y-5">
              <ScenarioControlPanel />
              <EventPulseCard pulse={pulse} />
              <DestinationStatusBar summary={summary} />
              <LineagePipeline activeStage={stage} />

              {activeAssessment && (
                <SituationalIntelligencePanel
                  assessment={activeAssessment}
                  onApprove={handleApproveSituation}
                  onDismiss={(id) => setDismissedSituationId(id)}
                  isProcessing={isProcessingApproval}
                />
              )}

              {(recovering || phase === "outcome" || latestMeasurement) && latestMeasurement && (
                <BeforeAfterDeltaCard
                  measurement={latestMeasurement}
                  actionTitle={activeAssessment?.recommendedAction?.label ?? "Redirect Central Arrivals to Gate B"}
                />
              )}

              {recovering && impact && !latestMeasurement && (
                <OutcomePanel
                  rows={[
                    {
                      label: `${impact.pressuredZoneName} pressure`,
                      before: `${impact.pressuredBefore}%`,
                      after: `${impact.pressuredAfter}%`,
                      positive: true,
                    },
                    {
                      label: `${impact.spareZoneName} pressure`,
                      before: `${impact.spareBefore}%`,
                      after: `${impact.spareAfter}%`,
                      positive: false,
                    },
                    {
                      label: "Transport utilization",
                      before: `${impact.transportBefore}%`,
                      after: `${impact.transportAfter}%`,
                      positive: true,
                    },
                  ]}
                />
              )}

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <OperatorDestinationMap
                    destination={primaryDestination}
                    zones={zones}
                    snapshots={zoneSnapshots}
                    gates={gates}
                    cameras={cameras}
                    routes={routes}
                  />
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Accommodation Pressure</h2>
                    <div className="space-y-3">
                      {zoneSnapshots.map((snapshot) => {
                        const zone = zones.find((item) => item.id === snapshot.zoneId);
                        return (
                          <PressureBar
                            key={snapshot.zoneId}
                            label={zone?.name ?? snapshot.zoneId}
                            percent={snapshot.accommodationPressure}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <OperatorPanel
                    title={`Live Alerts (${alerts.length})`}
                    action={
                      <Link href="/operator/crowd" className="text-xs font-medium text-foreground-muted">
                        View all
                      </Link>
                    }
                  >
                    <div className="space-y-1">
                      {alerts.map((alert) => (
                        <AlertRow key={alert.id} alert={alert} />
                      ))}
                    </div>
                  </OperatorPanel>

                  {forecast && <ForecastCard forecast={forecast} compact />}

                  <RecommendationPanel
                    recommendation={recommendation}
                    impact={impact}
                    phase={phase}
                    onApprove={approveResponse}
                  />

                  <IncidentPanel />
                  <EventScheduleCard schedule={event.schedule} compact />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Live Camera Feeds</h2>
                  <Link href="/operator/crowd" className="text-xs font-medium text-foreground-muted">
                    View All Cameras
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {cameras.map((camera) => (
                    <CameraFeedCard key={camera.id} camera={camera} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
