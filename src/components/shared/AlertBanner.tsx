import type { ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";

type Tone = "advisory" | "critical" | "positive";

const toneClasses: Record<Tone, string> = {
  advisory: "border-risk-high/30 bg-risk-high-bg",
  critical: "border-risk-critical/30 bg-risk-critical-bg",
  positive: "border-risk-low/30 bg-risk-low-bg",
};

const toneIconClasses: Record<Tone, string> = {
  advisory: "text-risk-high",
  critical: "text-risk-critical",
  positive: "text-risk-low",
};

type AlertBannerProps = {
  tone?: Tone;
  title: string;
  message: string;
  action?: ReactNode;
};

/**
 * Calm by default — advisory, not alarming (docs/09_MOBILE_UX_PRINCIPLES.md #7).
 */
export function AlertBanner({ tone = "advisory", title, message, action }: AlertBannerProps) {
  const Icon = tone === "positive" ? Info : AlertTriangle;

  return (
    <div className={`animate-fade-up rounded-2xl border p-3.5 ${toneClasses[tone]}`}>
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${toneIconClasses[tone]}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-sm leading-snug text-foreground-muted">{message}</p>
          {action && <div className="mt-2.5">{action}</div>}
        </div>
      </div>
    </div>
  );
}
