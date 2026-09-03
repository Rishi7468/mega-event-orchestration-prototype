import type { LucideIcon } from "lucide-react";

type StatProps = {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
};

/** Glanceable metric: big value, quiet label (docs/09 §5). */
export function Stat({ label, value, sublabel, icon: Icon }: StatProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-foreground-muted">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate text-xs">{label}</span>
      </div>
      <p className="mt-0.5 truncate text-base font-semibold text-foreground">{value}</p>
      {sublabel && <p className="truncate text-[11px] text-foreground-muted">{sublabel}</p>}
    </div>
  );
}
