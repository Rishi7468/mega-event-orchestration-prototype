import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import type { Destination, Origin } from "@/types";

type TripContextBarProps = {
  origin?: Origin;
  destination: Destination;
  /** Where tapping the bar goes to edit the intent. */
  href?: string;
};

/**
 * Origin → destination, always shown together so the visitor can see the
 * journey the system is planning: they are travelling *from* somewhere *to*
 * an event, not browsing a place.
 */
export function TripContextBar({ origin, destination, href = "/visitor/destination" }: TripContextBarProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-foreground-muted">Attending</p>
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">
            {origin?.city ?? "Your city"}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
          <span className="truncate text-sm font-medium text-foreground">{destination.name}</span>
        </div>
      </div>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
    </Link>
  );
}
