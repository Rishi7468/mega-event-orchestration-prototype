"use client";

import { RotateCcw, Zap } from "lucide-react";
import { resetDemo, runDemoScenario } from "@/lib/demo";
import { useSimulationStore } from "@/store/simulationStore";

/**
 * Demo-only controls, styled deliberately quiet so they never read as
 * product UI. Both actions delegate to lib/demo.ts, so the visitor and
 * organiser surfaces trigger and reset the scenario identically.
 */
export function DemoControls() {
  const phase = useSimulationStore((state) => state.phase);

  return (
    <div className="mt-6 rounded-xl border border-dashed border-border px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="shrink-0 text-[11px] uppercase tracking-wide text-foreground-muted">
          Demo · {phase.replace("-", " ")}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={runDemoScenario}
            disabled={phase !== "normal"}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-30"
          >
            <Zap className="h-3.5 w-3.5" />
            Simulate demand spike
          </button>
          <button
            type="button"
            onClick={resetDemo}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo
          </button>
        </div>
      </div>
    </div>
  );
}
