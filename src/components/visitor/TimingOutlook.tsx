"use client";

import { CalendarClock, Sparkles } from "lucide-react";
import { Card, Chip } from "@/components/shared";
import type { VisitTimingRecommendation } from "@/lib/recommendation";
import type { Destination } from "@/types";

const barTone = (demandPercent: number) =>
  demandPercent >= 85 ? "bg-risk-high" : demandPercent >= 65 ? "bg-risk-medium" : "bg-risk-low";

type TimingOutlookProps = {
  destination: Destination;
  timing: VisitTimingRecommendation;
  selectedDayId: string | null;
  onSelectDay: (dayId: string | null) => void;
};

/**
 * Answers "when should I attend?" — the day picker doubles as the demand
 * forecast, so choosing a date and seeing its consequence are the same
 * gesture rather than two separate screens.
 */
export function TimingOutlook({
  destination,
  timing,
  selectedDayId,
  onSelectDay,
}: TimingOutlookProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 shrink-0 text-foreground-muted" />
          <h2 className="text-sm font-semibold text-foreground">When to attend</h2>
        </div>
        <button
          type="button"
          onClick={() => onSelectDay(null)}
          className={`h-8 rounded-full px-3 text-xs font-medium transition-colors ${
            selectedDayId === null
              ? "bg-accent text-accent-foreground"
              : "border border-border text-foreground-muted"
          }`}
        >
          Best time
        </button>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {destination.outlook.map((day) => {
          const active = day.id === selectedDayId;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              aria-pressed={active}
              className={`rounded-lg border px-1 py-2 transition-colors ${
                active ? "border-accent bg-surface-muted" : "border-border"
              }`}
            >
              <span className="block text-xs font-medium text-foreground">{day.label}</span>
              <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <span
                  className={`block h-full rounded-full transition-[width] duration-500 ${barTone(day.demandPercent)}`}
                  style={{ width: `${day.demandPercent}%` }}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg bg-surface-muted p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{timing.headline}</p>
            <p className="mt-0.5 text-xs leading-snug text-foreground-muted">{timing.detail}</p>
          </div>
        </div>
        {timing.recommendedWindow && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Chip tone="positive">Arrive {timing.recommendedWindow.label}</Chip>
            {timing.suggestsDifferentDay && timing.quietestDay && (
              <Chip tone="neutral">{timing.quietestDay.label} is quieter</Chip>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
