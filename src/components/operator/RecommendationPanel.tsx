"use client";

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { OperatorPanel } from "./OperatorPanel";
import type { RedistributionImpact } from "@/lib/recommendation";
import type { Recommendation, SimulationPhase } from "@/types";

type RecommendationPanelProps = {
  recommendation: Recommendation | null;
  impact: RedistributionImpact | null;
  phase: SimulationPhase;
  onApprove: () => void;
};

const metricDelta = (before: number, after: number) => {
  const delta = after - before;
  const positive = delta < 0; // pressure dropping is the good direction
  return { text: `${before}% → ${after}%`, tone: positive ? "text-risk-low" : "text-risk-high" };
};

/**
 * The organiser's single most important control: what to do, why, what it
 * costs the pressured zone and gains the spare one, and one button to make
 * it real. Reads the same recommendation engine the visitor-facing copy
 * comes from — never a separate algorithm inside the page (docs/07 §7).
 */
export function RecommendationPanel({ recommendation, impact, phase, onApprove }: RecommendationPanelProps) {
  const canApprove = phase === "recommendation" || phase === "accepted";
  const alreadyApproved = phase === "response" || phase === "outcome";

  if (alreadyApproved) {
    return (
      <OperatorPanel title="Recommended Intervention">
        <div className="flex items-start gap-2.5 rounded-lg bg-risk-low-bg p-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-risk-low" />
          <div>
            <p className="text-sm font-medium text-foreground">Response approved</p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Demand redistribution is in effect. See Outcome below for the measured impact.
            </p>
          </div>
        </div>
      </OperatorPanel>
    );
  }

  if (!recommendation || !impact) {
    return (
      <OperatorPanel title="Recommended Intervention">
        <p className="text-xs text-foreground-muted">
          No intervention recommended — all zones are within normal operating parameters.
        </p>
      </OperatorPanel>
    );
  }

  const pressured = metricDelta(impact.pressuredBefore, impact.pressuredAfter);
  const spare = metricDelta(impact.spareBefore, impact.spareAfter);
  const transport = metricDelta(impact.transportBefore, impact.transportAfter);

  return (
    <OperatorPanel title="Recommended Intervention">
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{recommendation.title}</p>
          <ul className="mt-1 space-y-0.5">
            {recommendation.reason.map((line) => (
              <li key={line} className="text-xs leading-snug text-foreground-muted">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-surface-muted p-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
          Expected impact if approved
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-foreground-muted">{impact.pressuredZoneName}</p>
            <p className={`font-semibold tabular-nums ${pressured.tone}`}>{pressured.text}</p>
          </div>
          <div>
            <p className="text-foreground-muted">{impact.spareZoneName}</p>
            <p className={`font-semibold tabular-nums ${spare.tone}`}>{spare.text}</p>
          </div>
          <div>
            <p className="text-foreground-muted">Transport</p>
            <p className={`font-semibold tabular-nums ${transport.tone}`}>{transport.text}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onApprove}
        disabled={!canApprove}
        className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-accent text-sm font-medium text-accent-foreground disabled:opacity-40"
      >
        Approve Response
        <ArrowRight className="h-4 w-4" />
      </button>
      {phase === "accepted" && (
        <p className="mt-1.5 text-center text-[11px] text-foreground-muted">
          A visitor has already accepted a related route change.
        </p>
      )}
    </OperatorPanel>
  );
}
