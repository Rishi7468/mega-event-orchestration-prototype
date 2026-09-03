"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bed, Bus, Clock, IndianRupee, Lightbulb, MapPin, Users } from "lucide-react";
import {
  Button,
  Card,
  Chip,
  SectionHeading,
  Stat,
  StickyActions,
} from "@/components/shared";
import { FactorBars, PropertyCard, VisitorPageHeader } from "@/components/visitor";
import { accommodationZones, zones } from "@/data";
import { getZoneSnapshot } from "@/lib/conditions";
import { getAccommodationRecommendation, rankProperties } from "@/lib/recommendation";
import { useVisitorJourney } from "@/hooks/useVisitorJourney";
import { useVisitorStore } from "@/store/visitorStore";

export default function RecommendedStayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: zoneId } = use(params);
  const router = useRouter();

  const { profile, zoneSnapshots, routes } = useVisitorJourney();
  const selectStay = useVisitorStore((state) => state.selectStay);

  const zone = zones.find((item) => item.id === zoneId);
  const accommodation = accommodationZones.find((item) => item.zoneId === zoneId);
  const { best, ranked } = getAccommodationRecommendation(profile, zoneSnapshots, routes);
  const score = ranked.find((item) => item.zoneId === zoneId);

  if (!zone || !accommodation || !score) {
    return (
      <div>
        <VisitorPageHeader title="Stay not found" backHref="/visitor/plan" />
        <Card className="p-4">
          <p className="text-sm text-foreground-muted">
            That zone isn&apos;t part of this destination.{" "}
            <Link href="/visitor/plan" className="font-medium text-foreground underline">
              Back to stay options
            </Link>
            .
          </p>
        </Card>
      </div>
    );
  }

  const isRecommended = best.zoneId === zoneId;
  // Ranked inside this zone only — which zone to stay in is already decided
  // by the orchestration engine above, and reviews never reopen that question.
  const rankedProperties = rankProperties(zoneId, profile.budgetPerNight);
  const suggestedProperty = rankedProperties[0]?.property;
  const snapshot = getZoneSnapshot(zoneSnapshots, zoneId);
  const availablePercent = Math.round(
    (accommodation.availableRooms / accommodation.totalRooms) * 100,
  );

  const topZone = ranked[0];
  const comparison =
    !isRecommended && topZone
      ? `${zones.find((item) => item.id === topZone.zoneId)?.name} currently scores ${topZone.score} against ${score.score} here on your priorities.`
      : `Central sits closer to the venue, but is under far more accommodation and crowd pressure right now.`;

  const nightlyTotal = accommodation.averagePrice * profile.stayNights;

  const handleChoose = () => {
    selectStay(zoneId, suggestedProperty?.id ?? null);
    router.push("/visitor/plan/journey");
  };

  return (
    <div>
      <VisitorPageHeader
        title={zone.name}
        subtitle={isRecommended ? "Recommended for you" : "Alternative option"}
        backHref="/visitor/plan"
      />

      <div className="space-y-5">
        <Card className={isRecommended ? "border-accent/40 p-4" : "p-4"}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{zone.name}</h2>
                {isRecommended && <Chip tone="accent">Recommended</Chip>}
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-foreground-muted">
                <MapPin className="h-3 w-3 shrink-0" />
                {accommodation.venueTravelMinutes} min from the venue
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-semibold text-foreground">
                ₹{accommodation.averagePrice.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-foreground-muted">per night</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-3">
            <Stat label="Free" value={`${availablePercent}%`} icon={Bed} />
            <Stat label="Travel" value={`${accommodation.venueTravelMinutes}m`} icon={Clock} />
            <Stat
              label="Crowd"
              value={snapshot ? `${snapshot.crowdPressure}%` : accommodation.crowdLevel}
              icon={Users}
            />
            <Stat
              label="Transport"
              value={accommodation.transportQuality === "good" ? "Good" : "Moderate"}
              icon={Bus}
            />
          </div>
        </Card>

        {/* The explanation is the point of this screen (docs/10 wireframe 3). */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Why we recommend this</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
            {isRecommended
              ? `We compared every zone on the things that actually affect your trip. ${zone.name} came out ahead: ${score.reasons.slice(0, 2).join(" ").toLowerCase() || "it balances cost, availability, transport and crowding best."}`
              : `This is a reasonable option, but not our top pick. ${comparison}`}
          </p>
          {isRecommended && (
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{comparison}</p>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <FactorBars factors={score.factors} />
          </div>

          {score.weakness && (
            <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-xs text-foreground-muted">
              Trade-off: {score.weakness}
            </p>
          )}
        </Card>

        <div>
          <SectionHeading
            title="Stays in this zone"
            note={`${rankedProperties.length} options`}
          />
          <Card className="divide-y divide-border">
            {rankedProperties.map(({ property, reason }, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                zonePressure={snapshot?.crowdPressure}
                recommended={index === 0}
                reason={index === 0 ? reason : undefined}
              />
            ))}
          </Card>
          <p className="mt-2 px-1 text-[11px] leading-relaxed text-foreground-muted">
            Ratings and comments are simulated demo review data, not real guest reviews. They help
            choose between stays in this zone; which zone to stay in is decided on availability,
            transport, crowd pressure and travel time.
          </p>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 shrink-0 text-foreground-muted" />
            <p className="text-sm text-foreground-muted">
              About{" "}
              <span className="font-semibold text-foreground">
                ₹{nightlyTotal.toLocaleString("en-IN")}
              </span>{" "}
              for {profile.stayNights} {profile.stayNights === 1 ? "night" : "nights"}
            </p>
          </div>
        </Card>

        <p className="text-center text-[11px] text-foreground-muted">
          Planning only — this prototype does not book accommodation.
        </p>
      </div>

      <StickyActions>
        <Button className="w-full" onClick={handleChoose}>
          Continue to Journey
        </Button>
        <Link
          href="/visitor/plan"
          className="mt-2 flex h-11 items-center justify-center text-sm text-foreground-muted"
        >
          Compare alternatives
        </Link>
      </StickyActions>
    </div>
  );
}
