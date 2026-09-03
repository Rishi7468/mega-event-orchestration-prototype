"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { VisitorBottomNav } from "./VisitorBottomNav";

type VisitorShellProps = {
  children: ReactNode;
};

/**
 * Mobile-first frame: the app fills whatever screen it is given — the real
 * viewport on mobile, the device screen on desktop — and scrolls internally
 * so the bottom nav stays put.
 *
 * Keying <main> on the pathname remounts it per route, which gives each
 * screen a short enter transition and resets scroll position between
 * screens the way a native app does.
 *
 * `app-scroll` hides the scrollbar track (see globals.css) so the surface
 * reads as an application rather than a web page; scrolling is unchanged.
 *
 * The shell intentionally renders no header: Home shows the location/alerts
 * bar while sub-screens show a back header, so each page owns its own
 * top-of-screen context.
 */
export function VisitorShell({ children }: VisitorShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <main
        key={pathname}
        className="app-scroll animate-page-in flex-1 overflow-y-auto overflow-x-hidden px-5 pb-6"
      >
        {children}
      </main>
      <VisitorBottomNav />
    </div>
  );
}
