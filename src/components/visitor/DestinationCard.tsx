"use client";

import {
  Check,
  ChevronRight,
  Flag,
  Landmark,
  PartyPopper,
  Store,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Chip } from "@/components/shared";
import { eventTypeLabel } from "@/types";
import type { Destination, DestinationEventType } from "@/types";

const typeIcon: Record<DestinationEventType, LucideIcon> = {
  "religious-gathering": Landmark,
  convention: Store,
  sports: Trophy,
  festival: PartyPopper,
  celebration: Flag,
};

const demandLabel: Record<Destination["demandLevel"], string> = {
  moderate: "Moderate expected demand",
  high: "High expected demand",
  "very-high": "Very high expected demand",
};

const demandTone: Record<Destination["demandLevel"], "neutral" | "warning"> = {
  moderate: "neutral",
  high: "warning",
  "very-high": "warning",
};

type DestinationCardProps = {
  destination: Destination;
  selected?: boolean;
  /** Shows the deterministic reason this event is trending. */
  showTrendingReason?: boolean;
  onSelect: (destinationId: string) => void;
};

/**
 * An event to attend — never a generic place to visit. Every card carries the
 * things that decide whether this trip needs orchestrating at all: where and
 * when it is, what kind of event it is, and how much demand to expect.
 */
export function DestinationCard({
  destination,
  selected,
  showTrendingReason,
  onSelect,
}: DestinationCardProps) {
  const Icon = typeIcon[destination.eventType];

  return (
    <button type="button" onClick={() => onSelect(destination.id)} className="w-full text-left">
      <Card
        className={`p-4 transition-colors ${selected ? "border-accent/50 ring-1 ring-accent/20" : ""}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted">
            <Icon className="h-5 w-5 text-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {destination.name}
              </h3>
              {selected && <Check className="h-4 w-4 shrink-0 text-accent" />}
            </div>
            <p className="truncate text-xs text-foreground-muted">
              {destination.city} · {destination.dateRange}
            </p>
            <p className="mt-0.5 truncate text-xs text-foreground-muted">
              {eventTypeLabel[destination.eventType]}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Chip tone={demandTone[destination.demandLevel]}>
                {demandLabel[destination.demandLevel]}
              </Chip>
              {destination.simulationReady && <Chip tone="positive">Full plan available</Chip>}
            </div>

            {showTrendingReason && destination.trending && (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-foreground-muted">
                <TrendingUp className="mt-0.5 h-3 w-3 shrink-0" />
                {destination.trending.reason}
              </p>
            )}
          </div>

          <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-foreground-muted" />
        </div>
      </Card>
    </button>
  );
}
