import { pressureToRisk } from "@/lib/recommendation";

const barColor: Record<ReturnType<typeof pressureToRisk>, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
};

type PressureBarProps = {
  label: string;
  percent: number;
};

/** Meaningful status indicator — one glance tells you the zone's pressure and its severity color. */
export function PressureBar({ label, percent }: PressureBarProps) {
  const risk = pressureToRisk(percent);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-foreground-muted">{label}</span>
        <span className="font-medium text-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full ${barColor[risk]}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
