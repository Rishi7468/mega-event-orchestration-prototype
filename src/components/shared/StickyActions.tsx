import type { ReactNode } from "react";

/**
 * Pins the screen's primary action to the bottom of the scroll area so the
 * one obvious next step is always in thumb reach (docs/09 §2).
 * Negative margins cancel the shell's horizontal padding so the blur band
 * spans the full width.
 */
export function StickyActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-6 border-t border-border bg-background/95 px-5 pb-3 pt-3 backdrop-blur">
      {children}
    </div>
  );
}
