"use client";

import Link from "next/link";
import {
  DestinationStatusBar,
  ForecastCard,
  LineagePipeline,
  OperatorPanel,
  OutcomePanel,
  AlertRow,
  RecommendationPanel,
  EventScheduleCard,
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
import { computeDestinationSummary } from "@/lib/operator";
import {
  getOperatorAlerts,
  getOperatorRecommendation,
  getRedistributionImpact,
  getUrgentForecast,
} from "@/lib/recommendation";
import { useSimulationStore } from "@/store/simulationStore";

export default function OperatorOverviewPage() {
  const phase = useSimulationStore((state) => state.phase);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const approveResponse = useSimulationStore((state) => state.approveOperatorResponse);

  const gates = getGatesForPhase(phase);
  const routes = getRoutesForPhase(phase);
  const cameras = getCamerasForPhase(phase);
  const alerts = getOperatorAlerts(zoneSnapshots, gates, routes);
  const summary = computeDestinationSummary(zoneSnapshots, alerts);
  const scenarioSnapshots = getScenarioSnapshots(phase);
  const recommendation = scenarioSnapshots ? getOperatorRecommendation(scenarioSnapshots) : null;
  const impact = scenarioSnapshots ? getRedistributionImpact(scenarioSnapshots) : null;
  const forecast = getUrgentForecast(zoneSnapshots);
  const recovering = isRecovering(phase);

  // Where the destination currently sits in the intelligence loop — the same
  // vocabulary the other operator screens use.
  const stage = recovering
    ? "outcome"
    : recommendation
      ? "recommended"
      : isElevated(phase)
        ? "forecast"
        : "observed";

  return (
    <div className="space-y-5">
      <DestinationStatusBar summary={summary} />
      <LineagePipeline activeStage={stage} />

      {/* The result of the approved action, on the same screen as the problem
          — an organiser should never have to navigate to find out whether
          what they approved worked. */}
      {recovering && impact && (
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
