"use client";

import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type InterventionAvailability = { available: boolean; reason: string };

type InterventionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  availability: InterventionAvailability;
  actionLabel: string;
};

/**
 * A single organiser action. Availability is computed by the caller from
 * live mock data (route capacity, zone pressure, gate waits) — this
 * component only renders the constraint, it never invents one
 * (docs §14 "constraint-aware actions").
 */
export function InterventionCard({
  icon: Icon,
  title,
  description,
  availability,
  actionLabel,
}: InterventionCardProps) {
  const [initiated, setInitiated] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{description}</p>

          {!availability.available && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-muted px-2.5 py-2">
              <Lock className="mt-0.5 h-3 w-3 shrink-0 text-foreground-muted" />
              <p className="text-[11px] leading-snug text-foreground-muted">{availability.reason}</p>
            </div>
          )}

          <button
            type="button"
            disabled={!availability.available || initiated}
            onClick={() => setInitiated(true)}
            className="mt-3 flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground disabled:opacity-40"
          >
            {initiated ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-risk-low" />
                Initiated
              </>
            ) : (
              actionLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
