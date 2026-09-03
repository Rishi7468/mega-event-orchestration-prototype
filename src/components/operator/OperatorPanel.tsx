import type { ReactNode } from "react";

type OperatorPanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

/** Shared panel chrome for the intelligence-panel sections (Alerts, Forecast, Recommendation, Schedule). */
export function OperatorPanel({ title, action, children }: OperatorPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
