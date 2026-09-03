"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bed,
  Bus,
  CalendarDays,
  ChevronRight,
  MapPinned,
  Repeat,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, Chip, SectionHeading } from "@/components/shared";
import { DestinationSearch, TripContextBar, VisitorTopBar } from "@/components/visitor";
import { accommodationZones } from "@/data";
import { crowdLabel, getZoneSnapshot, isElevated } from "@/lib/conditions";
import { getAccommodationRecommendation, pressureToRisk } from "@/lib/recommendation";
import { useTripIntent } from "@/hooks/useTripIntent";
import { useVisitorJourney } from "@/hooks/useVisitorJourney";
import { useVisitorStore } from "@/store/visitorStore";

/**
 * One evolving screen, four states:
 * no event → event chosen → plan created → journey in progress.
 *
 * The discovery half (search, suggested, trending) stays reachable once a
 * trip exists, because a visitor can attend more than one event — but the
 * active trip always comes first.
 */
export default function VisitorHomePage() {
  const router = useRouter();
  const { destination, origin, timing, isModelled, goingNow } = useTripIntent();
  const {
    phase,
    zoneSnapshots,
    routes,
    profile,
    journey,
    journeyStarted,
    currentStep,
    reoptimizationAvailable,
  } = useVisitorJourney();
  const chooseDestination = useVisitorStore((state) => state.chooseDestination);

  const elevated = isElevated(phase);
  const centralSnapshot = getZoneSnapshot(zoneSnapshots, "central");
  const centralCrowd = centralSnapshot?.crowdPressure ?? 0;

  const handleSelectDestination = (destinationId: string) => {
    chooseDestination(destinationId);
    router.push("/visitor/destination");
  };

  // ---- State 1: no event chosen yet -------------------------------------
  if (!destination) {
    return (
      <div className="pb-2">
        <VisitorTopBar location={origin?.city ?? "Set your city"} notificationCount={0} />
        <div className="space-y-5 pt-2">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Where are you planning to go?
            </h1>
            <p className="mt-1 text-sm leading-snug text-foreground-muted">
              Pick the event you&apos;re attending and we&apos;ll plan the best way and time to get
              there, {profile.name}.
            </p>
          </div>

          <DestinationSearch onSelect={handleSelectDestination} showSections />

          <div className="flex items-start gap-2 rounded-xl bg-surface-muted px-3.5 py-3">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <p className="min-w-0 flex-1 text-xs leading-relaxed text-foreground-muted">
              We weigh accommodation, transport, venue capacity and crowd movement together — not
              just distance or price.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // The same engine the Plan screen uses, so Home never advertises a
  // different recommendation than the one the visitor will actually see.
  const { best } = getAccommodationRecommendation(profile, zoneSnapshots, routes);
  const bestAccommodation = accommodationZones.find((zone) => zone.zoneId === best.zoneId);
  const bestAvailability = bestAccommodation
    ? Math.round((bestAccommodation.availableRooms / bestAccommodation.totalRooms) * 100)
    : 0;
  const bestZoneName = bestAccommodation
    ? best.zoneId.charAt(0).toUpperCase() + best.zoneId.slice(1)
    : "";

  const toneFor = (risk: "low" | "medium" | "high" | "critical") =>
    ({
      low: "text-risk-low",
      medium: "text-risk-medium",
      high: "text-risk-high",
      critical: "text-risk-critical",
    })[risk];

  const glance = [
    {
      label: "Stay",
      icon: Bed,
      status: bestAvailability >= 50 ? "Good" : bestAvailability >= 25 ? "Limited" : "Tight",
      detail: `${bestAvailability}% free in ${bestZoneName}`,
      tone: toneFor(bestAvailability >= 50 ? "low" : "medium"),
    },
    {
      label: "Transport",
      icon: Bus,
      status: elevated ? "Busy" : "Moderate",
      detail: elevated ? "Central routes under load" : "Running close to schedule",
      tone: toneFor(elevated ? "high" : "medium"),
    },
    {
      label: "Crowd",
      icon: Users,
      status: crowdLabel(centralCrowd),
      detail: "Around the venue",
      tone: toneFor(pressureToRisk(centralCrowd)),
    },
  ];

  return (
    <div className="pb-2">
      <VisitorTopBar
        location={origin?.city ?? "Set your city"}
        notificationCount={reoptimizationAvailable ? 1 : 0}
      />

      <div className="animate-fade-up space-y-5 pt-2">
        <div>
          <h1 className="text-xl font-semibold leading-tight text-foreground">
            {journey ? `Your trip to ${destination.name}` : `Attending ${destination.name}`}
          </h1>
          <p className="mt-1 truncate text-sm text-foreground-muted">
            {destination.city}, {destination.region} · {destination.dateRange}
          </p>
        </div>

        <TripContextBar origin={origin} destination={destination} />

        {/* Contextual intelligence — a sentence, not a metric dump. */}
        {timing && (
          <Card className="p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {goingNow ? "Travelling now" : timing.headline}
                </p>
                <p className="mt-1 text-sm leading-snug text-foreground-muted">
                  {goingNow
                    ? "Your plan is being built against current conditions rather than a forecast."
                    : timing.detail}
                </p>
                <Link
                  href="/visitor/destination"
                  className="mt-2 inline-block text-xs font-medium text-foreground underline"
                >
                  Change date or event
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Primary action adapts to where the visitor is in their trip. */}
        {!isModelled ? (
          <Card className="p-4">
            <p className="text-sm font-medium text-foreground">Demand outlook only</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
              Full stay, transport and crowd orchestration is modelled for selected events. For{" "}
              {destination.name} this prototype shows demand and timing guidance only.
            </p>
          </Card>
        ) : !journey ? (
          <Link href="/visitor/plan" className="block">
            <Card tone="accent" className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Plan the best way to attend</p>
                <p className="text-sm text-white/70">
                  Stay, travel and venue entry, planned together
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 opacity-70" />
            </Card>
          </Link>
        ) : (
          <Link href={journeyStarted ? "/visitor/live" : "/visitor/plan/journey"} className="block">
            <Card tone="accent" className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {journeyStarted ? "Journey in progress" : "Your plan is ready"}
                  </p>
                  <p className="truncate text-sm text-white/70">
                    {journeyStarted && currentStep
                      ? `Next: ${currentStep.title}`
                      : `${journey.zoneName} · ${journey.totalMinutes} min to venue`}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Arrive {journey.arrivalTime} · {journey.gate.name}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 opacity-70" />
              </div>
            </Card>
          </Link>
        )}

        {reoptimizationAvailable && (
          <Link href="/visitor/live/recommendation" className="block">
            <Card className="animate-fade-up border-risk-high/30 bg-risk-high-bg p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Your plan can be improved</p>
                  <p className="mt-0.5 truncate text-sm text-foreground-muted">
                    Conditions changed on your route.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-foreground-muted" />
              </div>
            </Card>
          </Link>
        )}

        {/* Three readings, one line each: the status word carries the colour
            (never colour alone), and the supporting detail says why it matters
            for this trip. */}
        {isModelled && (
          <div>
            <SectionHeading title="Trip conditions" note="Simulated live data" />
            <Card className="divide-y divide-border">
              {glance.map(({ label, icon: Icon, status, detail, tone }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3">
                  <Icon className="h-4 w-4 shrink-0 text-foreground-muted" />
                  <span className="shrink-0 text-sm text-foreground-muted">{label}</span>
                  <span className="ml-auto min-w-0 text-right">
                    <span className={`block text-sm font-semibold ${tone}`}>{status}</span>
                    <span className="block truncate text-[11px] text-foreground-muted">
                      {detail}
                    </span>
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Discovery stays available, below the active trip — never above it. */}
        <Link href="/visitor/destination" className="block">
          <Card className="flex items-center gap-3 p-4">
            <Repeat className="h-4 w-4 shrink-0 text-foreground-muted" />
            <p className="min-w-0 flex-1 text-sm text-foreground">Attending a different event?</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-foreground-muted" />
          </Card>
        </Link>

        <div className="flex items-center gap-2 pb-1">
          <Chip tone="neutral">Simulated scenario</Chip>
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-foreground-muted">
            Demo data — figures are modelled, not live measurements.
          </p>
        </div>
      </div>
    </div>
  );
}
