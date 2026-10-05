"use client";

import type { Measurement } from "@/types";
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

type BeforeAfterDeltaCardProps = {
  measurement: Measurement;
  actionTitle?: string;
};

export function BeforeAfterDeltaCard({ measurement, actionTitle }: BeforeAfterDeltaCardProps) {
  const imp = measurement.impact;
  if (!imp) return null;

  const pressuredDelta = imp.pressuredAfter - imp.pressuredBefore;
  const transportDelta = imp.transportAfter - imp.transportBefore;

  // Dynamic evaluation using real measured state delta (NO hardcoded success)
  const isEffective = pressuredDelta <= -10;
  const isInsufficient = pressuredDelta > -10 && pressuredDelta < 0;

  const statusLabel = isEffective
    ? "Intervention Effective"
    : isInsufficient
      ? "Insufficient Improvement"
      : "Intervention Worsening";

  const statusBadgeStyle = isEffective
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : isInsufficient
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : "bg-risk-critical/20 text-risk-critical border-risk-critical/30";

  const cardBorderStyle = isEffective
    ? "border-emerald-500/30 bg-emerald-500/5"
    : isInsufficient
      ? "border-amber-500/30 bg-amber-500/5"
      : "border-risk-critical/30 bg-risk-critical/5";

  return (
    <div className={`rounded-xl border ${cardBorderStyle} p-4 space-y-3 transition-colors`}>
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          {isEffective ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          )}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            CLOSED-LOOP INTERVENTION MEASUREMENT
          </h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold border ${statusBadgeStyle}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* BEFORE */}
        <div className="bg-surface/80 rounded-lg p-3 border border-border/60">
          <span className="text-[10px] uppercase font-bold text-foreground-muted block mb-1">
            BEFORE INTERVENTION
          </span>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{imp.pressuredZoneName}</p>
            <p className="text-risk-critical font-bold text-sm">
              {imp.pressuredBefore}% Pressure
            </p>
            <p className="text-[11px] text-foreground-muted">
              Transit Utilization: {imp.transportBefore}%
            </p>
          </div>
        </div>

        {/* ACTION */}
        <div className="bg-surface/80 rounded-lg p-3 border border-border/60 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-accent-glow block mb-1">
              ACTION EXECUTED
            </span>
            <p className="font-semibold text-foreground text-xs leading-tight">
              {actionTitle ?? "Redirect Arrivals to Gate B"}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-foreground-muted mt-2 pt-1 border-t border-border/40">
            <ArrowRight className="h-3 w-3 text-accent-glow" />
            <span>Propagated to Visitor & Field</span>
          </div>
        </div>

        {/* AFTER */}
        <div className="bg-surface/80 rounded-lg p-3 border border-border/60">
          <span className="text-[10px] uppercase font-bold text-foreground-muted block mb-1">
            AFTER INTERVENTION
          </span>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{imp.pressuredZoneName}</p>
            <p className={`font-bold text-sm ${isEffective ? "text-emerald-400" : "text-amber-400"}`}>
              {imp.pressuredAfter}% Pressure
            </p>
            <p className="text-[11px] text-foreground-muted">
              Transit Utilization: {imp.transportAfter}%
            </p>
          </div>
        </div>

        {/* DELTA */}
        <div className={`rounded-lg p-3 border flex flex-col justify-between ${
          isEffective
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            : "bg-amber-500/15 border-amber-500/30 text-amber-300"
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold block mb-1 opacity-90">
              MEASURED DELTA
            </span>
            <div className="flex items-center gap-1 font-bold text-sm">
              {pressuredDelta <= 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              <span>{pressuredDelta}% Zone Pressure</span>
            </div>
            <p className="text-[11px] opacity-90 mt-1">
              Transit Load: {transportDelta}%
            </p>
          </div>
          <span className="text-[10px] opacity-80 font-medium">
            Evaluated via Site Telemetry Delta
          </span>
        </div>
      </div>
    </div>
  );
}
