"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Lightbulb, TrendingUp } from "lucide-react";
import { Button, Card, Chip, StickyActions } from "@/components/shared";
import { PlanComparison, VisitorPageHeader } from "@/components/visitor";
import { venue } from "@/data";
import { getZoneSnapshot } from "@/lib/conditions";
import { predictZonePressure } from "@/lib/recommendation";
import { useVisitorJourney } from "@/hooks/useVisitorJourney";
import { useSimulationStore } from "@/store/simulationStore";
import { useVisitorStore } from "@/store/visitorStore";

export default function ReoptimizationPage() {
  const router = useRouter();
  const {
    journey,
    alternative,
    remaining,
    remainingIfSwitched,
    zoneSnapshots,
    recommendedGate,
    phase,
  } = useVisitorJourney();

  const setGate = useVisitorStore((state) => state.setGate);
  const keepOriginalPlan = useVisitorStore((state) => state.keepOriginalPlan);
  const acceptVisitorRecommendation = useSimulationStore(
    (state) => state.acceptVisitorRecommendation,
  );

  if (!journey || !alternative) {
    return (
      <div>
        <VisitorPageHeader title="Plan Update" backHref="/visitor/live" />
        <Card className="p-5 text-center">
          <p className="text-sm text-foreground-muted">
            Your current plan is still the best option — nothing to change right now.
          </p>
          <Link href="/visitor/live">
            <Button className="mt-4 w-full">Back to live journey</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const minutesSaved = remaining - remainingIfSwitched;
  const venueSnapshot = getZoneSnapshot(zoneSnapshots, venue.zoneId);
  const forecast = venueSnapshot ? predictZonePressure(venueSnapshot, 30) : null;

  const handleAccept = () => {
    setGate(recommendedGate.id);
    // Keeps the shared simulation in step with the visitor's decision so the
    // operator view (Phase 3) can attribute the demand shift.
    if (phase === "recommendation") acceptVisitorRecommendation();
    router.push("/visitor/live");
  };

  const handleKeep = () => {
    keepOriginalPlan();
    router.push("/visitor/live");
  };

  return (
    <div>
      <VisitorPageHeader
        title="Plan Update"
        subtitle="Real-time route improvement"
        backHref="/visitor/live"
      />

      <div className="space-y-4">
        <Card className="animate-fade-up p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted">
              <TrendingUp className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-tight text-foreground">
                Your plan can be improved
              </h2>
              <p className="mt-1 text-sm leading-snug text-foreground-muted">
                A crowd surge has been detected near {journey.gate.name}. Queues there are growing
                faster than expected.
              </p>
            </div>
          </div>
        </Card>

        {/* Prediction — what happens if nothing changes (docs/02 §5). */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Activity className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">What&apos;s happening</p>
              <p className="mt-1 text-sm leading-snug text-foreground-muted">
                {journey.gate.name} is holding about {journey.gate.currentQueue.toLocaleString()}{" "}
                people, roughly a {journey.gate.estimatedWaitMinutes} minute wait.
                {forecast
                  ? forecast.crowdPressure >= 100
                    ? " If nothing changes, the area around the venue is projected to reach full capacity within 30 minutes."
                    : ` If nothing changes, crowd pressure around the venue is projected to reach about ${forecast.crowdPressure}% within 30 minutes.`
                  : ""}
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Choose the best way forward</h2>
          <PlanComparison
            current={journey}
            alternative={alternative}
            currentRemaining={remaining}
            alternativeRemaining={remainingIfSwitched}
          />
        </div>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Why we changed this</p>
                <Chip tone="positive">High confidence</Chip>
              </div>
              <p className="mt-1.5 text-sm leading-snug text-foreground-muted">
                {recommendedGate.name} currently has a {recommendedGate.estimatedWaitMinutes} minute
                queue against {journey.gate.estimatedWaitMinutes} minutes at {journey.gate.name}, and
                it&apos;s the same walk from your drop-off point. Switching gets you in about{" "}
                {minutesSaved} minutes sooner, and eases pressure on the busier gate.
              </p>
            </div>
          </div>
        </Card>

        <p className="text-center text-[11px] text-foreground-muted">
          Based on simulated live crowd and gate data.
        </p>
      </div>

      <StickyActions>
        <Button className="w-full" onClick={handleAccept}>
          Update My Route
        </Button>
        <button
          type="button"
          onClick={handleKeep}
          className="mt-2 h-11 w-full rounded-xl border border-border text-sm font-medium text-foreground"
        >
          Keep Current Plan
        </button>
      </StickyActions>
    </div>
  );
}
