"use client";

import { CalendarClock, CalendarRange, Navigation } from "lucide-react";
import { Button, Card } from "@/components/shared";
import type { TimingFactor, VisitTimingRecommendation } from "@/lib/recommendation";
import type { Destination } from "@/types";

type VisitTimingCardProps = {
  destination: Destination;
  timing: VisitTimingRecommendation;
  factors: TimingFactor[];
  /** True while the visitor is in "going now" mode. */
  goingNow: boolean;
  onVisitNow: () => void;
  onChooseAnotherTime: () => void;
};

/**
 * The answer to "when should I attend?", given the weight the question
 * deserves — it is the first real decision the product makes for the visitor,
 * and everything downstream (stay, journey, gate) is planned against it.
 *
 * Two ways forward, both first-class: leave now and plan against current
 * conditions, or pick a different date and plan ahead. The reasoning sits
 * between them, short enough to read at a glance.
 */
export function VisitTimingCard({
  destination,
  timing,
  factors,
  goingNow,
  onVisitNow,
  onChooseAnotherTime,
}: VisitTimingCardProps) {
  const day = timing.selectedDay ?? timing.quietestDay;
  const window = timing.recommendedWindow;

  return (
    <Card className="animate-fade-up border-accent/40 p-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 shrink-0 text-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Best time to attend</h2>
      </div>

      <p className="mt-2 text-xl font-semibold leading-tight text-foreground">
        {day ? `${day.label}, ` : ""}
        {window?.label ?? "Flexible"}
      </p>
      <p className="mt-1 text-sm leading-snug text-foreground-muted">
        {window?.note ?? timing.detail}
      </p>

      {factors.length > 0 && (
        <dl className="mt-3 space-y-1.5 border-t border-border pt-3">
          {factors.map((factor) => (
            <div key={factor.label} className="flex items-baseline gap-2">
              <dt className="w-24 shrink-0 text-[11px] text-foreground-muted">{factor.label}</dt>
              <dd className="min-w-0 flex-1 text-xs leading-snug text-foreground">
                {factor.detail}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          variant={goingNow ? "primary" : "secondary"}
          className="w-full"
          onClick={onVisitNow}
        >
          <Navigation className="h-4 w-4" />
          Visit now
        </Button>
        <Button variant="secondary" className="w-full" onClick={onChooseAnotherTime}>
          <CalendarRange className="h-4 w-4" />
          Another time
        </Button>
      </div>

      <p className="mt-2 text-center text-[11px] text-foreground-muted">
        {goingNow
          ? `Planning against conditions at ${destination.city} right now.`
          : "Going now plans against live conditions instead of the forecast."}
      </p>
    </Card>
  );
}
