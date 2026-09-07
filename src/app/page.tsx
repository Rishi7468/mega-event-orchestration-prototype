import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandWordmark } from "@/components/shared/BrandWordmark";
import { DemoStateNotice } from "@/components/shared/DemoStateNotice";
import { destinations, primaryDestination } from "@/data";

/**
 * Minimal entry point ahead of the two experiences (docs/08_UI_SPEC.md #1).
 * Not a marketing page — just a product introduction and a fork into
 * /visitor or /operator. The wordmark carries the identity; everything below
 * it stays factual (what the two experiences do, what's actually modelled).
 */
export default function EntryPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-12 bg-background px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          <BrandWordmark />
        </h1>
        <p className="mt-3 text-sm font-medium text-foreground-muted sm:text-base">
          Destination intelligence for mega-events
        </p>
        <p className="mx-auto mt-5 max-w-md text-sm text-foreground-muted">
          One intelligence layer, two experiences: a visitor plan that adapts, and a
          destination view that coordinates.
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs text-foreground-muted">
          {destinations.length} events in the catalogue ·{" "}
          <span className="font-medium text-foreground">{primaryDestination.name}</span> is the
          fully modelled demo scenario
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <Link
          href="/visitor"
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-foreground/20"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Mobile-first
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-foreground">Visitor Experience</h2>
          <p className="mt-1.5 text-sm text-foreground-muted">
            Plan your stay, journey, and venue access — and adapt in real time.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            Open visitor app
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/operator"
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-foreground/20"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Desktop command center
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-foreground">Operator Experience</h2>
          <p className="mt-1.5 text-sm text-foreground-muted">
            See demand, capacity, and crowd pressure — and approve interventions.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            Open command center
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <DemoStateNotice />
    </div>
  );
}
