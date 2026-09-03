import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

type VisitorPageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref: string;
  action?: ReactNode;
};

export function VisitorPageHeader({ title, subtitle, backHref, action }: VisitorPageHeaderProps) {
  return (
    <div className="flex items-start gap-2 pt-5 pb-4">
      <Link
        href={backHref}
        aria-label="Back"
        className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold leading-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-foreground-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
