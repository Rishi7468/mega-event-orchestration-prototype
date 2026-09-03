"use client";

import Link from "next/link";
import { Navigation, Sparkles } from "lucide-react";
import { VisitorZoneMap } from "@/components/map";
import { Button, Card, SectionHeading } from "@/components/shared";
import {
  TripContextBar,
  TripPreferences,
  VisitorPageHeader,
  ZoneOptionCard,
} from "@/components/visitor";
import { accommodationZones, zones } from "@/data";
import { getAccommodationRecommendation } from "@/lib/recommendation";
import { useTripIntent } from "@/hooks/useTripIntent";
import { useVisitorJourney } from "@/hooks/useVisitorJourney";

const zoneNames = Object.fromEntries(zones.map((zone) => [zone.id, zone.name]));

export default function AccommodationIntelligencePage() {
  const { profile, zoneSnapshots, routes } = useVisitorJourney();
  const { destination, origin, isModelled, goingNow } = useTripIntent();

  // Planning is only meaningful once we know which event is being attended.
  if (!destination || !isModelled) {
    return (
      <div>
        <VisitorPageHeader title="Choose Where to Stay" backHref="/visitor" />
        <Card className="p-5 text-center">
          <p className="text-sm text-foreground-muted">
            {destination
              ? `The full stay and journey model is simulated for Maha Kumbh in this prototype.`
              : `Tell us which event you're attending and we'll compare where to stay.`}
          </p>
          <Link href="/visitor/destination">
            <Button className="mt-4 w-full">
              {destination ? "Change event" : "Choose an event"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Re-scored on every preference change — the recommendation is live.
  const { best, ranked } = getAccommodationRecommendation(profile, zoneSnapshots, routes);

  return (
    <div>
      <VisitorPageHeader
        title="Choose Where to Stay"
        subtitle="Compared on availability, price, transport and crowd"
        backHref="/visitor"
      />

      <div className="space-y-5">
        <TripContextBar origin={origin} destination={destination} />

        {/* "I need to go now" is a different question from "when should I go":
            it plans against conditions as they stand rather than a forecast,
            and the visitor should be able to see which one they're in. */}
        {goingNow && (
          <div className="flex items-start gap-2.5 rounded-xl bg-surface-muted px-3.5 py-3">
            <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <p className="min-w-0 flex-1 text-xs leading-relaxed text-foreground-muted">
              Travelling now — these options are ranked on{" "}
              <span className="font-medium text-foreground">current</span> availability, transport
              load and crowd pressure.
            </p>
          </div>
        )}

        <TripPreferences />

        <VisitorZoneMap
          destination={destination}
          snapshots={zoneSnapshots}
          zoneNames={zoneNames}
          routes={routes}
          recommendedZoneId={best.zoneId}
        />

        <Card className="animate-fade-up border-accent/40 p-4">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Recommended: {zoneNames[best.zoneId]}
              </p>
              <p className="mt-1 text-sm leading-snug text-foreground-muted">
                {best.reasons.slice(0, 2).join(" ") ||
                  "Best overall balance for the trip you described."}
              </p>
            </div>
          </div>
        </Card>

        <div>
          <SectionHeading
            title="Stay options"
            note={`${ranked.length} zones compared`}
          />
          <div className="space-y-3">
            {ranked.map((score) => {
              const zone = zones.find((item) => item.id === score.zoneId);
              const accommodation = accommodationZones.find(
                (item) => item.zoneId === score.zoneId,
              );
              if (!zone || !accommodation) return null;

              return (
                <ZoneOptionCard
                  key={score.zoneId}
                  zone={zone}
                  accommodation={accommodation}
                  score={score}
                  recommended={score.zoneId === best.zoneId}
                />
              );
            })}
          </div>
        </div>

        <p className="px-1 pb-2 text-center text-[11px] leading-relaxed text-foreground-muted">
          Ranked using simulated live availability, transport capacity and crowd data.
        </p>
      </div>
    </div>
  );
}
