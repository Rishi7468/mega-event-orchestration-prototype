import type { ZoneFactor } from "@/lib/recommendation";

function barColor(score: number): string {
  if (score >= 70) return "bg-risk-low";
  if (score >= 45) return "bg-risk-medium";
  return "bg-risk-high";
}

/**
 * Shows *how* a zone scored on each signal without exposing raw internals —
 * the visitor sees "Availability: good, 60% still free", not a weight vector
 * (docs/09_MOBILE_UX_PRINCIPLES.md #6).
 */
export function FactorBars({ factors }: { factors: ZoneFactor[] }) {
  return (
    <ul className="space-y-2.5">
      {factors.map((factor) => (
        <li key={factor.key}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium text-foreground">{factor.label}</span>
            <span className="truncate text-foreground-muted">{factor.summary}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${barColor(factor.score)}`}
              style={{ width: `${Math.round(factor.score)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
