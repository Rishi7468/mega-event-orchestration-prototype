"use client";

import { Bus, Clock, DoorOpen, Repeat } from "lucide-react";
import {
  InterventionCard,
  LineagePipeline,
  OutcomePanel,
  RecommendationPanel,
} from "@/components/operator";
import type { InterventionAvailability } from "@/components/operator";
import { venue, zones } from "@/data";
import {
  getGatesForPhase,
  getRoutesForPhase,
  getScenarioSnapshots,
  getZoneSnapshot,
  isRecovering,
} from "@/lib/conditions";
import { routeUtilizationPercent } from "@/lib/operator";
import {
  getOperatorRecommendation,
  getRedistributionImpact,
  getTimingRecommendation,
} from "@/lib/recommendation";
import { useSimulationStore } from "@/store/simulationStore";

export default function InterventionsPage() {
  const phase = useSimulationStore((state) => state.phase);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const approveResponse = useSimulationStore((state) => state.approveOperatorResponse);

  const gates = getGatesForPhase(phase);
  const routes = getRoutesForPhase(phase);
  const scenarioSnapshots = getScenarioSnapshots(phase);
  const recommendation = scenarioSnapshots ? getOperatorRecommendation(scenarioSnapshots) : null;
  const impact = scenarioSnapshots ? getRedistributionImpact(scenarioSnapshots) : null;
  const recovering = isRecovering(phase);

  // --- Constraint checks against real mock data (docs §14) ---
  const redirectAvailability: InterventionAvailability = impact
    ? { available: true, reason: "" }
    : {
        available: false,
        reason: "No zone is under enough pressure to warrant redistribution right now.",
      };

  const gateA = gates.find((g) => g.id === "gate-a");
  const gateB = gates.find((g) => g.id === "gate-b");
  const gateBFaster = Boolean(gateA && gateB && gateB.estimatedWaitMinutes < gateA.estimatedWaitMinutes);
  const promoteGateAvailability: InterventionAvailability = gateBFaster
    ? { available: true, reason: "" }
    : {
        available: false,
        reason: `${gateA && gateB && gateA.estimatedWaitMinutes <= gateB.estimatedWaitMinutes ? gateA.name : "Gate B"} already has the shorter queue — no promotion needed.`,
      };

  const routeS1 = routes.find((route) => route.id === "route-s1");
  const routeS3 = routes.find((route) => route.id === "route-s3");
  const s1Utilization = routeS1 ? routeUtilizationPercent(routeS1) : 0;
  const s3Utilization = routeS3 ? routeUtilizationPercent(routeS3) : 0;
  const shuttleAvailability: InterventionAvailability =
    s1Utilization >= 80 && s3Utilization < 70
      ? { available: true, reason: "" }
      : {
          available: false,
          reason:
            s1Utilization < 80
              ? "No shuttle route is near capacity right now."
              : `${routeS3?.name ?? "The alternate route"} is already near capacity — no spare capacity to shift toward.`,
        };

  const venueSnapshot = getZoneSnapshot(zoneSnapshots, venue.zoneId);
  const timing = venueSnapshot
    ? getTimingRecommendation(venueSnapshot)
    : { windowStart: "9:20 AM", windowEnd: "9:40 AM", reason: "" };
  const offPeakAvailability: InterventionAvailability =
    phase !== "normal"
      ? { available: true, reason: "" }
      : { available: false, reason: "Conditions are already normal — no advisory needed." };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Interventions</h1>
        <p className="text-xs text-foreground-muted">
          Simulated operational decisions — constrained by real capacity, never arbitrary
        </p>
      </div>

      <LineagePipeline activeStage={recovering ? "outcome" : "action"} />

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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <InterventionCard
            icon={Repeat}
            title="Redirect arrivals"
            description={
              impact
                ? `Move expected visitor flow from ${impact.pressuredZoneName} toward ${impact.spareZoneName}, which has spare accommodation and shuttle capacity.`
                : "Move expected visitor flow toward a zone with spare accommodation and shuttle capacity."
            }
            availability={redirectAvailability}
            actionLabel="Initiate"
          />
          <InterventionCard
            icon={DoorOpen}
            title="Promote Gate B"
            description="Recommend Gate B to incoming visitors ahead of Gate A, based on the current queue difference."
            availability={promoteGateAvailability}
            actionLabel="Initiate"
          />
          <InterventionCard
            icon={Bus}
            title="Adjust shuttle allocation"
            description={
              routeS1 && routeS3
                ? `Shift shuttle frequency from ${routeS1.name} (${s1Utilization}% utilized) toward ${routeS3.name} (${s3Utilization}% utilized).`
                : "Shift shuttle frequency toward the route with spare capacity."
            }
            availability={shuttleAvailability}
            actionLabel="Initiate"
          />
          <InterventionCard
            icon={Clock}
            title="Recommend off-peak arrival"
            description={`Encourage visitors to arrive ${timing.windowStart} – ${timing.windowEnd}, when projected crowd pressure is lower.`}
            availability={offPeakAvailability}
            actionLabel="Send advisory"
          />
        </div>

        <div className="space-y-4">
          <RecommendationPanel
            recommendation={recommendation}
            impact={impact}
            phase={phase}
            onApprove={approveResponse}
          />
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 text-sm font-semibold text-foreground">Human control</h2>
            <p className="text-xs leading-relaxed text-foreground-muted">
              The system recommends interventions from live conditions across {zones.length} zones. An
              organiser reviews and approves every action — nothing here dispatches automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
