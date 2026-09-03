import Link from "next/link";
import { Bed, Bus, ChevronRight, Clock, Users } from "lucide-react";
import { Card, Chip } from "@/components/shared";
import type { ZoneScore } from "@/lib/recommendation";
import type { AccommodationZone, Zone } from "@/types";

type ZoneOptionCardProps = {
  zone: Zone;
  accommodation: AccommodationZone;
  score: ZoneScore;
  recommended?: boolean;
};

const factorSummary = (score: ZoneScore, key: string) =>
  score.factors.find((factor) => factor.key === key)?.summary ?? "";

export function ZoneOptionCard({ zone, accommodation, score, recommended }: ZoneOptionCardProps) {
  const availablePercent = Math.round(
    (accommodation.availableRooms / accommodation.totalRooms) * 100,
  );

  return (
    <Link href={`/visitor/plan/stay/${zone.id}`} className="block">
      <Card
        className={`p-4 transition-colors ${
          recommended ? "border-accent/40 ring-1 ring-accent/20" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{zone.name}</h3>
              {recommended && <Chip tone="accent">Recommended</Chip>}
            </div>
            <p className="mt-0.5 text-xs text-foreground-muted">
              {factorSummary(score, "crowd")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-base font-semibold text-foreground">
              ₹{accommodation.averagePrice.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-foreground-muted">per night</p>
          </div>
        </div>

        {/* 2×2 rather than one tight row — four readings don't fit legibly
            across a 390px phone without truncating every one of them. */}
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <Bed className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <span className="truncate text-xs text-foreground">{availablePercent}% free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <span className="truncate text-xs text-foreground">
              {accommodation.venueTravelMinutes} min
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            {/* Icon already says "crowd" — the word would only get truncated. */}
            <span className="truncate text-xs capitalize text-foreground">
              {accommodation.crowdLevel}
            </span>
          </div>
          {/* Live shuttle load — transport is a decision factor here, not decoration. */}
          <div className="flex items-center gap-1.5">
            <Bus className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <span className="truncate text-xs text-foreground">
              {factorSummary(score, "transport").split("·")[1]?.trim() ?? "—"}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Bus className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
            <p className="truncate text-xs text-foreground-muted">
              {recommended
                ? (score.reasons[0] ?? "Best overall balance for your trip.")
                : (score.weakness ?? `${accommodation.transportQuality} transport connection.`)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-foreground-muted" />
        </div>
      </Card>
    </Link>
  );
}
