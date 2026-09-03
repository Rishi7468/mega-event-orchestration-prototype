import { ChevronRight } from "lucide-react";

export type LineageStage = "observed" | "forecast" | "recommended" | "action" | "outcome";

const STAGES: { id: LineageStage; label: string; hint: string }[] = [
  { id: "observed", label: "Observed", hint: "Site-camera feeds" },
  { id: "forecast", label: "Forecast", hint: "Projected pressure" },
  { id: "recommended", label: "Recommended", hint: "Suggested response" },
  { id: "action", label: "Action", hint: "Organiser approves" },
  { id: "outcome", label: "Outcome", hint: "Measured change" },
];

/**
 * Makes the intelligence loop legible: where a number came from, and what it
 * turns into. Preferred over stamping "AI-powered" on panels — the pipeline
 * is the explanation (docs §14).
 */
export function LineagePipeline({ activeStage }: { activeStage: LineageStage }) {
  const activeIndex = STAGES.findIndex((stage) => stage.id === activeStage);

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-xl border border-border bg-surface px-3 py-2.5">
      {STAGES.map((stage, index) => {
        const isActive = index === activeIndex;
        const isPast = index < activeIndex;
        return (
          <div key={stage.id} className="flex items-center gap-1">
            <div
              className={`rounded-lg px-2.5 py-1.5 ${
                isActive ? "bg-surface-muted" : ""
              }`}
            >
              <p
                className={`text-[11px] font-medium ${
                  isActive ? "text-foreground" : isPast ? "text-foreground-muted" : "text-foreground-muted/60"
                }`}
              >
                {stage.label}
              </p>
              <p className="text-[10px] text-foreground-muted/70">{stage.hint}</p>
            </div>
            {index < STAGES.length - 1 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-foreground-muted/50" />
            )}
          </div>
        );
      })}
    </div>
  );
}
