"use client";

import { Minus, Plus } from "lucide-react";

type StepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
};

/** 44px touch targets — thumb-friendly per docs/09_MOBILE_UX_PRINCIPLES.md #4. */
export function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  format = String,
}: StepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground-muted">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center text-sm font-semibold text-foreground tabular-nums">
          {format(value)}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-foreground disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
