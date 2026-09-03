import { Bed, Bus, Check, DoorOpen, Footprints, Landmark, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Chip } from "@/components/shared";
import type { CongestionLevel, JourneyStep } from "@/types";

const stepIcon: Record<JourneyStep["type"], LucideIcon> = {
  stay: Bed,
  walk: Footprints,
  "transit-hub": Landmark,
  shuttle: Bus,
  gate: DoorOpen,
  venue: MapPin,
};

const crowdLabel: Record<CongestionLevel, string> = {
  low: "Low crowd",
  medium: "Moderate crowd",
  high: "High crowd",
};

const crowdTone: Record<CongestionLevel, "positive" | "neutral" | "warning"> = {
  low: "positive",
  medium: "neutral",
  high: "warning",
};

type JourneyTimelineProps = {
  steps: JourneyStep[];
  /** When provided, steps before this index render as completed. */
  currentStepIndex?: number;
};

export function JourneyTimeline({ steps, currentStepIndex }: JourneyTimelineProps) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const Icon = stepIcon[step.type];
        const isLast = index === steps.length - 1;
        const done = currentStepIndex !== undefined && index < currentStepIndex;
        const active = currentStepIndex !== undefined && index === currentStepIndex;

        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex w-14 shrink-0 flex-col items-end pt-1">
              <span className="text-xs font-medium tabular-nums text-foreground">{step.time}</span>
              {step.durationMinutes > 0 && (
                <span className="text-[11px] text-foreground-muted">{step.durationMinutes} min</span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : done
                      ? "border-border bg-surface-muted text-foreground-muted"
                      : "border-border bg-surface text-foreground-muted"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" style={{ minHeight: 28 }} />}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-5"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {/* Wraps rather than truncates — the step name is the whole
                      point of the row (docs/09 §5 glanceability). */}
                  <p className="text-sm font-medium leading-snug text-foreground">{step.title}</p>
                  {step.subtitle && (
                    <p className="mt-0.5 text-xs leading-snug text-foreground-muted">
                      {step.subtitle}
                    </p>
                  )}
                </div>
                {step.durationMinutes > 0 && (
                  <div className="shrink-0">
                    <Chip tone={crowdTone[step.crowdLevel]}>{crowdLabel[step.crowdLevel]}</Chip>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
