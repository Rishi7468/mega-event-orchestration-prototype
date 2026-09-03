import type { RiskLevel } from "@/types";

const riskClasses: Record<RiskLevel, string> = {
  low: "bg-risk-low-bg text-risk-low",
  medium: "bg-risk-medium-bg text-risk-medium",
  high: "bg-risk-high-bg text-risk-high",
  critical: "bg-risk-critical-bg text-risk-critical",
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Moderate",
  high: "High",
  critical: "Critical",
};

type StatusBadgeProps = {
  risk: RiskLevel;
  label?: string;
};

/** A status label paired with color — never color alone (docs/09 #11 accessibility). */
export function StatusBadge({ risk, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${riskClasses[risk]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? riskLabel[risk]}
    </span>
  );
}
