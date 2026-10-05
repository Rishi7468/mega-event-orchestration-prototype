"use client";

import type { SystemIntelligencePulse } from "@/types";
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

type EventPulseCardProps = {
  pulse: SystemIntelligencePulse;
};

export function EventPulseCard({ pulse }: EventPulseCardProps) {
  const statusStyles: Record<
    SystemIntelligencePulse["overallCondition"],
    { bg: string; border: string; text: string; icon: typeof Activity }
  > = {
    STABLE: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", icon: CheckCircle2 },
    WATCH: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: Activity },
    ELEVATED: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", icon: AlertTriangle },
    CRITICAL: { bg: "bg-risk-critical/15", border: "border-risk-critical/40", text: "text-risk-critical", icon: ShieldAlert },
  };

  const style = statusStyles[pulse.overallCondition];
  const Icon = style.icon;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4 backdrop-blur-md transition-colors`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${style.text}`} />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            EVENT OPERATIONAL PULSE
          </h2>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
          {pulse.overallCondition}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
        <div className="rounded-lg border border-border/50 bg-surface/50 p-2.5">
          <span className="text-[10px] text-foreground-muted uppercase font-medium block">Active Situations</span>
          <strong className="text-base font-bold tabular-nums text-foreground">{pulse.activeSituationsCount}</strong>
        </div>
        <div className="rounded-lg border border-border/50 bg-surface/50 p-2.5">
          <span className="text-[10px] text-foreground-muted uppercase font-medium block">High Priority</span>
          <strong className={`text-base font-bold tabular-nums ${pulse.highPriorityCount > 0 ? "text-risk-critical" : "text-foreground"}`}>
            {pulse.highPriorityCount}
          </strong>
        </div>
        <div className="rounded-lg border border-border/50 bg-surface/50 p-2.5">
          <span className="text-[10px] text-foreground-muted uppercase font-medium block">Active Interventions</span>
          <strong className="text-base font-bold tabular-nums text-accent-glow">{pulse.activeInterventionsCount}</strong>
        </div>
        <div className="rounded-lg border border-border/50 bg-surface/50 p-2.5">
          <span className="text-[10px] text-foreground-muted uppercase font-medium block">Trend Impact</span>
          <span className="text-xs font-semibold text-emerald-400">
            {pulse.improvingCount > 0 ? "Improving" : pulse.worseningCount > 0 ? "Worsening" : "Stable"}
          </span>
        </div>
      </div>
    </div>
  );
}
