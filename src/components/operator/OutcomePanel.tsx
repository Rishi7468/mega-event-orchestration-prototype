import { CheckCircle2 } from "lucide-react";

type OutcomeRow = { label: string; before: string; after: string; positive: boolean };

/**
 * Before → action → after. The point isn't the numbers themselves, it's
 * proving the system changed the simulated destination state rather than
 * just suggesting something (docs/05 "Outcome").
 */
export function OutcomePanel({ rows }: { rows: OutcomeRow[] }) {
  return (
    <div className="rounded-xl border border-risk-low/30 bg-risk-low-bg p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-risk-low" />
        <h2 className="text-sm font-semibold text-foreground">Intervention Complete</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-surface p-2.5">
            <p className="text-[11px] text-foreground-muted">{row.label}</p>
            <p className="mt-1 flex items-baseline gap-1 text-sm font-semibold tabular-nums text-foreground">
              {row.before}
              <span className="text-xs font-normal text-foreground-muted">→</span>
              <span className={row.positive ? "text-risk-low" : "text-foreground"}>{row.after}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
