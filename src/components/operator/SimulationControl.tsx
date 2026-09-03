"use client";

import { CheckCircle2, RotateCcw, Zap } from "lucide-react";
import { resetDemo, runDemoScenario } from "@/lib/demo";
import { useSimulationStore } from "@/store/simulationStore";

/**
 * The organiser's half of the shared demo controls — the same lib/demo.ts
 * actions the visitor surface uses, so triggering or resetting from either
 * side drives both.
 *
 * Deliberately quiet and tucked into the sidebar footer: this is a demo
 * convenience, not part of the operational interface itself.
 */
export function SimulationControl() {
  const phase = useSimulationStore((state) => state.phase);
  const approveResponse = useSimulationStore((state) => state.approveOperatorResponse);

  const canApprove = phase === "recommendation" || phase === "accepted";

  const buttonClasses =
    "flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-xs text-foreground-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-30";

  return (
    <div className="rounded-lg border border-dashed border-border p-2.5">
      <p className="mb-2 text-[10px] uppercase tracking-wide text-foreground-muted">
        Demo · {phase.replace("-", " ")}
      </p>
      <div className="space-y-1">
        <button
          type="button"
          onClick={runDemoScenario}
          disabled={phase !== "normal"}
          className={buttonClasses}
        >
          <Zap className="h-3.5 w-3.5" />
          Simulate demand spike
        </button>
        <button
          type="button"
          onClick={() => approveResponse()}
          disabled={!canApprove}
          className={buttonClasses}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approve response
        </button>
        <button type="button" onClick={resetDemo} className={buttonClasses}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset demo
        </button>
      </div>
    </div>
  );
}
