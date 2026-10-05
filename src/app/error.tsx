"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-risk-critical-bg text-risk-critical">
        <AlertOctagon className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">
        Operational View Unavailable
      </h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-foreground-muted">
        An unhandled issue occurred in this component frame. The orchestration state remains safe.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Retry Render
        </button>
        <Link
          href="/operator"
          className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}
