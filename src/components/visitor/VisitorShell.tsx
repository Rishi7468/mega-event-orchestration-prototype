"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { VisitorBottomNav } from "./VisitorBottomNav";
import { TransportSyncBridge } from "@/components/shared/TransportSyncBridge";

type VisitorShellProps = {
  children: ReactNode;
};

export function VisitorShell({ children }: VisitorShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col bg-background">

      {/* Headless background synchronization bridge */}
      <TransportSyncBridge variant="headless" />

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
