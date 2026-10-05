"use client";

import type { SituationAssessment } from "@/types";
import { AlertOctagon, CheckCircle2, ChevronRight, ShieldAlert, Sparkles } from "lucide-react";

type SituationalIntelligencePanelProps = {
  assessment: SituationAssessment;
  onApprove: (assessment: SituationAssessment) => void;
  onDismiss?: (id: string) => void;
  isProcessing?: boolean;
};

export function SituationalIntelligencePanel({
  assessment,
  onApprove,
  onDismiss,
  isProcessing = false,
}: SituationalIntelligencePanelProps) {
  const action = assessment.recommendedAction;
  const isCritical = assessment.severity === "CRITICAL";

  return (
    <div
      className={`rounded-xl border ${
        isCritical
          ? "border-risk-critical/50 bg-risk-critical/5"
          : "border-amber-500/40 bg-amber-500/5"
      } p-5 space-y-4 shadow-lg`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2.5">
          {isCritical ? (
            <ShieldAlert className="h-5 w-5 text-risk-critical animate-pulse" />
          ) : (
            <AlertOctagon className="h-5 w-5 text-amber-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-extrabold tracking-wider ${
                  isCritical
                    ? "bg-risk-critical/20 text-risk-critical border border-risk-critical/40"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }`}
              >
                {assessment.severity} PRIORITY SITUATION
              </span>
              <span className="text-[10px] text-foreground-muted font-mono">
                Detected {assessment.detectedAt}
              </span>
            </div>
            <h2 className="text-base font-bold text-foreground mt-0.5">
              {assessment.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-foreground-muted bg-surface/60 px-2.5 py-1 rounded-md border border-border/40">
          <Sparkles className="h-3 w-3 text-accent-glow" />
          <span>Rule Confidence: {assessment.confidence}%</span>
        </div>
      </div>

      {/* Grid: What's Happening & Why It Matters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* WHAT'S HAPPENING */}
        <div className="bg-surface/80 rounded-lg p-3.5 border border-border/60 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-accent-glow block">
            WHAT&apos;S HAPPENING
          </span>
          <p className="text-foreground leading-relaxed">
            {assessment.whatIsHappening}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40 font-mono text-[11px]">
            {assessment.signals.map((sig, i) => (
              <span key={i} className="bg-background/80 px-2 py-1 rounded border border-border/50 text-foreground-muted">
                {sig.metric}: <strong className="text-foreground">{sig.value}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* WHY IT MATTERS */}
        <div className="bg-surface/80 rounded-lg p-3.5 border border-border/60 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
            WHY IT MATTERS
          </span>
          <p className="text-foreground leading-relaxed">
            {assessment.whyItMatters}
          </p>
          <div className="text-[10px] text-foreground-muted pt-1 border-t border-border/40">
            Sector: <strong className="text-foreground">{assessment.zoneName}</strong>
          </div>
        </div>
      </div>

      {/* RECOMMENDED ACTION */}
      {action && (
        <div className="bg-surface-card rounded-lg p-4 border border-accent-glow/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent-glow uppercase tracking-wider">
              RECOMMENDED INTERVENTION
            </span>
            <span className="text-[10px] text-foreground-muted font-mono">
              Target: {action.target}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4 text-accent-glow" />
              {action.label}
            </h3>
            <p className="text-foreground-muted leading-relaxed pl-5">
              <strong className="text-foreground">Rationale: </strong>
              {action.rationale}
            </p>
            <p className="text-foreground-muted leading-relaxed pl-5">
              <strong className="text-emerald-400">Expected Effect: </strong>
              {action.expectedEffect}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
            <span className="text-[10px] text-foreground-muted italic">
              Evaluated deterministically via event thresholds
            </span>
            <div className="flex items-center gap-2">
              {onDismiss && (
                <button
                  onClick={() => onDismiss(assessment.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                >
                  Dismiss
                </button>
              )}
              <button
                disabled={isProcessing || assessment.status === "EXECUTING"}
                onClick={() => onApprove(assessment)}
                className="flex items-center gap-1.5 rounded-lg bg-accent-glow hover:bg-accent-glow/90 text-background text-xs font-bold px-4 py-2 transition-all shadow-md disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {assessment.status === "EXECUTING"
                  ? "Intervention Executing..."
                  : isProcessing
                    ? "Applying..."
                    : "APPROVE INTERVENTION"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
