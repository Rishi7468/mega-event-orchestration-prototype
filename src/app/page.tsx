import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DemoStateNotice } from "@/components/shared/DemoStateNotice";
import { destinations, primaryDestination } from "@/data";

/**
 * Minimal entry point ahead of the two experiences (docs/08_UI_SPEC.md #1).
 * Not a product screen in its own right — just a fork into /visitor or /operator.
 */
export default function EntryPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-background px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-medium text-foreground-muted">
          Destination orchestration for high-footfall events
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Mega-Event Hospitality Orchestration
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
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
