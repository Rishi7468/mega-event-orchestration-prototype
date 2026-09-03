"use client";

import { Footprints, Navigation, Users } from "lucide-react";
import { Button, Card, Chip } from "@/components/shared";
import { gateToGateWalkMinutes } from "@/data";
import type { VenueGate } from "@/types";

type LiveEventCardProps = {
  currentGate: VenueGate;
  alternativeGate: VenueGate;
  onSwitch: () => void;
  onDismiss: () => void;
};

/**
 * Wireframe 9 — the in-the-moment state once the visitor is standing at a
 * congested gate. Unlike the pre-arrival re-optimization, switching now
 * costs a real cross-site walk, so the saving is stated net of that walk
 * rather than quoting the raw queue difference (docs/03 §11: expose
 * trade-offs).
 */
export function LiveEventCard({
  currentGate,
  alternativeGate,
  onSwitch,
  onDismiss,
}: LiveEventCardProps) {
  const netSaving =
    currentGate.estimatedWaitMinutes - alternativeGate.estimatedWaitMinutes - gateToGateWalkMinutes;

  if (netSaving <= 0) return null;

  return (
    <Card className="animate-fade-up overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border bg-risk-high-bg p-4">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-risk-high" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            You&apos;re near {currentGate.name}
          </p>
          <p className="mt-0.5 text-sm text-foreground-muted">Crowd levels are increasing here.</p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-3">
            <p className="truncate text-[11px] text-foreground-muted">Current · {currentGate.name}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {currentGate.estimatedWaitMinutes}
              <span className="ml-1 text-sm font-normal text-foreground-muted">min</span>
            </p>
            <p className="text-[11px] text-foreground-muted">Estimated wait</p>
          </div>
          <div className="rounded-xl border border-accent/40 bg-surface-muted p-3">
            <p className="truncate text-[11px] text-foreground-muted">
              Suggested · {alternativeGate.name}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {alternativeGate.estimatedWaitMinutes}
              <span className="ml-1 text-sm font-normal text-foreground-muted">min</span>
            </p>
            <p className="text-[11px] text-foreground-muted">Estimated wait</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
          <Footprints className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
          <span className="text-xs text-foreground-muted">
            {gateToGateWalkMinutes} min walk across
          </span>
          <Chip tone="positive">~{netSaving} min faster overall</Chip>
        </div>

        <Button className="mt-4 w-full" onClick={onSwitch}>
          <Navigation className="h-4 w-4" />
          Navigate to {alternativeGate.name}
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 h-11 w-full text-sm text-foreground-muted"
        >
          No thanks, stay at {currentGate.name}
        </button>
      </div>
    </Card>
  );
}
