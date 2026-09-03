import type { ReactNode } from "react";
import { event } from "@/data";
import { OperatorHeader } from "./OperatorHeader";
import { OperatorSidebar } from "./OperatorSidebar";

type OperatorShellProps = {
  children: ReactNode;
};

/** Desktop-only command-center frame: fixed sidebar, dense header, dark surface. */
export function OperatorShell({ children }: OperatorShellProps) {
  return (
    <div className="operator-theme flex min-h-dvh bg-background text-foreground">
      <OperatorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OperatorHeader event={event} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
