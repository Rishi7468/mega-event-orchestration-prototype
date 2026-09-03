import type { ReactNode } from "react";

/**
 * Presentation-only shell. On a desktop viewport the visitor app is rendered
 * inside a restrained phone frame so it reads as a mobile application rather
 * than a narrow web page; below the `md` breakpoint the frame collapses
 * entirely and the app fills the viewport as a real mobile app would.
 *
 * Deliberately a single DOM tree with CSS-driven breakpoints rather than two
 * conditional renders — rendering the app twice would duplicate state
 * subscriptions and give every element a phantom twin.
 *
 * Nothing in here is part of the application UI itself.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-background md:items-center md:bg-surface-muted md:p-8">
      <div
        className="
          relative w-full
          md:w-auto md:rounded-[3rem] md:border md:border-border md:bg-[#0d0d0f]
          md:p-[10px] md:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]
        "
      >
        {/* Speaker line — a subtle frame detail, not a Dynamic-Island prop.
            Sits in the bezel padding above the screen, so it never overlaps
            app content; hidden on real mobile where there's no frame. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[5px] z-20 hidden h-[3px] w-14 -translate-x-1/2 rounded-full bg-white/10 md:block"
        />

        <div
          className="
            relative h-dvh w-full overflow-hidden bg-background
            md:h-[min(844px,calc(100dvh-6rem))] md:w-[390px] md:rounded-[2.5rem]
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}
