"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  Clock,
  DoorOpen,
  IndianRupee,
  Play,
  Plane,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button, Card, Chip, SectionHeading, StickyActions } from "@/components/shared";
import { JourneyTimeline, VisitorPageHeader } from "@/components/visitor";
import { useTripIntent } from "@/hooks/useTripIntent";
import { useVisitorJourney } from "@/hooks/useVisitorJourney";
import { useVisitorStore } from "@/store/visitorStore";

const congestionLabel = { low: "Light", medium: "Moderate", high: "Heavy" } as const;

export default function JourneyPlannerPage() {
  const router = useRouter();
  const { journey, journeyStarted } = useVisitorJourney();
  const { origin, destination, inboundLeg } = useTripIntent();
  const startJourney = useVisitorStore((state) => state.startJourney);

  if (!journey) {
    return (
      <div>
        <VisitorPageHeader title="My Journey" backHref="/visitor" />
        <Card className="p-5 text-center">
          <p className="text-sm text-foreground-muted">
            Pick where you&apos;re staying first and we&apos;ll build the full journey around it.
          </p>
          <Link href="/visitor/plan">
            <Button className="mt-4 w-full">Choose where to stay</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleStart = () => {
    startJourney(journey.departureTime, journey.gate.id);
    router.push("/visitor/live");
  };

  return (
    <div>
      <VisitorPageHeader
        title="My Journey to Venue"
        subtitle={`${journey.propertyName} → ${journey.gate.name}`}
        backHref={`/visitor/plan/stay/${journey.zoneId}`}
      />

      <div className="space-y-5">
        {/* Getting to the destination city — the inbound leg, kept visually
            separate from the local door-to-venue journey below. */}
        {inboundLeg && origin && destination && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                <Plane className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground-muted">Getting there</p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {origin.city} → {destination.city}
                </p>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  {inboundLeg.mode} · {inboundLeg.durationLabel} — {inboundLeg.note}
                </p>
              </div>
            </div>
          </Card>
        )}

        <SectionHeading
          title={destination ? `Once you're in ${destination.city}` : "Your local journey"}
        />

        <Card className="grid grid-cols-4 gap-2 p-4">
          <div>
            <Clock className="h-3.5 w-3.5 text-foreground-muted" />
            <p className="mt-1.5 text-[11px] text-foreground-muted">Duration</p>
            <p className="text-sm font-semibold text-foreground">{journey.totalMinutes} min</p>
          </div>
          <div>
            <IndianRupee className="h-3.5 w-3.5 text-foreground-muted" />
            <p className="mt-1.5 text-[11px] text-foreground-muted">Cost</p>
            <p className="text-sm font-semibold text-foreground">₹{journey.farePerPerson}</p>
          </div>
          <div>
            <Users className="h-3.5 w-3.5 text-foreground-muted" />
            <p className="mt-1.5 text-[11px] text-foreground-muted">Crowd</p>
            <p className="text-sm font-semibold text-foreground">
              {congestionLabel[journey.congestion]}
            </p>
          </div>
          <div>
            <ShieldCheck className="h-3.5 w-3.5 text-foreground-muted" />
            <p className="mt-1.5 text-[11px] text-foreground-muted">Reliability</p>
            <p className="text-sm font-semibold text-foreground">{journey.reliabilityPercent}%</p>
          </div>
        </Card>

        {/* Timing advice — the "when should I leave" answer (docs/07 §5). */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted">
              <CalendarClock className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground-muted">Recommended arrival</p>
              <p className="text-lg font-semibold leading-tight text-foreground">
                {journey.arrivalWindow.start} – {journey.arrivalWindow.end}
              </p>
              <p className="mt-1 text-sm leading-snug text-foreground-muted">
                {journey.arrivalWindow.reason}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2.5">
            <span className="text-xs text-foreground-muted">Leave by</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {journey.departureTime}
            </span>
          </div>
        </Card>

        {/* Gate advice — one clear recommendation, with the reason. */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted">
              <DoorOpen className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Enter via {journey.gate.name}
                </p>
                <Chip tone={journey.gate.status === "busy" ? "warning" : "positive"}>
                  {journey.gate.estimatedWaitMinutes} min queue
                </Chip>
              </div>
              <p className="mt-1 text-sm leading-snug text-foreground-muted">
                Shortest queue of the venue gates for your arrival window. We&apos;ll re-check this
                while you travel.
              </p>
            </div>
          </div>
        </Card>

        <div>
          <SectionHeading
            title="Your journey"
            note={`${journey.departureTime} → ${journey.arrivalTime}`}
          />
          <Card className="p-4">
            <JourneyTimeline steps={journey.plan.journey} />
          </Card>
        </div>

        {/* Live transport reading, not a fixed claim — the load figure moves
            with the simulation, so this can't promise spare capacity on a
            route that is actually full. */}
        <div className="rounded-xl bg-surface-muted px-3.5 py-3">
          <p className="text-xs leading-relaxed text-foreground-muted">
            <span className="font-medium text-foreground">{journey.routeName}</span> runs every{" "}
            {journey.routeFrequencyMinutes} min with {journey.reliabilityPercent}% on-time
            reliability, and is currently{" "}
            <span className="font-medium text-foreground">
              {journey.routeLoadPercent}% full
            </span>
            {journey.routeLoadPercent >= 78
              ? " — expect a crowded service."
              : journey.routeLoadPercent >= 55
                ? " — filling up, but coping."
                : " — plenty of room."}
          </p>
        </div>

        <p className="text-center text-[11px] text-foreground-muted">
          Times are estimates from simulated live conditions.
        </p>
      </div>

      <StickyActions>
        <Button className="w-full" onClick={handleStart}>
          <Play className="h-4 w-4" />
          {journeyStarted ? "Resume Journey" : "Start Journey"}
        </Button>
      </StickyActions>
    </div>
  );
}
