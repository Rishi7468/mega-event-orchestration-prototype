"use client";

import {
  ForecastCard,
  LineagePipeline,
  OutcomePanel,
  RecommendationPanel,
} from "@/components/operator";
import { StatusBadge } from "@/components/shared";
import { accommodationZones, venueGatesElevated, zones } from "@/data";
import {
  getGatesForPhase,
  getRoutesForPhase,
  getScenarioSnapshots,
  isRecovering,
} from "@/lib/conditions";
import { formatVisitorCount, getZoneLiveVisitors, routeUtilizationPercent } from "@/lib/operator";
import {
  getOperatorRecommendation,
  getRedistributionImpact,
  predictZonePressure,
  pressureToRisk,
} from "@/lib/recommendation";
import { useSimulationStore } from "@/store/simulationStore";

export default function DemandCapacityPage() {
  const phase = useSimulationStore((state) => state.phase);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const approveResponse = useSimulationStore((state) => state.approveOperatorResponse);

  const gates = getGatesForPhase(phase);
  const routes = getRoutesForPhase(phase);
  const scenarioSnapshots = getScenarioSnapshots(phase);
  const recommendation = scenarioSnapshots ? getOperatorRecommendation(scenarioSnapshots) : null;
  const impact = scenarioSnapshots ? getRedistributionImpact(scenarioSnapshots) : null;
  const recovering = isRecovering(phase);

  // The "before" side of the outcome view is always the spike reading —
  // the worst point the destination reached this cycle — regardless of
  // which sub-phase (response/outcome) we're currently rendering.
  const gateA = gates.find((g) => g.id === "gate-a");
  const gateAElevated = venueGatesElevated.find((g) => g.id === "gate-a")?.estimatedWaitMinutes ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Destination-Wide Demand Distribution</h1>
        <p className="text-xs text-foreground-muted">
          Real-time demand, capacity and forecast across all zones — simulated scenario
        </p>
      </div>

      <LineagePipeline activeStage={recovering ? "outcome" : recommendation ? "recommended" : "forecast"} />

      {recovering && impact && gateA && (
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
              label: "Gate A wait",
              before: `${gateAElevated}m`,
              after: `${gateA.estimatedWaitMinutes}m`,
              positive: true,
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-foreground-muted">
                  <th className="px-4 py-3 font-medium">Zone</th>
                  <th className="px-4 py-3 font-medium">Visitors</th>
                  <th className="px-4 py-3 font-medium">Accommodation</th>
                  <th className="px-4 py-3 font-medium">Crowd</th>
                  <th className="px-4 py-3 font-medium">Transport</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => {
                  const snapshot = zoneSnapshots.find((item) => item.zoneId === zone.id);
                  const accommodation = accommodationZones.find((item) => item.zoneId === zone.id);
                  if (!snapshot || !accommodation) return null;
                  const availablePercent = Math.round(
                    (accommodation.availableRooms / accommodation.totalRooms) * 100,
                  );

                  return (
                    <tr key={zone.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{zone.name}</td>
                      <td className="px-4 py-3 tabular-nums text-foreground-muted">
                        {formatVisitorCount(getZoneLiveVisitors(zone.id, zoneSnapshots))}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-foreground-muted">
                        {snapshot.accommodationPressure}%{" "}
                        <span className="text-[11px]">({availablePercent}% free)</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-foreground-muted">
                        {snapshot.crowdPressure}%
                      </td>
                      <td className="px-4 py-3 tabular-nums text-foreground-muted">
                        {snapshot.transportUtilization}%
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge risk={pressureToRisk(snapshot.accommodationPressure)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Forecast (next 20 min) — {isRecovering(phase) ? "conditions easing" : "if nothing changes"}
            </h2>
            <div className="space-y-3">
              {zoneSnapshots.map((snapshot) => {
                const zone = zones.find((item) => item.id === snapshot.zoneId);
                return (
                  <div key={snapshot.zoneId}>
                    <p className="mb-1.5 text-xs font-medium text-foreground-muted">{zone?.name}</p>
                    <ForecastCard
                      forecast={{
                        zoneName: zone?.name ?? snapshot.zoneId,
                        current: snapshot,
                        plus10: predictZonePressure(snapshot, 10),
                        plus20: predictZonePressure(snapshot, 20),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Transport Capacity</h2>
            <div className="space-y-2.5">
              {routes.map((route) => {
                const utilization = routeUtilizationPercent(route);
                return (
                  <div key={route.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{route.name}</p>
                      <p className="text-[11px] text-foreground-muted">
                        {route.currentDemandPerHour.toLocaleString()} / {route.capacityPerHour.toLocaleString()} per hour
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {utilization}%
                      </span>
                      <StatusBadge risk={pressureToRisk(utilization)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <RecommendationPanel
            recommendation={recommendation}
            impact={impact}
            phase={phase}
            onApprove={approveResponse}
          />
        </div>
      </div>
    </div>
  );
}
