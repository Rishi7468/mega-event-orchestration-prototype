import { CalendarClock } from "lucide-react";
import { OperatorPanel } from "./OperatorPanel";
import { Chip } from "@/components/shared";
import type { EventScheduleItem } from "@/types";

const impactTone = { low: "neutral", medium: "neutral", high: "warning" } as const;

/**
 * What's coming up on the event schedule, and who it hits. `affected` is a
 * small presentation-level lookup rather than a data-model field — the
 * schedule doesn't need to own map/route names, and this keeps the shared
 * Event type from growing display-only concerns.
 */
const AFFECTED: Record<string, string[]> = {
  "sched-morning-snan": ["North corridor"],
  "sched-main-aarti": ["Gate A", "Main corridor", "Shuttle S1"],
};

export function EventScheduleCard({ schedule, compact }: { schedule: EventScheduleItem[]; compact?: boolean }) {
  const items = compact ? schedule.slice(0, 1) : schedule;

  return (
    <OperatorPanel title="Event Schedule">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
              <CalendarClock className="h-3.5 w-3.5 text-foreground-muted" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                <span className="shrink-0 text-xs tabular-nums text-foreground-muted">{item.time}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Chip tone={impactTone[item.expectedImpact]}>{item.expectedImpact} impact</Chip>
                {(AFFECTED[item.id] ?? []).map((affected) => (
                  <span key={affected} className="text-[11px] text-foreground-muted">
                    {affected}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </OperatorPanel>
  );
}
