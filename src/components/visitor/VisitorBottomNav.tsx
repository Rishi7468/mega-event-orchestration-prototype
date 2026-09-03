"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Radio, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/visitor", label: "Home", icon: Home },
  { href: "/visitor/plan", label: "Plan", icon: CalendarDays },
  { href: "/visitor/live", label: "Live", icon: Radio },
  { href: "/visitor/profile", label: "Profile", icon: User },
];

/** Four items max — the visitor should never have to think about navigation (docs/08_UI_SPEC.md #2). */
export function VisitorBottomNav() {
  const pathname = usePathname();

  return (
    // Sits below the scrolling <main> in a fixed-height column, so it stays
    // in place without needing sticky positioning.
    <nav className="shrink-0 flex items-center justify-around border-t border-border bg-surface/95 px-2 pb-2 pt-2 backdrop-blur">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/visitor" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-16 flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs ${
              active ? "text-foreground" : "text-foreground-muted"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
