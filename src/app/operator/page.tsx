"use client";

import Link from "next/link";
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
import type { SituationAssessment } from "@/types";

export default function OperatorOverviewPage() {
  const phase = useSimulationStore((state) => state.phase);
  const activeEventConfigId = useSimulationStore((state) => state.activeEventConfigId);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const incidents = useSimulationStore((state) => state.incidents);
  const measurements = useSimulationStore((state) => state.measurements);
  const approveResponse = useSimulationStore((state) => state.approveOperatorResponse);
  const fieldTasks = useSimulationStore((state) => state.fieldTasks);
  const addFieldTask = useSimulationStore((state) => state.addFieldTask);

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

    // 1. Trigger store intervention approval
    approveResponse();

    // 2. Dispatch tactical field task (Prevent duplicates)
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

  const stage = recovering
    ? "outcome"
    : recommendation || activeAssessment
      ? "recommended"
      : isElevated(phase)
        ? "forecast"
        : "observed";

  return (
    <div className="space-y-5">
      {/* Event Scenario Simulation Controller */}
      <ScenarioControlPanel />

      {/* System-Wide Intelligence Pulse */}
      <EventPulseCard pulse={pulse} />

      <DestinationStatusBar summary={summary} />
      <LineagePipeline activeStage={stage} />

      {/* Primary Situational Intelligence Panel */}
      {activeAssessment && (
        <SituationalIntelligencePanel
          assessment={activeAssessment}
          onApprove={handleApproveSituation}
          onDismiss={(id) => setDismissedSituationId(id)}
          isProcessing={isProcessingApproval}
        />
      )}

      {/* BEFORE -> ACTION -> AFTER -> DELTA Measurement Result Card */}
      {(recovering || phase === "outcome" || latestMeasurement) && latestMeasurement && (
        <BeforeAfterDeltaCard
          measurement={latestMeasurement}
          actionTitle={activeAssessment?.recommendedAction?.label ?? "Redirect Central Arrivals to Gate B"}
        />
      )}

      {/* Legacy Redistribution Impact Panel if available */}
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
  );
}
