"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Gauge, LayoutGrid, Users } from "lucide-react";
import { SimulationControl } from "./SimulationControl";

const NAV_ITEMS = [
  { href: "/operator", label: "Command Center", icon: LayoutGrid },
  { href: "/operator/demand", label: "Demand & Capacity", icon: Gauge },
  { href: "/operator/crowd", label: "Crowd Intelligence", icon: Users },
  { href: "/operator/interventions", label: "Interventions", icon: AlertTriangle },
];

export function OperatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface px-3 py-4">
      <div className="mb-6 px-1">
        <p className="text-sm font-semibold tracking-tight text-foreground">Orchestrate</p>
        <p className="text-[11px] text-foreground-muted">Destination intelligence</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/operator" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                active
                  ? "bg-surface-muted font-medium text-foreground"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4">
        <SimulationControl />
      </div>
    </aside>
  );
}
