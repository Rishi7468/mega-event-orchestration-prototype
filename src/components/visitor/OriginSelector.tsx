"use client";

import { MapPin } from "lucide-react";
import { origins } from "@/data";

type OriginSelectorProps = {
  originId: string;
  onChange: (originId: string) => void;
};

/**
 * The journey's starting point, chosen explicitly — no geolocation API and
 * no permission prompt, which keeps the demo deterministic (docs/09 §9).
 */
export function OriginSelector({ originId, onChange }: OriginSelectorProps) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <MapPin className="h-4 w-4 shrink-0 text-foreground-muted" />
      <span className="shrink-0 text-sm text-foreground-muted">From</span>
      <select
        value={originId}
        onChange={(changeEvent) => onChange(changeEvent.target.value)}
        aria-label="Travelling from"
        className="min-w-0 flex-1 rounded bg-transparent text-right text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {origins.map((origin) => (
          <option key={origin.id} value={origin.id}>
            {origin.city}
          </option>
        ))}
      </select>
    </label>
  );
}
