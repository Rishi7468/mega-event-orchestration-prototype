"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Gauge, LayoutGrid, Users, Menu, ChevronLeft } from "lucide-react";
import { BrandMark } from "@/components/shared";
import { SimulationControl } from "./SimulationControl";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";

const NAV_ITEMS = [
  { href: "/operator", label: "Command Center", icon: LayoutGrid },
  { href: "/operator/demand", label: "Demand & Capacity", icon: Gauge },
  { href: "/operator/crowd", label: "Crowd Intelligence", icon: Users },
  { href: "/operator/interventions", label: "Interventions", icon: AlertTriangle },
];

export function OperatorSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useEventAuthoringStore();

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border bg-surface py-4 transition-all duration-300 z-30 ${
        isSidebarCollapsed ? "w-14 px-2" : "w-60 px-3"
      }`}
    >
      <div className="mb-4 flex items-center justify-between px-1">
        {!isSidebarCollapsed && <BrandMark />}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          title={isSidebarCollapsed ? "Expand Sidebar (☰)" : "Collapse Sidebar"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-muted/80 text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-all"
        >
          {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/operator" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={isSidebarCollapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-all ${
                active
                  ? "bg-indigo-500/15 font-bold text-indigo-400 border border-indigo-500/30"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              } ${isSidebarCollapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {!isSidebarCollapsed && (
        <div className="mt-4">
          <SimulationControl />
        </div>
      )}
    </aside>
  );
}
