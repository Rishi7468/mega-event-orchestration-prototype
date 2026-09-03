import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  action?: ReactNode;
  note?: string;
};

export function SectionHeading({ title, action, note }: SectionHeadingProps) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action ?? (note && <span className="shrink-0 text-xs text-foreground-muted">{note}</span>)}
    </div>
  );
}
