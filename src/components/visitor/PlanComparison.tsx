import { Chip } from "@/components/shared";
import type { BuiltJourney } from "@/lib/journey";

type PlanColumnProps = {
  eyebrow: string;
  journey: BuiltJourney;
  remaining: number;
  recommended?: boolean;
  savingMinutes?: number;
};

function PlanColumn({ eyebrow, journey, remaining, recommended, savingMinutes }: PlanColumnProps) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        recommended ? "border-accent/40 bg-surface" : "border-border bg-surface"
      }`}
    >
      <p className="truncate text-[11px] text-foreground-muted">{eyebrow}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{journey.gate.name}</p>

      <dl className="mt-3 space-y-2 border-t border-border pt-3">
        <div>
          <dt className="text-[11px] text-foreground-muted">Time left</dt>
          <dd className="text-xl font-semibold tabular-nums text-foreground">
            {remaining}
            <span className="ml-1 text-sm font-normal text-foreground-muted">min</span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-foreground-muted">Queue at gate</dt>
          <dd className="text-sm font-medium tabular-nums text-foreground">
            {journey.gate.estimatedWaitMinutes} min
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-foreground-muted">Arrive</dt>
          <dd className="text-sm font-medium tabular-nums text-foreground">{journey.arrivalTime}</dd>
        </div>
      </dl>

      {recommended && savingMinutes ? (
        <div className="mt-3">
          <Chip tone="positive">{savingMinutes} min faster</Chip>
        </div>
      ) : null}
    </div>
  );
}

type PlanComparisonProps = {
  current: BuiltJourney;
  alternative: BuiltJourney;
  currentRemaining: number;
  alternativeRemaining: number;
};

/** Wireframe 6's side-by-side: what happens if you stay vs if you switch. */
export function PlanComparison({
  current,
  alternative,
  currentRemaining,
  alternativeRemaining,
}: PlanComparisonProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PlanColumn eyebrow="Your current plan" journey={current} remaining={currentRemaining} />
      <PlanColumn
        eyebrow="Recommended"
        journey={alternative}
        remaining={alternativeRemaining}
        recommended
        savingMinutes={currentRemaining - alternativeRemaining}
      />
    </div>
  );
}
