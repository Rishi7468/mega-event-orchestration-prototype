"use client";

import { Bell } from "lucide-react";
import type { Event } from "@/types";
import { getOperatorAlerts } from "@/lib/recommendation";
import { getGatesForPhase, getRoutesForPhase } from "@/lib/conditions";
import { useSimulationStore } from "@/store/simulationStore";

type OperatorHeaderProps = {
  event: Event;
};

export function OperatorHeader({ event }: OperatorHeaderProps) {
  const phase = useSimulationStore((state) => state.phase);
  const zoneSnapshots = useSimulationStore((state) => state.zoneSnapshots);
  const alertCount = getOperatorAlerts(
    zoneSnapshots,
    getGatesForPhase(phase),
    getRoutesForPhase(phase),
  ).length;

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      <div>
        <h1 className="text-sm font-semibold tracking-wide text-foreground">
          MEGA EVENT OPERATIONS COMMAND CENTER
        </h1>
        <p className="text-xs text-foreground-muted">{event.name}</p>
      </div>
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Alerts"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border"
        >
          <Bell className="h-4 w-4 text-foreground-muted" />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-risk-critical text-[10px] font-medium text-white">
              {alertCount}
            </span>
          )}
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xs font-medium text-foreground-muted">
          OP
        </div>
      </div>
    </header>
  );
}
