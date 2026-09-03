"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Clock, IndianRupee, MapPinned } from "lucide-react";
import { JourneyRouteMap } from "@/components/map";
import { AlertBanner, Button, Card, SectionHeading } from "@/components/shared";
import {
  DemoControls,
  LiveConditions,
  LiveEventCard,
  NextStepCard,
  VisitorPageHeader,
} from "@/components/visitor";
import { venue, zones } from "@/data";
import { getZoneSnapshot } from "@/lib/conditions";
import { useTripIntent } from "@/hooks/useTripIntent";
import { useVisitorJourney } from "@/hooks/useVisitorJourney";
import { useVisitorStore } from "@/store/visitorStore";

const zoneNames = Object.fromEntries(zones.map((zone) => [zone.id, zone.name]));

export default function LiveJourneyPage() {
  const router = useRouter();
  const { destination } = useTripIntent();
  const {
    journey,
    alternative,
    minutesSaved,
    journeyStarted,
    currentStepIndex,
    currentStep,
    remaining,
    zoneSnapshots,
    routes,
    reoptimizationAvailable,
    recommendedGate,
    recovering,
  } = useVisitorJourney();

  const advanceStep = useVisitorStore((state) => state.advanceStep);
  const setGate = useVisitorStore((state) => state.setGate);
  const keepOriginalPlan = useVisitorStore((state) => state.keepOriginalPlan);

  if (!journey) {
    return (
      <div>
        <VisitorPageHeader title="Live Journey" backHref="/visitor" />
        <Card className="p-5 text-center">
          <p className="text-sm text-foreground-muted">
            Once you&apos;ve built a plan, this screen guides you step by step.
          </p>
          <Link href="/visitor/plan">
            <Button className="mt-4 w-full">Plan my visit</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!journeyStarted) {
    return (
      <div>
        <VisitorPageHeader title="Live Journey" backHref="/visitor" />
        <Card className="p-5 text-center">
          <p className="text-sm text-foreground-muted">
            Your journey to {journey.gate.name} is ready. Start it when you set off and we&apos;ll
            guide you in real time.
          </p>
          <Link href="/visitor/plan/journey">
            <Button className="mt-4 w-full">Open journey plan</Button>
          </Link>
        </Card>
        <DemoControls />
      </div>
    );
  }

  const steps = journey.plan.journey;
  const isFinal = currentStepIndex >= steps.length - 1;
  // "Near the venue" = walking to the gate or queueing at it — the moment the
  // Live Event Card (wireframe 9) becomes relevant.
  const nearVenue = currentStep?.type === "walk" && currentStepIndex === 4;
  const showLiveEventCard =
    nearVenue && alternative !== null && recommendedGate.id !== journey.gate.id;

  const handleSwitchGate = () => setGate(recommendedGate.id);

  return (
    <div>
      <VisitorPageHeader
        title="Live Journey"
        subtitle={isFinal ? "You've arrived" : `Arriving ${journey.arrivalTime}`}
        backHref="/visitor"
      />

      <div className="space-y-4">
        {showLiveEventCard ? (
          <LiveEventCard
            currentGate={journey.gate}
            alternativeGate={recommendedGate}
            onSwitch={handleSwitchGate}
            onDismiss={keepOriginalPlan}
          />
        ) : reoptimizationAvailable ? (
          <AlertBanner
            title="Your plan can be improved"
            message={`Crowd levels near ${journey.gate.name} are rising. A faster option is available.`}
            action={
              <Button
                variant="secondary"
                className="h-10 w-full"
                onClick={() => router.push("/visitor/live/recommendation")}
              >
                View options
                <ChevronRight className="h-4 w-4" />
              </Button>
            }
          />
        ) : recovering && !isFinal ? (
          /* The organiser's approved intervention has eased conditions — the
             visitor sees the same world settling down, without being nagged. */
          <AlertBanner
            tone="positive"
            title="Conditions have stabilised"
            message={`Crowd and transport pressure are easing. ${journey.gate.name} is now about a ${journey.gate.estimatedWaitMinutes} min wait, arriving around ${journey.arrivalTime}.`}
          />
        ) : (
          <AlertBanner
            tone="positive"
            title={isFinal ? "You're at the venue" : "You're on track"}
            message={
              isFinal
                ? `Entered via ${journey.gate.name}. Enjoy the event.`
                : `Heading to ${journey.gate.name}, arriving around ${journey.arrivalTime}.`
            }
          />
        )}

        {currentStep && (
          <NextStepCard
            step={currentStep}
            isFinal={isFinal}
            onAdvance={() => advanceStep(steps.length)}
          />
        )}

        {destination && (
          <JourneyRouteMap
            destination={destination}
            steps={steps}
            currentStepIndex={currentStepIndex}
            routeId={journey.routeId}
            gate={journey.gate}
            routes={routes}
            snapshots={zoneSnapshots}
            zoneNames={zoneNames}
          />
        )}

        <div>
          <SectionHeading title="Live conditions" note="Updated just now" />
          <LiveConditions
            venueSnapshot={getZoneSnapshot(zoneSnapshots, venue.zoneId)}
            routeName={journey.routeName}
            routeReliabilityPercent={journey.reliabilityPercent}
            routeLoadPercent={journey.routeLoadPercent}
            gate={journey.gate}
          />
        </div>

        <Card className="p-4">
          <SectionHeading title="Your journey" />
          <div className="grid grid-cols-3 gap-2 border-b border-border pb-3">
            <div>
              <p className="flex items-center gap-1 text-[11px] text-foreground-muted">
                <Clock className="h-3 w-3" /> ETA
              </p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                {journey.arrivalTime}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-foreground-muted">
                <MapPinned className="h-3 w-3" /> Remaining
              </p>
              <p className="text-base font-semibold tabular-nums text-foreground">{remaining} min</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-foreground-muted">
                <IndianRupee className="h-3 w-3" /> Fare
              </p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                ₹{journey.farePerPerson}
              </p>
            </div>
          </div>

          <ol className="mt-3 space-y-2">
            {steps.map((step, index) => {
              const done = index < currentStepIndex;
              const active = index === currentStepIndex;
              return (
                <li key={step.id} className="flex items-center gap-2.5">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                      done
                        ? "border-risk-low bg-risk-low text-white"
                        : active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border text-foreground-muted"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : index + 1}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-xs ${
                      active ? "font-medium text-foreground" : "text-foreground-muted"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-foreground-muted">
                    {step.time}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>

        {minutesSaved > 0 && !reoptimizationAvailable && !showLiveEventCard && (
          <p className="text-center text-[11px] text-foreground-muted">
            Route updated — you&apos;re saving about {minutesSaved} min versus your original plan.
          </p>
        )}

        <DemoControls />
      </div>
    </div>
  );
}
