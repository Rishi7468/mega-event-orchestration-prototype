import Link from "next/link";
import { Monitor } from "lucide-react";
import { BrandWordmark } from "@/components/shared";

/**
 * Shown instead of the command center below the `lg` breakpoint (1024px) —
 * the point at which the operator's fixed sidebar plus its multi-column
 * panels genuinely stop having room to work, not an arbitrary cutoff. Below
 * it, a phone or a narrow tablet gets this notice; at `lg` and above, nothing
 * here is visible and the full desktop shell renders exactly as before.
 *
 * Purely a CSS-driven toggle (see OperatorShell) — this component and the
 * real shell both stay mounted, and only one is ever painted. That means no
 * viewport detection in JavaScript, no hydration timing to get right, and no
 * flash of the desktop layout on a phone even for a frame.
 *
 * Sized with `min-h-full` against the parent's fixed `h-dvh` box, not its own
 * `min-h-dvh` — on a short/landscape phone this content is taller than one
 * viewport, and centering it inside a box that's allowed to grow past the
 * viewport is exactly how the page itself used to end up taller than the
 * screen. The parent caps the box at the viewport and scrolls internally
 * instead, so this component only ever needs to fill (and centre within)
 * whatever height it's actually given.
 */
export function OperatorDesktopGate() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-8">
      <div className="animate-fade-up w-full max-w-xs rounded-2xl border border-border bg-surface p-6 text-center">
        <Monitor aria-hidden className="mx-auto h-8 w-8 text-foreground-muted" />

        <p className="mt-4 text-2xl font-semibold text-foreground">
          <BrandWordmark />
        </p>
        <h1 className="mt-1 text-sm font-medium tracking-wide text-foreground-muted">
          Operator Console
        </h1>

        <p className="mt-5 text-sm font-semibold text-foreground">Optimized for desktop</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
          The command center — the live operational map, crowd intelligence, demand and capacity
          views, and intervention controls — needs more room than a phone screen can give it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          Open Pravaah on a desktop or laptop for the full experience.
        </p>

        <Link
          href="/"
          className="mt-5 inline-block text-xs font-medium text-foreground-muted underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Back to Pravaah
        </Link>
      </div>
    </div>
  );
}
