import type { ReactNode } from "react";
import { event } from "@/data";
import { OperatorDesktopGate } from "./OperatorDesktopGate";
import { OperatorHeader } from "./OperatorHeader";
import { OperatorSidebar } from "./OperatorSidebar";

type OperatorShellProps = {
  children: ReactNode;
};

/**
 * Desktop-only command-center frame: fixed sidebar, dense header, dark
 * surface. Below `lg` (1024px) the fixed-width sidebar plus the dashboard's
 * multi-column panels have nowhere to go, so the shell itself is hidden and
 * `OperatorDesktopGate` takes its place instead — a deliberate notice rather
 * than a squeezed, broken layout.
 *
 * Both branches are always in the tree; only `hidden`/`lg:flex` decide which
 * one paints. That keeps this a pure CSS media-query switch — the same
 * pattern DeviceFrame uses for the visitor shell — with no viewport
 * JavaScript and nothing that could cause a hydration mismatch.
 *
 * Two things matter for the mobile branch specifically, because `<body>` is
 * shared with the (light-themed) visitor app and can't be recoloured here:
 *
 *  1. The dark background is a `fixed inset-0` layer, not a colour that
 *     relies on some element's height happening to reach the bottom of the
 *     page. A height reached via `min-h-dvh` on nested elements is only ever
 *     a *floor* — on a short/landscape phone the notice's own content is
 *     taller than that floor, the box grows past it, and whatever covers the
 *     remainder depends on every ancestor's height chain agreeing, which
 *     `html`/`body` do via ambiguous `%`-based sizing rather than viewport
 *     units. A fixed, viewport-anchored layer has no such chain to get out
 *     of sync — it always covers exactly what's currently on screen.
 *  2. The notice branch is `h-dvh overflow-y-auto` (a capped box that
 *     scrolls internally) rather than `min-h-dvh` (a floor the box can grow
 *     past). That keeps `<body>` itself pinned to one viewport height on
 *     mobile no matter how tall the notice's content gets, so the hidden
 *     desktop dashboard — and the page's own scroll height — can never be
 *     affected by which branch is showing.
 *
 * The desktop branch has the same "floor vs. cap" issue, independent of the
 * mobile notice: it was `min-h-dvh`, so on a content-heavy page (the crowd
 * page's camera grid, say) the row grows past one viewport instead of
 * capping there, and the whole document scrolls — taking the "fixed"
 * sidebar with it. `main` already carries `overflow-y-auto` for exactly this
 * case; it just never had a capped ancestor + `min-h-0` to make that
 * overflow trigger instead of the flex column growing past its content's
 * automatic minimum size. `h-dvh` on the row plus `min-h-0` down the column
 * gives `main` an actual bounded box to scroll within, so the sidebar and
 * header stay put and only the content pane scrolls — the behaviour the
 * "fixed sidebar" in the comment above already describes.
 */
export function OperatorShell({ children }: OperatorShellProps) {
  return (
    <div className="operator-theme text-foreground">
      <div aria-hidden className="fixed inset-0 -z-10 bg-background pointer-events-none" />

      <div className="h-dvh overflow-y-auto lg:hidden">
        <OperatorDesktopGate />
      </div>

      <div className="hidden h-dvh lg:flex">
        <OperatorSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <OperatorHeader event={event} />
          <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
