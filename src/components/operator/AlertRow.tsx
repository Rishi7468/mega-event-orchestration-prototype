import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import type { Alert } from "@/types";

const toneIcon = { critical: AlertOctagon, advisory: AlertTriangle, info: Info } as const;
const toneClasses = {
  critical: "border-l-risk-critical text-risk-critical",
  advisory: "border-l-risk-medium text-risk-medium",
  info: "border-l-risk-low text-risk-low",
} as const;

export function AlertRow({ alert }: { alert: Alert }) {
  const Icon = toneIcon[alert.tone];

  return (
    <div className={`border-l-2 py-2 pl-3 ${toneClasses[alert.tone]}`}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold text-foreground">{alert.title}</p>
            <span className="shrink-0 text-[10px] text-foreground-muted">{alert.createdAt}</span>
          </div>
          <p className="mt-0.5 text-xs leading-snug text-foreground-muted">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}
