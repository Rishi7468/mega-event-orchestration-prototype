import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-foreground-muted">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">404 — Page Not Found</h1>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-foreground-muted">
        The requested route does not exist within the orchestration platform.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
        >
          Visitor Experience
        </Link>
        <Link
          href="/operator"
          className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
        >
          Operator Command Center
        </Link>
      </div>
    </div>
  );
}
