import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "positive" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-foreground-muted",
  accent: "bg-accent text-accent-foreground",
  positive: "bg-risk-low-bg text-risk-low",
  warning: "bg-risk-high-bg text-risk-high",
};

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
