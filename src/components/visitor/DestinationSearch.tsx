"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { SectionHeading } from "@/components/shared";
import { destinations, getSuggestedDestinations, getTrendingDestinations } from "@/data";
import { eventTypeLabel } from "@/types";
import type { Destination } from "@/types";
import { DestinationCard } from "./DestinationCard";

type DestinationSearchProps = {
  selectedId?: string | null;
  onSelect: (destinationId: string) => void;
  /** Off on the intent screen, where a flat list of every event reads better. */
  showSections?: boolean;
};

/**
 * Find the event you're attending.
 *
 * Matching covers event name, host city, region and event category — so
 * "sports", "expo" or "Delhi" all work — but nothing outside the event
 * catalogue is searchable. This is not place discovery: the product's job
 * starts once you know which event you're going to.
 */
export function DestinationSearch({
  selectedId,
  onSelect,
  showSections = false,
}: DestinationSearchProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const matches = useMemo(() => {
    const needle = trimmed.toLowerCase();
    if (!needle) return destinations;
    return destinations.filter((destination) =>
      [
        destination.name,
        destination.city,
        destination.region,
        destination.summary,
        eventTypeLabel[destination.eventType],
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [trimmed]);

  const suggested = getSuggestedDestinations();
  const suggestedIds = new Set(suggested.map((destination) => destination.id));
  const trending = getTrendingDestinations().filter(
    (destination) => !suggestedIds.has(destination.id),
  );

  const renderList = (list: Destination[], showTrendingReason = false) => (
    <div className="space-y-3">
      {list.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          selected={destination.id === selectedId}
          showTrendingReason={showTrendingReason}
          onSelect={onSelect}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="search"
          value={query}
          onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          placeholder="Search events, host cities or event types"
          aria-label="Search an event to attend"
          className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-foreground-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>

      {trimmed && matches.length === 0 && (
        /* An honest boundary rather than an empty grid: the platform models
           selected high-footfall events, and says so. */
        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
          <SearchX className="mx-auto h-5 w-5 text-foreground-muted" />
          <p className="mt-2 text-sm font-medium text-foreground">
            This destination isn&apos;t currently supported.
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-foreground-muted">
            Our full orchestration model is currently available for selected high-footfall events.
            Try an event name, a host city, or a type like &ldquo;sports&rdquo; or
            &ldquo;festival&rdquo;.
          </p>
        </div>
      )}

      {trimmed && matches.length > 0 && (
        <div className="space-y-3">
          <p className="px-0.5 text-xs font-medium text-foreground-muted">
            {matches.length} match{matches.length === 1 ? "" : "es"}
          </p>
          {renderList(matches)}
        </div>
      )}

      {!trimmed &&
        (showSections ? (
          <div className="space-y-5">
            <div>
              <SectionHeading title="Suggested for you" note="High-demand events" />
              {renderList(suggested)}
            </div>
            <div>
              {/* "Trending" carries its reason on every card — there is no
                  popularity feed behind this prototype, so an unexplained
                  badge would be decoration. Events already shown above are
                  filtered out rather than repeated a screen apart. */}
              <SectionHeading title="Trending now" note="Rising expected demand" />
              {renderList(trending, true)}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="px-0.5 text-xs font-medium text-foreground-muted">
              {destinations.length} events in the catalogue
            </p>
            {renderList(destinations)}
          </div>
        ))}
    </div>
  );
}
