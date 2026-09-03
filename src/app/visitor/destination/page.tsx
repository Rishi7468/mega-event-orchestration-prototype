"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Users } from "lucide-react";
import { VisitorZoneMap } from "@/components/map";
import { Button, Card, SectionHeading, Stepper, StickyActions } from "@/components/shared";
import {
  DestinationSearch,
  OriginSelector,
  TimingOutlook,
  VisitTimingCard,
  VisitorPageHeader,
} from "@/components/visitor";
import { PRIMARY_DESTINATION_ID, accommodationZones, event, zones } from "@/data";
import { getZoneSnapshot } from "@/lib/conditions";
import { eventTypeLabel } from "@/types";
import {
  getAccommodationRecommendation,
  getVisitTimingFactors,
} from "@/lib/recommendation";
import { useTripIntent } from "@/hooks/useTripIntent";
import { useVisitorJourney } from "@/hooks/useVisitorJourney";
import { useVisitorStore } from "@/store/visitorStore";

const zoneNames = Object.fromEntries(zones.map((zone) => [zone.id, zone.name]));

/**
 * The product's front door: "which event are you attending, from where, and
 * when — or are you leaving right now".
 *
 * Progressive disclosure keeps this from becoming a form: the event, then the
 * trip basics, then one clear timing answer with two ways forward. The full
 * day-by-day demand picker only appears if the visitor asks for another time.
 */
export default function DestinationIntentPage() {
  const router = useRouter();
  const { destination, timing, profile, selectedDayId, isModelled, goingNow } = useTripIntent();
  const { zoneSnapshots, routes } = useVisitorJourney();

  const originId = useVisitorStore((state) => state.originId);
  const chooseDestination = useVisitorStore((state) => state.chooseDestination);
  const setOrigin = useVisitorStore((state) => state.setOrigin);
  const setSelectedDay = useVisitorStore((state) => state.setSelectedDay);
  const updateProfile = useVisitorStore((state) => state.updateProfile);
  const startVisitNow = useVisitorStore((state) => state.startVisitNow);
  const planAhead = useVisitorStore((state) => state.planAhead);

  // Revealed only when the visitor asks to pick a different time.
  const [showDayPicker, setShowDayPicker] = useState(false);
  // Once an event is chosen the catalogue collapses to a single row — the
  // next decision ("when?") should be the next thing on screen, not eight
  // more cards away.
  const [browsing, setBrowsing] = useState(false);

  // Live inputs exist only for the fully modelled scenario; the explanation
  // shrinks to expected demand alone for the rest rather than inventing data.
  const bestZoneId = isModelled
    ? getAccommodationRecommendation(profile, zoneSnapshots, routes).best.zoneId
    : null;
  const bestAccommodation = accommodationZones.find((zone) => zone.zoneId === bestZoneId);
  const bestRoute = routes.find((route) => route.fromZoneId === bestZoneId);
  const venueSnapshot = getZoneSnapshot(zoneSnapshots, "central");
  const peakScheduleItem = event.schedule.find((item) => item.expectedImpact === "high");

  const factors =
    destination && timing
      ? getVisitTimingFactors(
          destination,
          timing,
          isModelled
            ? {
                crowdPressure: venueSnapshot?.crowdPressure,
                roomsFreePercent: bestAccommodation
                  ? Math.round(
                      (bestAccommodation.availableRooms / bestAccommodation.totalRooms) * 100,
                    )
                  : undefined,
                transportLoadPercent: bestRoute
                  ? Math.round(
                      (bestRoute.currentDemandPerHour / bestRoute.capacityPerHour) * 100,
                    )
                  : undefined,
                peakScheduleItem: peakScheduleItem
                  ? { time: peakScheduleItem.time, title: peakScheduleItem.title }
                  : undefined,
              }
            : {},
        )
      : [];

  const handleVisitNow = () => {
    startVisitNow();
    setShowDayPicker(false);
    router.push(isModelled ? "/visitor/plan" : "/visitor");
  };

  const handleChooseAnotherTime = () => {
    planAhead();
    setShowDayPicker(true);
  };

  return (
    <div>
      <VisitorPageHeader
        title="Which event are you attending?"
        subtitle="We'll plan the best way and time to get you there"
        backHref="/visitor"
      />

      <div className="space-y-5">
        {!destination || browsing ? (
          <DestinationSearch
            selectedId={destination?.id ?? null}
            onSelect={(destinationId) => {
              chooseDestination(destinationId);
              setBrowsing(false);
              setShowDayPicker(false);
            }}
          />
        ) : (
          <Card className="flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{destination.name}</p>
              <p className="truncate text-xs text-foreground-muted">
                {destination.city} · {destination.dateRange} ·{" "}
                {eventTypeLabel[destination.eventType]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBrowsing(true)}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Change
            </button>
          </Card>
        )}

        {destination && !browsing && (
          <div className="animate-fade-up space-y-5">
            <VisitorZoneMap
              destination={destination}
              snapshots={isModelled ? zoneSnapshots : []}
              zoneNames={zoneNames}
              routes={isModelled ? routes : []}
              recommendedZoneId={bestZoneId}
              height={170}
            />

            <div>
              <SectionHeading title="Your trip" />
              <div className="space-y-2.5">
                <OriginSelector originId={originId} onChange={setOrigin} />
                <Card className="px-3.5 py-2.5">
                  <Stepper
                    label="People attending"
                    value={profile.partySize}
                    min={1}
                    max={8}
                    onChange={(partySize) => updateProfile({ partySize })}
                  />
                </Card>
              </div>
            </div>

            {timing && (
              <VisitTimingCard
                destination={destination}
                timing={timing}
                factors={factors}
                goingNow={goingNow}
                onVisitNow={handleVisitNow}
                onChooseAnotherTime={handleChooseAnotherTime}
              />
            )}

            {showDayPicker && timing && (
              <div className="animate-fade-up">
                <TimingOutlook
                  destination={destination}
                  timing={timing}
                  selectedDayId={selectedDayId}
                  onSelectDay={setSelectedDay}
                />
              </div>
            )}

            {!isModelled && (
              <Card className="p-4">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Demand outlook only for this event
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                      Our full orchestration model — accommodation, transport, gates and crowd
                      intelligence — is currently available for selected high-footfall events. In
                      this prototype that is Maha Kumbh; everything else shows demand and timing
                      guidance.
                    </p>
                    <button
                      type="button"
                      onClick={() => chooseDestination(PRIMARY_DESTINATION_ID)}
                      className="mt-2.5 h-9 text-sm font-medium text-foreground underline"
                    >
                      Switch to Maha Kumbh
                    </button>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-3.5 py-2.5">
              <Users className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
              <p className="min-w-0 flex-1 text-xs text-foreground-muted">
                Simulated scenario — demand figures are modelled, not live measurements.
              </p>
            </div>
          </div>
        )}
      </div>

      {destination && !browsing && (
        <StickyActions>
          <Button
            className="w-full"
            onClick={() => router.push(isModelled ? "/visitor/plan" : "/visitor")}
          >
            {isModelled ? "Plan the best way to attend" : "Save this event"}
          </Button>
        </StickyActions>
      )}
    </div>
  );
}
