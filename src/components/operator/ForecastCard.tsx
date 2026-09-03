import { TrendingUp } from "lucide-react";
import { OperatorPanel } from "./OperatorPanel";
import { StatusBadge } from "@/components/shared";
import { pressureToRisk } from "@/lib/recommendation";
import type { getUrgentForecast } from "@/lib/recommendation";

type ForecastCardProps = {
  forecast: NonNullable<ReturnType<typeof getUrgentForecast>>;
  compact?: boolean;
};

/**
 * "What will happen if nothing changes" — a deterministic linear
 * projection, explicitly labeled as a forecast rather than a measurement
 * (docs/12 §9 "Prediction"). Compact mode shows only the +20 min figure for
 * the Command Center; the full breakdown lives on Demand & Capacity.
 */
export function ForecastCard({ forecast, compact }: ForecastCardProps) {
  const { zoneName, current, plus10, plus20 } = forecast;

  if (compact) {
    return (
      <OperatorPanel title="Forecast">
        <div className="flex items-start gap-2.5">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" />
          <div className="min-w-0">
            <p className="text-xs text-foreground-muted">
              {zoneName} crowd pressure, projected
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {current.crowdPressure}%
              </span>
              <span className="text-xs text-foreground-muted">now</span>
              <span className="text-foreground-muted">→</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {plus20.crowdPressure}%
              </span>
              <span className="text-xs text-foreground-muted">in 20 min</span>
              <StatusBadge risk={pressureToRisk(plus20.crowdPressure)} />
            </div>
          </div>
        </div>
      </OperatorPanel>
    );
  }

  const rows = [
    { label: "Now", value: current },
    { label: "+10 min", value: plus10 },
    { label: "+20 min", value: plus20 },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg border border-border p-2.5 text-center">
          <p className="text-[11px] text-foreground-muted">{row.label}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {row.value.crowdPressure}%
          </p>
          <div className="mt-1 flex justify-center">
            <StatusBadge risk={pressureToRisk(row.value.crowdPressure)} />
          </div>
        </div>
      ))}
    </div>
  );
}
