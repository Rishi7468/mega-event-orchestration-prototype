import type { ReactNode } from "react";
import { OperatorShell } from "@/components/operator";

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return <OperatorShell>{children}</OperatorShell>;
}
