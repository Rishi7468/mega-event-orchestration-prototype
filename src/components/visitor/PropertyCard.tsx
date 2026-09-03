import { Bed, Bus, Star, Users } from "lucide-react";
import { Chip } from "@/components/shared";
import { availabilityPercent } from "@/data";
import { crowdLabel } from "@/lib/conditions";
import type { Property } from "@/types";

/**
 * Five stars filled to the exact score — a filled row clipped to score/5 sits
 * over an empty row, so 4.6 reads as four-and-a-bit rather than rounding up to
 * a five that the number beside it contradicts.
 */
function Stars({ score }: { score: number }) {
  const row = [1, 2, 3, 4, 5];
  return (
    <span className="relative inline-flex" aria-hidden>
      <span className="flex items-center gap-0.5">
        {row.map((position) => (
          <Star key={position} className="h-3 w-3 text-border" strokeWidth={1.5} />
        ))}
      </span>
      <span
        className="absolute inset-y-0 left-0 flex items-center gap-0.5 overflow-hidden"
        style={{ width: `${(Math.min(5, Math.max(0, score)) / 5) * 100}%` }}
      >
        {row.map((position) => (
          <Star
            key={position}
            className="h-3 w-3 shrink-0 fill-risk-medium text-risk-medium"
            strokeWidth={1.5}
          />
        ))}
      </span>
    </span>
  );
}

type PropertyCardProps = {
  property: Property;
  /** Crowd pressure in the property's zone, for the destination-pressure line. */
  zonePressure?: number;
  recommended?: boolean;
  reason?: string;
};

/**
 * A place to stay, described the way a planning product describes one — brand,
 * price, availability, reviews — with the orchestration reading (how much
 * pressure its zone is under, how far it is from the shuttle) sitting in the
 * same card rather than on a separate screen.
 *
 * Review scores and quotes are simulated demo data and are labelled as such;
 * they are not real guest reviews, and they only ever rank properties inside
 * a zone the orchestration engine has already chosen.
 */
export function PropertyCard({
  property,
  zonePressure,
  recommended,
  reason,
}: PropertyCardProps) {
  const free = availabilityPercent(property);

  return (
    <div className={`p-3.5 ${recommended ? "bg-surface-muted" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{property.name}</p>
          <p className="truncate text-[11px] text-foreground-muted">{property.brand}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-foreground">
            ₹{property.pricePerNight.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-foreground-muted">per night</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Stars score={property.reviews.score} />
        <span className="text-xs font-medium text-foreground">
          {property.reviews.score.toFixed(1)}
        </span>
        <span className="text-[11px] text-foreground-muted">
          {property.reviews.count} demo reviews
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <span className="flex items-center gap-1.5 text-[11px] text-foreground">
          <Bed className="h-3 w-3 shrink-0 text-foreground-muted" />
          {free}% free
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-foreground">
          <Bus className="h-3 w-3 shrink-0 text-foreground-muted" />
          {property.shuttleWalkMinutes} min walk
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-foreground">
          <Users className="h-3 w-3 shrink-0 text-foreground-muted" />
          {zonePressure === undefined ? `${property.distanceFromVenueKm} km` : crowdLabel(zonePressure)}
        </span>
      </div>

      <p className="mt-2.5 text-[11px] leading-snug text-foreground-muted">
        &ldquo;{property.reviews.quote}&rdquo;
      </p>

      {recommended && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Chip tone="positive">Recommended for your trip</Chip>
          {reason && (
            <span className="min-w-0 flex-1 text-[11px] leading-snug text-foreground-muted">
              {reason}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
