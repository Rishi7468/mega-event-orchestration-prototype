"use client";

import { RotateCcw } from "lucide-react";
import { resetDemo } from "@/lib/demo";
import { useSimulationStore } from "@/store/simulationStore";

/**
 * Destination conditions persist across reloads so two browser tabs can stay
 * in sync — which means a presenter can land on this page with a scenario
 * still part-way through from a previous run. Rather than silently resetting
 * (which would wipe a demo in progress in another tab), surface it and let
 * them decide. Renders nothing at all when conditions are already normal.
 */
export function DemoStateNotice() {
  const phase = useSimulationStore((state) => state.phase);
  if (phase === "normal") return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-xl border border-border bg-surface px-4 py-2.5">
      <p className="text-xs text-foreground-muted">
        A scenario is part-way through —{" "}
        <span className="font-medium text-foreground">{phase.replace("-", " ")}</span>
      </p>
      <button
        type="button"
        onClick={resetDemo}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset to a clean state
      </button>
    </div>
  );
}
