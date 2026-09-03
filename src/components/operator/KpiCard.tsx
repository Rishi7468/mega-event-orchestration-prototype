type Tone = "neutral" | "low" | "medium" | "high" | "critical";

const toneClasses: Record<Tone, string> = {
  neutral: "text-foreground",
  low: "text-risk-low",
  medium: "text-risk-medium",
  high: "text-risk-high",
  critical: "text-risk-critical",
};

type KpiCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  tone?: Tone;
};

export function KpiCard({ label, value, sublabel, tone = "neutral" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-foreground-muted">{sublabel}</p>}
    </div>
  );
}
